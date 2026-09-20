# Cantine Ecobank — Backend (FastAPI)

## Installation (Windows / PowerShell)

```powershell
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt --break-system-packages
```

## Configuration

1. Copier `.env.example` en `.env` et ajuster si besoin.
2. Créer la base PostgreSQL :
   ```sql
   CREATE DATABASE cantine_db;
   CREATE USER cantine_user WITH PASSWORD 'cantine_pass';
   GRANT ALL PRIVILEGES ON DATABASE cantine_db TO cantine_user;
   ```

## Initialiser les données de départ

Crée les 7 agences (agence principale + 6 annexes), un compte restaurant
et quelques plats de démonstration.

```powershell
python -m seed
```

Identifiants du compte restaurant créé : `restaurant` / `cantine2026`
(à changer avant la mise en production).

## Lancer le serveur

```powershell
python -m uvicorn app.main:app --reload
```

L'API est disponible sur http://localhost:8000, la doc interactive sur
http://localhost:8000/docs.

## Nouvelles fonctionnalités (V2)

- **Menu du jour** (`/menu-jour`) : le catalogue de plats (`/plats`) reste
  permanent ; ce qui est réellement proposé aux employés un jour donné se
  gère via `MenuJour` (date + plat). L'employé ne voit que
  `/menu-jour/aujourdhui`.
- **Avis** (`/avis`) : chaque employé peut noter (1 à 5) la qualité du plat
  ou le délai de livraison, avec un commentaire facultatif. Le dashboard
  admin les consulte via `GET /avis` et `GET /avis/resume`.
- **Paramètres** (`/parametres`) : l'heure d'ouverture/fermeture est
  maintenant modifiable depuis l'interface admin (stockée dans la table
  `parametres`), plus besoin de modifier le `.env` ni de redéployer. Les
  valeurs du `.env` ne servent que de valeurs par défaut au premier lancement.
- **Historique** (`/historique`) : commandes et statistiques (total, plats
  populaires, commandes par jour) filtrables par période.

## Points clés

- La fenêtre de commande (8h–11h par défaut, réglable via `.env`) est
  vérifiée **côté serveur** dans `app/fenetre.py` — jamais sur la base de
  l'heure du téléphone du client.
- Un employé ne peut passer qu'une seule commande par jour (vérification
  dans `routers/commandes.py`) — à retirer si le restaurant veut autoriser
  plusieurs plats par commande.
- Rôles : `employe` (commande) et `restaurant` (dashboard, gestion des
  plats). Le compte restaurant est créé manuellement via `seed.py`, pas
  d'auto-inscription pour ce rôle.
