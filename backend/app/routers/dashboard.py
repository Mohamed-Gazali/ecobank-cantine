from datetime import datetime
from typing import Optional

from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func

from .. import models, schemas, auth
from ..database import get_db

router = APIRouter(prefix="/dashboard", tags=["dashboard"])


def _debut_du_jour():
    return datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)


@router.get("/commandes", response_model=list[schemas.CommandeOut])
def commandes_du_jour(
    agence_id: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    _: models.Employe = Depends(auth.exiger_role_restaurant),
):
    q = (
        db.query(models.Commande)
        .join(models.Employe)
        .options(
            joinedload(models.Commande.lignes).joinedload(models.LigneCommande.plat),
            joinedload(models.Commande.employe).joinedload(models.Employe.agence),
        )
        .filter(models.Commande.cree_le >= _debut_du_jour())
    )
    if agence_id:
        q = q.filter(models.Employe.agence_id == agence_id)
    return q.order_by(models.Commande.cree_le.asc()).all()


@router.get("/resume", response_model=list[schemas.ResumePlat])
def resume_du_jour(
    db: Session = Depends(get_db),
    _: models.Employe = Depends(auth.exiger_role_restaurant),
):
    resultats = (
        db.query(models.Plat.nom, func.sum(models.LigneCommande.quantite))
        .join(models.LigneCommande, models.LigneCommande.plat_id == models.Plat.id)
        .join(models.Commande, models.Commande.id == models.LigneCommande.commande_id)
        .filter(models.Commande.cree_le >= _debut_du_jour())
        .filter(models.Commande.statut != models.OrderStatus.ANNULEE)
        .group_by(models.Plat.nom)
        .all()
    )
    return [schemas.ResumePlat(plat_nom=nom, quantite_totale=qte) for nom, qte in resultats]


@router.patch("/commandes/{commande_id}/statut", response_model=schemas.CommandeOut)
def changer_statut(
    commande_id: str,
    payload: schemas.CommandeStatutUpdate,
    db: Session = Depends(get_db),
    _: models.Employe = Depends(auth.exiger_role_restaurant),
):
    commande = (
        db.query(models.Commande)
        .options(
            joinedload(models.Commande.lignes).joinedload(models.LigneCommande.plat),
            joinedload(models.Commande.employe).joinedload(models.Employe.agence),
        )
        .filter(models.Commande.id == commande_id)
        .first()
    )
    if not commande:
        raise HTTPException(status_code=404, detail="Commande introuvable")
    commande.statut = payload.statut
    db.commit()
    db.refresh(commande)
    return commande