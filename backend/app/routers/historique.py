from datetime import date as date_type, timedelta
from typing import Optional

from fastapi import APIRouter, Depends, Query
from sqlalchemy import func
from sqlalchemy.orm import Session, joinedload

from .. import models, schemas, auth
from ..database import get_db

router = APIRouter(prefix="/historique", tags=["historique"])


@router.get("/commandes", response_model=list[schemas.CommandeOut])
def historique_commandes(
    date_debut: Optional[date_type] = Query(None),
    date_fin: Optional[date_type] = Query(None),
    agence_id: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    _: models.Employe = Depends(auth.exiger_role_restaurant),
):
    date_fin = date_fin or date_type.today()
    date_debut = date_debut or (date_fin - timedelta(days=7))

    q = (
        db.query(models.Commande)
        .join(models.Employe)
        .options(
            joinedload(models.Commande.lignes).joinedload(models.LigneCommande.plat),
            joinedload(models.Commande.employe).joinedload(models.Employe.agence),
        )
        .filter(
            func.date(models.Commande.cree_le) >= date_debut,
            func.date(models.Commande.cree_le) <= date_fin,
        )
    )
    if agence_id:
        q = q.filter(models.Employe.agence_id == agence_id)
    return q.order_by(models.Commande.cree_le.desc()).limit(500).all()


@router.get("/stats", response_model=schemas.HistoriqueStats)
def historique_stats(
    date_debut: Optional[date_type] = Query(None),
    date_fin: Optional[date_type] = Query(None),
    db: Session = Depends(get_db),
    _: models.Employe = Depends(auth.exiger_role_restaurant),
):
    date_fin = date_fin or date_type.today()
    date_debut = date_debut or (date_fin - timedelta(days=7))

    base = db.query(models.Commande).filter(
        func.date(models.Commande.cree_le) >= date_debut,
        func.date(models.Commande.cree_le) <= date_fin,
        models.Commande.statut != models.OrderStatus.ANNULEE,
    )

    total = base.count()

    plats_populaires = (
        db.query(models.Plat.nom, func.sum(models.LigneCommande.quantite))
        .join(models.LigneCommande, models.LigneCommande.plat_id == models.Plat.id)
        .join(models.Commande, models.Commande.id == models.LigneCommande.commande_id)
        .filter(
            func.date(models.Commande.cree_le) >= date_debut,
            func.date(models.Commande.cree_le) <= date_fin,
            models.Commande.statut != models.OrderStatus.ANNULEE,
        )
        .group_by(models.Plat.nom)
        .order_by(func.sum(models.LigneCommande.quantite).desc())
        .limit(5)
        .all()
    )

    par_jour = (
        db.query(func.date(models.Commande.cree_le), func.count(models.Commande.id))
        .filter(
            func.date(models.Commande.cree_le) >= date_debut,
            func.date(models.Commande.cree_le) <= date_fin,
            models.Commande.statut != models.OrderStatus.ANNULEE,
        )
        .group_by(func.date(models.Commande.cree_le))
        .order_by(func.date(models.Commande.cree_le))
        .all()
    )

    return schemas.HistoriqueStats(
        total_commandes=total,
        plats_populaires=[
            schemas.ResumePlat(plat_nom=nom, quantite_totale=qte) for nom, qte in plats_populaires
        ],
        commandes_par_jour=[
            schemas.StatJourStat(date=jour, total_commandes=total_jour)
            for jour, total_jour in par_jour
        ],
    )