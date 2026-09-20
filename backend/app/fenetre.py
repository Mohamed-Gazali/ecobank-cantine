import os
from datetime import datetime
from zoneinfo import ZoneInfo

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from . import models

FUSEAU = ZoneInfo(os.getenv("FUSEAU_HORAIRE", "Africa/Niamey"))

HEURE_OUVERTURE_DEFAUT = int(os.getenv("HEURE_OUVERTURE", "8"))
HEURE_FERMETURE_DEFAUT = int(os.getenv("HEURE_FERMETURE", "11"))

CLE_OUVERTURE = "heure_ouverture"
CLE_FERMETURE = "heure_fermeture"


def heure_actuelle() -> datetime:
    return datetime.now(FUSEAU)


def get_horaires(db: Session) -> tuple[int, int]:
    """Lit les horaires depuis la table parametres ; à défaut, utilise les
    valeurs du .env. L'admin peut les changer sans toucher au code."""
    ouverture = db.query(models.Parametre).filter(models.Parametre.cle == CLE_OUVERTURE).first()
    fermeture = db.query(models.Parametre).filter(models.Parametre.cle == CLE_FERMETURE).first()
    h_ouverture = int(ouverture.valeur) if ouverture else HEURE_OUVERTURE_DEFAUT
    h_fermeture = int(fermeture.valeur) if fermeture else HEURE_FERMETURE_DEFAUT
    return h_ouverture, h_fermeture


def set_horaires(db: Session, heure_ouverture: "int | None", heure_fermeture: "int | None"):
    if heure_ouverture is not None:
        _set_parametre(db, CLE_OUVERTURE, str(heure_ouverture))
    if heure_fermeture is not None:
        _set_parametre(db, CLE_FERMETURE, str(heure_fermeture))
    db.commit()


def _set_parametre(db: Session, cle: str, valeur: str):
    ligne = db.query(models.Parametre).filter(models.Parametre.cle == cle).first()
    if ligne:
        ligne.valeur = valeur
    else:
        db.add(models.Parametre(cle=cle, valeur=valeur))


def fenetre_ouverte(db: Session) -> bool:
    h_ouverture, h_fermeture = get_horaires(db)
    h = heure_actuelle().hour
    return h_ouverture <= h < h_fermeture


def verifier_fenetre_ouverte(db: Session):
    """A appeler côté serveur avant toute création de commande.
    Ne jamais se fier à l'heure du téléphone du client."""
    h_ouverture, h_fermeture = get_horaires(db)
    if not fenetre_ouverte(db):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=(
                f"Les commandes sont fermées. La plateforme est ouverte "
                f"de {h_ouverture}h à {h_fermeture}h."
            ),
        )
