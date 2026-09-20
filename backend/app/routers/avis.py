from sqlalchemy import func
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session, joinedload

from .. import models, schemas, auth
from ..database import get_db

router = APIRouter(prefix="/avis", tags=["avis"])


@router.post("", response_model=schemas.AvisOut)
def laisser_un_avis(
    payload: schemas.AvisCreate,
    db: Session = Depends(get_db),
    employe: models.Employe = Depends(auth.get_employe_courant),
):
    avis = models.Avis(
        employe_id=employe.id,
        commande_id=payload.commande_id,
        categorie=payload.categorie,
        note=max(1, min(5, payload.note)),
        commentaire=payload.commentaire,
    )
    db.add(avis)
    db.commit()
    db.refresh(avis)
    return avis


@router.get("/mes-avis", response_model=list[schemas.AvisOut])
def mes_avis(
    db: Session = Depends(get_db),
    employe: models.Employe = Depends(auth.get_employe_courant),
):
    return (
        db.query(models.Avis)
        .options(joinedload(models.Avis.employe))
        .filter(models.Avis.employe_id == employe.id)
        .order_by(models.Avis.cree_le.desc())
        .all()
    )


@router.get("", response_model=list[schemas.AvisOut])
def liste_avis(
    db: Session = Depends(get_db),
    _: models.Employe = Depends(auth.exiger_role_restaurant),
):
    """Utilisé par le dashboard admin pour consulter les retours employés."""
    return (
        db.query(models.Avis)
        .options(joinedload(models.Avis.employe).joinedload(models.Employe.agence))
        .order_by(models.Avis.cree_le.desc())
        .limit(200)
        .all()
    )


@router.get("/resume", response_model=list[schemas.ResumeAvis])
def resume_avis(
    db: Session = Depends(get_db),
    _: models.Employe = Depends(auth.exiger_role_restaurant),
):
    resultats = (
        db.query(models.Avis.categorie, func.avg(models.Avis.note), func.count(models.Avis.id))
        .group_by(models.Avis.categorie)
        .all()
    )
    return [
        schemas.ResumeAvis(categorie=cat, note_moyenne=round(float(moy), 1), nombre_avis=nb)
        for cat, moy, nb in resultats
    ]
