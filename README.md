# Zone Alerte — console web (Next.js)

Intégration frontend de la maquette Figma **« Dashboard zone alertes » V2** : console de sécurité urbaine pour Kinshasa (alertes citoyennes, interventions, carte en direct, avis de recherche, publications, IA prédictive, administration).

- **Next.js 16** (App Router, Turbopack, `cacheComponents`), **React 19**, **TypeScript strict**
- **Tailwind CSS 4** branché sur les variables Figma `ZA V2 / Couleurs`, police **Poppins**
- **TanStack Query 5** (état serveur) · **Zustand 5** (état client global) · **URL** (filtres) · **react-hook-form + zod** (formulaires)
- **Leaflet** (carte), graphiques SVG maison, **Vitest + Testing Library**

Le backend n’existe pas encore : une base **en mémoire** (`src/lib/mock`) simule l’API avec 250 ms de latence. Toutes les actions fonctionnent (valider, rejeter, fusionner, assigner, publier, archiver, inviter…) jusqu’au rechargement de la page.

## Démarrer

```bash
npm install
npm run dev            # http://localhost:3000
```

**Connexion de démonstration**

| Champ        | Valeur                                                                                                                          |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------- |
| Email        | `macgenius@zonealerte.cd` (admin) — ou `r.ali@pnc.cd`, `j.andedi@zonealerte.cd`, `g.lukusa@zonealerte.cd` pour tester les rôles |
| Mot de passe | n’importe quel mot de passe de 8 caractères ou plus                                                                             |
| Code 2FA     | n’importe quels 6 chiffres (`000000` simule un code faux)                                                                       |

`p.ilunga@zonealerte.cd` est suspendu (message d’erreur dédié).

## Scripts

| Commande                          | Rôle                                                                            |
| --------------------------------- | ------------------------------------------------------------------------------- |
| `npm run dev` / `build` / `start` | Développement, build de production, serveur                                     |
| `npm run check`                   | Typage + lint + tests (à lancer avant chaque PR)                                |
| `npm run typecheck`               | Génère les types de routes Next puis `tsc --noEmit`                             |
| `npm run lint`                    | ESLint (règles Next + React Compiler)                                           |
| `npm test`                        | Vitest (stores, API simulée, schémas, composants)                               |
| `npm run format`                  | Prettier + tri des classes Tailwind                                             |
| `npm run assets:figma`            | Télécharge les photos des maquettes (`FIGMA_TOKEN` requis, voir `.env.example`) |

## Écrans (21 écrans Figma → routes)

| Parcours           | Écran Figma                                                               | Route                                                                             |
| ------------------ | ------------------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| 1 · Accès          | 1.1 Connexion · 1.2 Vérification en deux étapes                           | `/connexion`, `/verification`                                                     |
| 2 · Alertes        | 2.1 Tableau de bord                                                       | `/tableau-de-bord`                                                                |
|                    | 2.2 Liste des alertes                                                     | `/alertes?tab=…&severity=…&q=…&page=…`                                            |
|                    | 2.3 Détail · 2.4 Rejeter avec motif · 2.5 Assigner une équipe             | `/alertes/ALT-2481`, `?action=rejeter`, `?action=assigner`                        |
|                    | 2.6 Carte en direct · suivi                                               | `/carte`                                                                          |
| 3 · Avis           | 3.1 Liste · 3.2 Détail · 3.3 Publier un avis (3 étapes)                   | `/avis-de-recherche`, `/avis-de-recherche/AVR-0318`, `/avis-de-recherche/nouveau` |
| 4 · Publications   | 4.1 Liste · 4.2 Nouvelle · 4.3 Archiver                                   | `/publications`, `/publications/nouvelle`, `/publications?archiver=pub-125`       |
| 5 · Analyse        | 5.1 Prédictions · 5.2 Recommandations · 5.3 Rapport IA · 5.4 Statistiques | `/ia/predictions`, `/ia/recommandations`, `/ia/rapports/nouveau`, `/statistiques` |
| 6 · Administration | 6.1 Notifications · 6.2 Utilisateurs · 6.3 Paramètres · Sécurité          | `/notifications`, `/utilisateurs`, `/parametres/securite`                         |

Bonus : recherche globale **Ctrl + K**, menu utilisateur (déconnexion), pages 404 et erreur.

**Parcours fil rouge à tester** : Tableau de bord → « Traiter » ALT-2481 → Rejeter (doublon) _ou_ Valider → Assigner Alpha-3 → Carte en direct (suivi) → Notifications (nouvelle assignation) → Paramètres (journal d’audit mis à jour).

## Architecture

Voir [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) : organisation par fonctionnalités, stratégie d’état, authentification, branchement du vrai backend.

## Limites connues

- Photos des personnes et avatars : non embarqués (initiales affichées). `npm run assets:figma` les récupère depuis Figma.
- Tuiles de carte : OpenStreetMap, nécessite un accès Internet.
- Les onglets Général / Notifications / Intégrations des Paramètres ne sont pas maquettés en V2.
- Interface desktop (≥ 1280 px), comme la maquette.
