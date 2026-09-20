from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload

from .. import models, schemas, auth, fenetre
from ..database import get_db

router = APIRouter(prefix="/commandes", tags=["commandes"])


@router.get("/fenetre", response_model=schemas.StatutFenetre)
def statut_fenetre(db: Session = Depends(get_db)):
    now = fenetre.heure_actuelle()
    h_ouverture, h_fermeture = fenetre.get_horaires(db)
    return schemas.StatutFenetre(
        ouverte=fenetre.fenetre_ouverte(db),
        heure_ouverture=f"{h_ouverture}h00",
        heure_fermeture=f"{h_fermeture}h00",
        heure_serveur=now.strftime("%H:%M"),
    )


@router.post("", response_model=schemas.CommandeOut)
def passer_commande(
    payload: schemas.CommandeCreate,
    db: Session = Depends(get_db),
    employe: models.Employe = Depends(auth.get_employe_courant),
):
    # Vérification stricte côté serveur : ne jamais faire confiance à l'heure du client
    fenetre.verifier_fenetre_ouverte(db)

    if not payload.lignes:
        raise HTTPException(status_code=400, detail="Choisissez au moins un plat")

    aujourdhui = fenetre.heure_actuelle().date()

    # Un seul commande par employé et par jour (elle peut contenir plusieurs plats)
    debut_jour = fenetre.heure_actuelle().replace(hour=0, minute=0, second=0, microsecond=0)
    deja_commande = (
        db.query(models.Commande)
        .filter(
            models.Commande.employe_id == employe.id,
            models.Commande.cree_le >= debut_jour.replace(tzinfo=None),
            models.Commande.statut != models.OrderStatus.ANNULEE,
        )
        .first()
    )
    if deja_commande:
        raise HTTPException(
            status_code=400, detail="Vous avez déjà passé une commande aujourd'hui"
        )

    # Vérifier que chaque plat demandé fait bien partie du menu du jour
    ids_menu_du_jour = {
        m.plat_id
        for m in db.query(models.MenuJour).filter(models.MenuJour.date == aujourdhui).all()
    }
    for ligne in payload.lignes:
        if ligne.plat_id not in ids_menu_du_jour:
            raise HTTPException(
                status_code=404,
                detail="Un des plats choisis ne fait pas partie du menu d'aujourd'hui",
            )
        if ligne.quantite < 1:
            raise HTTPException(status_code=400, detail="La quantité doit être d'au moins 1")

    commande = models.Commande(employe_id=employe.id)
    db.add(commande)
    db.flush()  # pour obtenir commande.id avant de créer les lignes

    for ligne in payload.lignes:
        db.add(
            models.LigneCommande(
                commande_id=commande.id, plat_id=ligne.plat_id, quantite=ligne.quantite
            )
        )

    db.commit()
    db.refresh(commande)
    return commande


@router.get("/mes-commandes", response_model=list[schemas.CommandeOut])
def mes_commandes(
    db: Session = Depends(get_db),
    employe: models.Employe = Depends(auth.get_employe_courant),
):
    return (
        db.query(models.Commande)
        .options(
            joinedload(models.Commande.lignes).joinedload(models.LigneCommande.plat),
            joinedload(models.Commande.employe),
        )
        .filter(models.Commande.employe_id == employe.id)
        .order_by(models.Commande.cree_le.desc())
        .limit(30)
        .all()
    )