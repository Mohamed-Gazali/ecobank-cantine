"""
Script d'initialisation : crée les agences Ecobank, un compte restaurant
et quelques plats de départ.

Utilisation :
    python -m seed
"""
from app.database import SessionLocal, engine
from app import models, auth

models.Base.metadata.create_all(bind=engine)

db = SessionLocal()

NOMS_AGENCES = [
    "Ecobank Siège",
    "Ecobank Petit Marcher",
    "Ecobank Rive Droite",
    "Ecobank Plateau",
    "Ecobank Katako",
    "Ecobank Wadata",
    "Ecobank Francophonie",
]

print("Création des agences...")
agences = {}
for nom in NOMS_AGENCES:
    existante = db.query(models.Agence).filter(models.Agence.nom == nom).first()
    if not existante:
        existante = models.Agence(nom=nom)
        db.add(existante)
        db.commit()
        db.refresh(existante)
    agences[nom] = existante
    print(f"  - {nom}")

print("\nCréation du compte restaurant...")
compte_restaurant = db.query(models.Employe).filter(
    models.Employe.numero == "restaurant"
).first()
if not compte_restaurant:
    compte_restaurant = models.Employe(
        nom="Restaurant",
        numero="restaurant",
        mot_de_passe_hash=auth.hash_mot_de_passe("cantine2026"),
        agence_id=agences["Ecobank Siège"].id,
        role=models.Role.RESTAURANT,
    )
    db.add(compte_restaurant)
    db.commit()
    print("  Identifiant : restaurant / Mot de passe : cantine2026")
else:
    print("  Déjà existant")

print("\nCréation de plats de démonstration...")
plats_demo = [
    ("Riz sauce arachide", "Riz blanc, sauce arachide, viande de bœuf", 1500),
    ("Riz sauce gombo", "Riz blanc, sauce gombo, poisson", 1500),
    ("Poulet braisé + attiéké", "Poulet braisé, attiéké, oignons", 2000),
    ("Spaghetti sauce tomate", "Spaghetti, sauce tomate, viande hachée", 1500),
]
plats_crees = []
for nom, description, prix in plats_demo:
    existant = db.query(models.Plat).filter(models.Plat.nom == nom).first()
    if not existant:
        existant = models.Plat(nom=nom, description=description, prix=prix)
        db.add(existant)
        db.commit()
        db.refresh(existant)
        print(f"  - {nom} ({prix} FCFA)")
    plats_crees.append(existant)

print("\nMise au menu d'aujourd'hui (pour pouvoir tester la commande tout de suite)...")
from datetime import date
aujourdhui = date.today()
for plat in plats_crees:
    deja_au_menu = (
        db.query(models.MenuJour)
        .filter(models.MenuJour.date == aujourdhui, models.MenuJour.plat_id == plat.id)
        .first()
    )
    if not deja_au_menu:
        db.add(models.MenuJour(date=aujourdhui, plat_id=plat.id))
        print(f"  - {plat.nom}")
db.commit()

db.close()
print("\nInitialisation terminée.")
