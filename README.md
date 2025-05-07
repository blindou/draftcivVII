# Draft System

Ce projet est un système de draft pour un jeu de civilisation, développé avec React, TypeScript, Vite, Zustand, Supabase, TailwindCSS et d'autres bibliothèques modernes.

## Structure du Projet

- **src/pages/** : Pages principales de l'application (HomePage, DraftPage, StatsPage, etc.).
- **src/components/** : Composants réutilisables, avec des sous-dossiers pour l'UI et les statistiques.
- **src/data/** : Fichiers JSON pour les données statiques (souvenirs, leaders, civilisations).
- **src/lib/** : Fonctions utilitaires, notamment la connexion à Supabase.
- **src/store/** : Gestion de l'état global (ex : draftStore).
- **src/types/** : Types TypeScript pour structurer les données.
- **src/constants/** : Constantes utilisées dans le projet (ex : phaseFlow).

## Installation

1. Clonez le dépôt :
   ```bash
   git clone <url-du-depot>
   cd draft-system
   ```

2. Installez les dépendances :
   ```bash
   npm install
   ```

3. Lancez le serveur de développement :
   ```bash
   npm run dev
   ```

## Utilisation

Le projet permet de gérer un système de draft pour un jeu de civilisation, avec des fonctionnalités de statistiques et de visualisation.

## Technologies Utilisées

- React
- TypeScript
- Vite
- Zustand
- Supabase
- TailwindCSS
- Framer Motion
- Lucide React
- Recharts
- Tanstack React Table 