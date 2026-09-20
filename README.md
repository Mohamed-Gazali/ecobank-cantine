# Cantine Ecobank

Plateforme de commande de repas pour les employés d'Ecobank, ouverte tous
les jours de 8h à 11h. Chaque employé (agence principale + 6 annexes)
crée un compte une fois, puis commande son plat du jour en quelques
secondes depuis son téléphone. Le restaurant reçoit les commandes sur un
dashboard, groupées par agence, avec un résumé des quantités à préparer.

## Structure du dépôt

```
backend/    API FastAPI + PostgreSQL
frontend/   Application React / Vite
```

## Démarrage rapide

1. **Backend** — voir `backend/README.md` (installation, `.env`, `seed.py`, lancement)
2. **Frontend** — voir `frontend/README.md` (installation, `.env`, lancement)

Par défaut le frontend attend l'API sur `http://localhost:8000` et se
lance sur `http://localhost:5173`.

## Points d'attention pour la suite

- La fenêtre horaire (8h–11h) est réglable via les variables d'environnement
  `HEURE_OUVERTURE` / `HEURE_FERMETURE` du backend, sans toucher au code.
- Actuellement, un employé ne peut passer qu'une commande par jour — à
  adapter si le restaurant veut permettre plusieurs plats par commande.
- Le compte "restaurant" est créé manuellement par `seed.py` (pas
  d'auto-inscription pour ce rôle, volontairement).
- Avant mise en production : changer `SECRET_KEY`, le mot de passe du
  compte restaurant, et restreindre les origines CORS dans `app/main.py`.
