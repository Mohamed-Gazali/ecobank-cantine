from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from .. import models, schemas
from ..database import get_db

router = APIRouter(prefix="/agences", tags=["agences"])


@router.get("", response_model=list[schemas.AgenceOut])
def liste_agences(db: Session = Depends(get_db)):
    return db.query(models.Agence).order_by(models.Agence.nom).all()
