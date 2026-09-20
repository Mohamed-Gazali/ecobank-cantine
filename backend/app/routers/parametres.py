from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from .. import models, schemas, auth, fenetre
from ..database import get_db

router = APIRouter(prefix="/parametres", tags=["parametres"])


@router.get("", response_model=schemas.ParametresOut)
def lire_parametres(
    db: Session = Depends(get_db),
    _: models.Employe = Depends(auth.exiger_role_restaurant),
):
    h_ouverture, h_fermeture = fenetre.get_horaires(db)
    return schemas.ParametresOut(heure_ouverture=h_ouverture, heure_fermeture=h_fermeture)


@router.put("", response_model=schemas.ParametresOut)
def modifier_parametres(
    payload: schemas.ParametresUpdate,
    db: Session = Depends(get_db),
    _: models.Employe = Depends(auth.exiger_role_restaurant),
):
    fenetre.set_horaires(db, payload.heure_ouverture, payload.heure_fermeture)
    h_ouverture, h_fermeture = fenetre.get_horaires(db)
    return schemas.ParametresOut(heure_ouverture=h_ouverture, heure_fermeture=h_fermeture)
