from datetime import date as date_type

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session, joinedload

from .. import models, schemas, auth, fenetre
from ..database import get_db

router = APIRouter(prefix="/menu-jour", tags=["menu-jour"])


@router.get("/aujourdhui", response_model=list[schemas.PlatOut])
def plats_du_jour(
    db: Session = Depends(get_db),
    _: models.Employe = Depends(auth.get_employe_courant),
):
    """Utilisé côté employé : uniquement les plats mis au menu aujourd'hui."""
    aujourdhui = fenetre.heure_actuelle().date()
    lignes = (
        db.query(models.MenuJour)
        .options(joinedload(models.MenuJour.plat))
        .filter(models.MenuJour.date == aujourdhui)
        .all()
    )
    return [ligne.plat for ligne in lignes]


@router.get("", response_model=list[schemas.MenuJourOut])
def liste_menu_jour(
    date: date_type = Query(default=None),
    db: Session = Depends(get_db),
    _: models.Employe = Depends(auth.exiger_role_restaurant),
):
    """Utilisé côté admin pour voir/gérer le menu d'une date donnée (aujourd'hui par défaut)."""
    date_cible = date or fenetre.heure_actuelle().date()
    return (
        db.query(models.MenuJour)
        .options(joinedload(models.MenuJour.plat))
        .filter(models.MenuJour.date == date_cible)
        .all()
    )


@router.post("", response_model=schemas.MenuJourOut)
def ajouter_au_menu(
    payload: schemas.MenuJourCreate,
    db: Session = Depends(get_db),
    _: models.Employe = Depends(auth.exiger_role_restaurant),
):
    plat = db.query(models.Plat).filter(models.Plat.id == payload.plat_id).first()
    if not plat:
        raise HTTPException(status_code=404, detail="Plat introuvable")

    existant = (
        db.query(models.MenuJour)
        .filter(models.MenuJour.date == payload.date, models.MenuJour.plat_id == payload.plat_id)
        .first()
    )
    if existant:
        raise HTTPException(status_code=400, detail="Ce plat est déjà au menu de ce jour")

    ligne = models.MenuJour(date=payload.date, plat_id=payload.plat_id)
    db.add(ligne)
    db.commit()
    db.refresh(ligne)
    return ligne


@router.delete("/{menu_jour_id}")
def retirer_du_menu(
    menu_jour_id: str,
    db: Session = Depends(get_db),
    _: models.Employe = Depends(auth.exiger_role_restaurant),
):
    ligne = db.query(models.MenuJour).filter(models.MenuJour.id == menu_jour_id).first()
    if not ligne:
        raise HTTPException(status_code=404, detail="Entrée de menu introuvable")
    db.delete(ligne)
    db.commit()
    return {"ok": True}
