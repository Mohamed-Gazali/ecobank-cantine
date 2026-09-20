from datetime import datetime, date
from typing import Optional, List
from pydantic import BaseModel

from .models import Role, OrderStatus, CategorieAvis


# ---------- Agences ----------
class AgenceOut(BaseModel):
    id: str
    nom: str

    class Config:
        from_attributes = True


# ---------- Auth / Employés ----------
class EmployeInscription(BaseModel):
    nom: str
    numero: str
    mot_de_passe: str
    agence_id: str


class EmployeConnexion(BaseModel):
    numero: str
    mot_de_passe: str


class EmployeOut(BaseModel):
    id: str
    nom: str
    numero: str
    role: Role
    agence: AgenceOut

    class Config:
        from_attributes = True


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    employe: EmployeOut


# ---------- Plats ----------
class PlatBase(BaseModel):
    nom: str
    description: Optional[str] = None
    prix: int
    disponible: bool = True


class PlatCreate(PlatBase):
    pass


class PlatUpdate(BaseModel):
    nom: Optional[str] = None
    description: Optional[str] = None
    prix: Optional[int] = None
    disponible: Optional[bool] = None


class PlatOut(PlatBase):
    id: str

    class Config:
        from_attributes = True


# ---------- Commandes ----------
class LigneCommandeCreate(BaseModel):
    plat_id: str
    quantite: int = 1


class CommandeCreate(BaseModel):
    lignes: List[LigneCommandeCreate]


class LigneCommandeOut(BaseModel):
    id: str
    quantite: int
    plat: PlatOut

    class Config:
        from_attributes = True


class CommandeOut(BaseModel):
    id: str
    statut: OrderStatus
    cree_le: datetime
    employe: EmployeOut
    lignes: List[LigneCommandeOut]

    class Config:
        from_attributes = True


class CommandeStatutUpdate(BaseModel):
    statut: OrderStatus


class ResumePlat(BaseModel):
    plat_nom: str
    quantite_totale: int


class StatutFenetre(BaseModel):
    ouverte: bool
    heure_ouverture: str
    heure_fermeture: str
    heure_serveur: str


# ---------- Menu du jour ----------
class MenuJourCreate(BaseModel):
    date: date
    plat_id: str


class MenuJourOut(BaseModel):
    id: str
    date: date
    plat: PlatOut

    class Config:
        from_attributes = True


# ---------- Avis ----------
class AvisCreate(BaseModel):
    commande_id: Optional[str] = None
    categorie: CategorieAvis
    note: int
    commentaire: Optional[str] = None


class AvisOut(BaseModel):
    id: str
    categorie: CategorieAvis
    note: int
    commentaire: Optional[str]
    cree_le: datetime
    employe: EmployeOut

    class Config:
        from_attributes = True


class ResumeAvis(BaseModel):
    categorie: CategorieAvis
    note_moyenne: float
    nombre_avis: int


# ---------- Paramètres ----------
class ParametresOut(BaseModel):
    heure_ouverture: int
    heure_fermeture: int


class ParametresUpdate(BaseModel):
    heure_ouverture: Optional[int] = None
    heure_fermeture: Optional[int] = None


# ---------- Historique / statistiques ----------
class StatJourStat(BaseModel):
    date: date
    total_commandes: int


class HistoriqueStats(BaseModel):
    total_commandes: int
    plats_populaires: List[ResumePlat]
    commandes_par_jour: List[StatJourStat]