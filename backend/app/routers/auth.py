from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload

from .. import models, schemas, auth
from ..database import get_db

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/inscription", response_model=schemas.Token)
def inscription(payload: schemas.EmployeInscription, db: Session = Depends(get_db)):
    existe = db.query(models.Employe).filter(
        models.Employe.numero == payload.numero
    ).first()
    if existe:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Un compte existe déjà avec ce numéro",
        )

    agence = db.query(models.Agence).filter(models.Agence.id == payload.agence_id).first()
    if not agence:
        raise HTTPException(status_code=404, detail="Agence introuvable")

    employe = models.Employe(
        nom=payload.nom,
        numero=payload.numero,
        mot_de_passe_hash=auth.hash_mot_de_passe(payload.mot_de_passe),
        agence_id=payload.agence_id,
        role=models.Role.EMPLOYE,
    )
    db.add(employe)
    db.commit()
    db.refresh(employe)

    token = auth.creer_token({"sub": employe.id})
    return schemas.Token(access_token=token, employe=employe)


@router.post("/connexion", response_model=schemas.Token)
def connexion(payload: schemas.EmployeConnexion, db: Session = Depends(get_db)):
    employe = (
        db.query(models.Employe)
        .options(joinedload(models.Employe.agence))
        .filter(models.Employe.numero == payload.numero)
        .first()
    )
    if not employe or not auth.verifier_mot_de_passe(
        payload.mot_de_passe, employe.mot_de_passe_hash
    ):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Numéro ou mot de passe incorrect",
        )

    token = auth.creer_token({"sub": employe.id})
    return schemas.Token(access_token=token, employe=employe)


@router.get("/moi", response_model=schemas.EmployeOut)
def moi(employe: models.Employe = Depends(auth.get_employe_courant)):
    return employe
