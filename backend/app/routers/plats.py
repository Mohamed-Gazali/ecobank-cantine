from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from .. import models, schemas, auth
from ..database import get_db

router = APIRouter(prefix="/plats", tags=["plats"])


@router.get("", response_model=list[schemas.PlatOut])
def liste_plats(disponibles_uniquement: bool = True, db: Session = Depends(get_db)):
    q = db.query(models.Plat)
    if disponibles_uniquement:
        q = q.filter(models.Plat.disponible == True)  # noqa: E712
    return q.order_by(models.Plat.nom).all()


@router.post("", response_model=schemas.PlatOut)
def creer_plat(
    payload: schemas.PlatCreate,
    db: Session = Depends(get_db),
    _: models.Employe = Depends(auth.exiger_role_restaurant),
):
    plat = models.Plat(**payload.dict())
    db.add(plat)
    db.commit()
    db.refresh(plat)
    return plat


@router.patch("/{plat_id}", response_model=schemas.PlatOut)
def modifier_plat(
    plat_id: str,
    payload: schemas.PlatUpdate,
    db: Session = Depends(get_db),
    _: models.Employe = Depends(auth.exiger_role_restaurant),
):
    plat = db.query(models.Plat).filter(models.Plat.id == plat_id).first()
    if not plat:
        raise HTTPException(status_code=404, detail="Plat introuvable")
    for champ, valeur in payload.dict(exclude_unset=True).items():
        setattr(plat, champ, valeur)
    db.commit()
    db.refresh(plat)
    return plat


@router.delete("/{plat_id}")
def supprimer_plat(
    plat_id: str,
    db: Session = Depends(get_db),
    _: models.Employe = Depends(auth.exiger_role_restaurant),
):
    plat = db.query(models.Plat).filter(models.Plat.id == plat_id).first()
    if not plat:
        raise HTTPException(status_code=404, detail="Plat introuvable")
    db.delete(plat)
    db.commit()
    return {"ok": True}
