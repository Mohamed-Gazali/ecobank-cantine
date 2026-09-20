import enum
import uuid
from datetime import datetime

from sqlalchemy import (
    Column, String, Integer, Boolean, ForeignKey, DateTime, Date, Text, Enum, ARRAY, ForeignKey
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from .database import Base


def gen_uuid():
    return str(uuid.uuid4())


class Role(str, enum.Enum):
    EMPLOYE = "employe"
    RESTAURANT = "restaurant"


class OrderStatus(str, enum.Enum):
    EN_ATTENTE = "en_attente"
    CONFIRMEE = "confirmee"
    LIVREE = "livree"
    ANNULEE = "annulee"


class Agence(Base):
    __tablename__ = "agences"

    id = Column(UUID(as_uuid=False), primary_key=True, default=gen_uuid)
    nom = Column(String, unique=True, nullable=False)

    employes = relationship("Employe", back_populates="agence")


class Employe(Base):
    __tablename__ = "employes"

    id = Column(UUID(as_uuid=False), primary_key=True, default=gen_uuid)
    nom = Column(String, nullable=False)
    numero = Column(String, nullable=False)
    mot_de_passe_hash = Column(String, nullable=False)
    agence_id = Column(UUID(as_uuid=False), ForeignKey("agences.id"), nullable=False)
    role = Column(Enum(Role), default=Role.EMPLOYE, nullable=False)
    cree_le = Column(DateTime, default=datetime.utcnow)

    agence = relationship("Agence", back_populates="employes")
    commandes = relationship("Commande", back_populates="employe")


class Plat(Base):
    __tablename__ = "plats"

    id = Column(UUID(as_uuid=False), primary_key=True, default=gen_uuid)
    nom = Column(String, nullable=False)
    description = Column(String, nullable=True)
    prix = Column(Integer, nullable=False)  # en FCFA
    disponible = Column(Boolean, default=True)

    lignes_commande = relationship("LigneCommande", back_populates="plat")


class Commande(Base):
    """Une commande passée par un employé un jour donné, pouvant contenir
    plusieurs plats (voir LigneCommande). Le statut s'applique à la
    commande entière (confirmée / livrée / annulée par le restaurant)."""

    __tablename__ = "commandes"

    id = Column(UUID(as_uuid=False), primary_key=True, default=gen_uuid)
    employe_id = Column(UUID(as_uuid=False), ForeignKey("employes.id"), nullable=False)
    statut = Column(Enum(OrderStatus), default=OrderStatus.EN_ATTENTE, nullable=False)
    cree_le = Column(DateTime, default=datetime.utcnow)

    employe = relationship("Employe", back_populates="commandes")
    lignes = relationship(
        "LigneCommande", back_populates="commande", cascade="all, delete-orphan"
    )


class LigneCommande(Base):
    """Un plat + une quantité au sein d'une commande."""

    __tablename__ = "lignes_commande"

    id = Column(UUID(as_uuid=False), primary_key=True, default=gen_uuid)
    commande_id = Column(UUID(as_uuid=False), ForeignKey("commandes.id"), nullable=False)
    plat_id = Column(UUID(as_uuid=False), ForeignKey("plats.id"), nullable=False)
    quantite = Column(Integer, default=1, nullable=False)

    commande = relationship("Commande", back_populates="lignes")
    plat = relationship("Plat")


class Parametre(Base):
    __tablename__ = "parametres"

    cle = Column(String, primary_key=True)
    valeur = Column(String, nullable=False)


class MenuJour(Base):
    """Associe un plat du catalogue à une date précise : ce qui est
    réellement proposé aux employés ce jour-là."""

    __tablename__ = "menu_jour"

    id = Column(UUID(as_uuid=False), primary_key=True, default=gen_uuid)
    date = Column(Date, nullable=False)
    plat_id = Column(UUID(as_uuid=False), ForeignKey("plats.id"), nullable=False)
    cree_le = Column(DateTime, default=datetime.utcnow)

    plat = relationship("Plat")


class CategorieAvis(str, enum.Enum):
    QUALITE = "qualite"
    DELAI_LIVRAISON = "delai_livraison"
    AUTRE = "autre"


class Avis(Base):
    __tablename__ = "avis"

    id = Column(UUID(as_uuid=False), primary_key=True, default=gen_uuid)
    employe_id = Column(UUID(as_uuid=False), ForeignKey("employes.id"), nullable=False)
    commande_id = Column(UUID(as_uuid=False), ForeignKey("commandes.id"), nullable=True)
    categorie = Column(Enum(CategorieAvis), default=CategorieAvis.AUTRE, nullable=False)
    note = Column(Integer, nullable=False)  # 1 à 5
    commentaire = Column(Text, nullable=True)
    cree_le = Column(DateTime, default=datetime.utcnow)

    employe = relationship("Employe")
    commande = relationship("Commande")