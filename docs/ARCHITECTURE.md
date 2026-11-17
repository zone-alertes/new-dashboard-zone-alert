# Architecture frontend — Zone Alerte

Ce document explique **où vit chaque donnée** et **comment le code est rangé**. Il complète le README.

## 1. Organisation du répertoire

```
src/
├── app/                      Routes (App Router) — fichiers minces, aucune logique métier
│   ├── (auth)/               Parcours 1 : connexion, vérification 2FA (layout centré)
│   ├── (console)/            Parcours 2 à 6, enveloppés par la coquille (sidebar + barre supérieure)
│   ├── layout.tsx            Police Poppins, métadonnées, <Providers>
│   └── providers.tsx         QueryClientProvider + Toaster
├── components/
│   ├── ui/                   Primitives fidèles aux composants Figma « V2 — Fondations »
│   ├── layout/               Sidebar, Topbar, PageHeader, AppShell (garde client)
│   ├── feedback/             Toaster, palette de recherche Ctrl+K
│   ├── charts/               Graphiques SVG sans dépendance (barres, prévision, anneau)
│   └── map/                  Carte Leaflet (chargée côté client uniquement)
├── features/<domaine>/       Un dossier par domaine métier
│   ├── api.ts                Appels « réseau » (aujourd’hui le mock, demain fetch)
│   ├── queries.ts            Clés de requêtes + hooks TanStack Query + mutations
│   ├── schemas.ts            Schémas zod (formulaires, paramètres d’URL)
│   ├── constants.ts          Libellés et correspondances statut → ton de badge
│   └── components/           Écrans et composants propres au domaine
├── stores/                   État client global (Zustand)
├── hooks/                    Hooks transverses (useUrlState)
├── lib/                      api/http.ts, query/, mock/ (base en mémoire), utils/
├── config/navigation.ts      Arborescence de la sidebar + fil d’Ariane
├── styles/tokens.css         Variables Figma « ZA V2 / Couleurs »
├── types/domain.ts           Modèle métier partagé
└── proxy.ts                  Garde de route (ex-middleware)
```

Domaines : `auth`, `alerts`, `dashboard`, `live-map`, `notices`, `publications`, `ai`, `statistics`, `notifications`, `users`, `settings`.

Règle de dépendance : `app → features → components/ui → lib`. Une feature peut importer les **hooks** d’une autre (ex. la sidebar lit `useAlertCounts`), jamais son `api.ts` ni le mock directement.

## 2. Stratégie d’état (qui possède quoi)

| Type d’état                       | Outil                                | Exemples                                                                            | Pourquoi                                                                                |
| --------------------------------- | ------------------------------------ | ----------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| **État serveur** (données métier) | TanStack Query v5                    | alertes, avis, notifications, recommandations, utilisateurs                         | Cache, déduplication, polling « temps réel », mutations optimistes, invalidation ciblée |
| **État client global**            | Zustand v5 (+ `devtools`, `persist`) | session et étape 2FA, toasts, palette Ctrl+K, sélection d’alertes, brouillon d’avis | Partagé entre routes, sans re-rendu inutile grâce aux sélecteurs                        |
| **État d’URL**                    | `useUrlState` + zod                  | onglet, recherche, gravité, page, `?action=rejeter`, `?archiver=…`                  | Partageable par lien, survit au rechargement, bouton retour cohérent                    |
| **État de formulaire**            | react-hook-form + zod                | connexion, 2FA, rejet, assignation, avis, publication, invitation, rapport IA       | Validation déclarative, messages en français, un seul schéma réutilisé côté API         |
| **État local**                    | `useState`                           | menu ouvert, couches de la carte, média révélé                                      | Éphémère, n’intéresse qu’un composant                                                   |

Règles appliquées :

- **Aucune donnée serveur n’est copiée dans Zustand.** Les compteurs (sidebar, onglets, KPI) sont dérivés du cache via `select`.
- **Clés hiérarchiques** (`alertKeys.all → lists → list(filters) → detail(ref)`) : une mutation invalide `alertKeys.all` et toute l’application se met à jour (liste, compteurs, carte, tableau de bord).
- **Mises à jour optimistes avec retour arrière** : valider / rejeter / assigner une alerte, marquer une notification lue, décider une recommandation.
- **Annulation** (US-09) : toast « Annuler » après validation, rejet et archivage.
- **Déconnexion** : `logout()` vide la session persistée, supprime le cookie et purge le cache de requêtes (aucune fuite entre comptes).
- **Persistance** : session en `localStorage`, brouillon d’avis en `sessionStorage` ; rien d’autre n’est persisté.

## 3. Authentification

1. `/connexion` → `authApi.login` → `startTwoFactor(user)` (statut `pending_2fa`).
2. `/verification` → `authApi.verifyOtp` → `completeTwoFactor()` pose le cookie `za_session`.
3. `src/proxy.ts` redirige tout visiteur sans cookie vers `/connexion?redirect=…` **avant** le rendu ; `AppShell` refait la vérification côté client après réhydratation.
4. Les permissions (`useCan("alert.qualify")`) masquent les actions et entrées de menu selon le rôle, conformément à la matrice de l’écran 6.2. L’API reste l’autorité finale.

## 4. Brancher le vrai backend

Tout passe par `src/lib/api/http.ts` → `mockRequest()`. Pour une API REST :

```ts
// features/alerts/api.ts
list: (f) => http<AlertPage>(`/alerts?${new URLSearchParams(...)}`),
```

Les hooks, stores et composants ne changent pas. Pour le temps réel, remplacer le `refetchInterval` par un WebSocket/SSE qui appelle `queryClient.invalidateQueries({ queryKey: alertKeys.all })`.

## 5. Fidélité Figma

- Couleurs : variables `--za-*` (`styles/tokens.css`) exposées à Tailwind (`bg-brand`, `text-ink-2`, `border-line`…).
- Typographie : utilitaires `type-display`, `type-h1` … `type-kpi` = styles texte « V2/… » (Poppins 400/500/600).
- Composants : `Button` (Primaire/Secondaire/Discret/Danger), `Badge` (6 tons), `KpiCard`, `TextField`, `Topbar`, `Sidebar` reprennent tailles, rayons et espacements des composants Figma.
- Statuts → badges : En qualification = avertissement, Validée = neutre, Intervention = info, Résolue = succès, Rejetée/Fusionnée/Clôturée = neutre.
- Le jeu de données reproduit l’état du dimanche 8 nov. 2026, 18:45 (18 alertes actives, cas fil rouge ALT-2481, équipe Alpha-3).
