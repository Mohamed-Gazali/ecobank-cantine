"""
Renomme des agences déjà existantes en base (contrairement à seed.py, qui
ne fait que créer les agences manquantes et ne touche pas à celles qui
existent déjà sous un autre nom).

1. Modifie la liste CORRESPONDANCES ci-dessous : à gauche le nom actuel en
   base (visible sur /agences ou dans pgAdmin), à droite le vrai nom.
2. Lance :  python -m renommer_agences
"""
from app.database import SessionLocal
from app import models

# Format : "nom actuel en base" -> "nouveau nom"
CORRESPONDANCES = {
    "Agence principale": "Agence principale",  # laisse tel quel si déjà correct
    "Annexe 1": "Ecobank Plateau",
    "Annexe 2": "Ecobaank Rive Droite",
    "Annexe 3": "Ecobank Katako",
    "Annexe 4": "Ecobank Wadata",
    "Annexe 5": "Ecobank Petit Marcher",
    "Annexe 6": "Ecobank Francophonie",
}

db = SessionLocal()

for ancien_nom, nouveau_nom in CORRESPONDANCES.items():
    if ancien_nom == nouveau_nom:
        continue
    agence = db.query(models.Agence).filter(models.Agence.nom == ancien_nom).first()
    if agence:
        agence.nom = nouveau_nom
        print(f"  {ancien_nom} -> {nouveau_nom}")
    else:
        print(f"  (introuvable, ignoré) {ancien_nom}")

db.commit()
db.close()
print("\nTerminé.")