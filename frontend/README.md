# Cantine Ecobank — Frontend (React / Vite)

## Installation (Windows / PowerShell)

```powershell
cd frontend
npm install
copy .env.example .env
npm run dev
```

L'application est disponible sur http://localhost:5173.

## Structure

- `src/pages/Connexion.jsx`, `Inscription.jsx` — authentification employé (compte créé une fois)
- `src/components/Layout.jsx` — sidebar (desktop) / menu déroulant (mobile), réutilisé pour l'espace employé et l'espace restaurant
- `src/context/AuthContext.jsx` — session employé (token stocké en local, jamais en dur)
- `src/components/BandeauFenetre.jsx` — resynchronise l'heure serveur toutes les 30s pour afficher l'état ouvert/fermé (la vérité reste toujours côté backend)

**Espace employé** (`src/pages/employe/`)
- `EmployeDashboard.jsx` — commande du jour (menu limité aux plats mis en avant ce jour-là), ticket de confirmation
- `EmployeHistorique.jsx` — historique de ses propres commandes
- `EmployeAvis.jsx` — laisser un avis (qualité / délai de livraison) + historique de ses avis

**Espace restaurant** (`src/pages/admin/`)
- `AdminDashboard.jsx` — vue d'ensemble (total du jour, résumé cuisine, derniers avis)
- `AdminCommandes.jsx` — commandes du jour groupées par agence, marquage "livrée"
- `AdminMenuJour.jsx` — choisir le jour (lundi à vendredi) et les plats proposés ce jour, création de nouveaux plats au catalogue
- `AdminHistorique.jsx` — statistiques et détail des commandes sur une période
- `AdminAvis.jsx` — retours des employés, notes moyennes par catégorie
- `AdminParametres.jsx` — heure d'ouverture/fermeture des commandes, modifiable sans toucher au code

## Se connecter au dashboard restaurant

Après avoir lancé `python -m seed` côté backend, connectez-vous avec :
- Numéro : `restaurant`
- Mot de passe : `cantine2026`

## Identité visuelle

Palette "ticket de cantine" : fond papier crème, encre bleu nuit, accent
ambre pour les actions, sauge pour les confirmations, corail pour les
alertes de fermeture. Typographies Space Grotesk (titres) + Inter (texte).
