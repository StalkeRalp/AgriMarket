# ITEXAL BEAUTY — DOCUMENT D'ARCHITECTURE & SPÉCIFICATIONS TECHNIQUES (ralphon.md)

---

## 1. VISION & ARCHITECTURE DU PROJET

**ITEXAL Beauty** est une plateforme e-commerce PWA de Haute Cosmétique et Luxe dédiée au marché camerounais (Douala, Yaoundé et autres villes).

### Choix d'Architecture : Next.js App Router (v16+) & React 19
- **Framework** : Next.js 16 (App Router)
- **Rendu Hybrid** : Server Components (SSR) pour la rapidité d'affichage et l'indexation SEO, combinés à des Client Components (`"use client"`) pour les fonctionnalités d'interaction fluide (panier, filtres live, authentification, PWA).
- **Raison du Choix** :
  - SEO optimal grâce au SSR automatique.
  - Performances de chargement de classe internationale.
  - Structure de dossier basée sur le routage par répertoires (`app/`).
  - Support natif des PWA et gestion moderne du stockage client.

---

## 2. MODÈLE DE GESTION DES RÔLES & ACCÈS

La plateforme sépare strictly l'expérience entre deux niveaux de privilèges :

### 2.1. Rôle "Visiteur" (Non Connecté)
Le visiteur dispose d'une liberté totale de découverte sans aucune friction d'inscription :
- **Autorisé** :
  - Parcourir l'ensemble du catalogue, des collections (Soins, Maquillage, Parfums, Capillaire) et des marques.
  - Utiliser le moteur de recherche en direct et le comparateur de produits.
  - Consulter les fiches produit détaillées et lire les avis.
  - **Ajouter des produits au Panier** (persistance locale dans le navigateur).
- **Restreint / Redirigé vers Connexion** :
  - Pas d'icônes d'action privées dans le header (Notifications, Liste d'envies/Favoris, Mes Commandes sont masquées).
  - La tentative de validation du panier (`/commande`) redirige automatiquement vers `/connexion?redirect=/commande`.
  - L'accès direct aux pages d'espace client (`/profil`, `/commandes`, `/favoris`, `/notifications`, `/adresses`) est bloqué par le hook `useRequireAuth`.

### 2.2. Rôle "Client" (Compte Authentifié)
Le client connecté bénéficie de l'expérience Haute Beauté intégrale :
- **Header Dédié** :
  - Badges d'action dynamiques : Notifications privées, Liste d'envies (Wishlist), Historique des Commandes.
  - Pill avec avatar / initiales et nom d'utilisateur.
- **Fonctionnalités Privilégiées** :
  - Sauvegarde et gestion de sa liste de favoris (Wishlist).
  - Validation de commande avec géolocalisation GPS instantanée et paiement Mobile Money (MTN MoMo, Orange Money) ou Carte bancaire.
  - Suivi de livraison en temps réel et accès aux factures/bordereaux.
  - Modification du profil (type de peau, type de cheveux, avatar custom) et carnet d'adresses.

---

## 3. LANGAGES & CONVENTIONS DE NOMMAGE

### Langages & Stack Technique
- **Logic & UI** : JavaScript (ES6+ / React 19 JSX).
- **Styling** : Vanilla CSS modulaire centralisé dans `styles/main.css` (tokens de variables CSS `:root`, `clamp()`, `grid`, `glassmorphism`, animations fluides).
- **Icons** : `lucide-react`.

### Conventions de Nommage des Fichiers
- **Pages & Routes (`app/`)** : Noms de dossiers en `kebab-case` en français sémantique (`/panier`, `/catalogue`, `/suivi-commande`, `/mot-de-passe-oublie`).
- **Composants (`composants/`)** : Noms de fichiers en `PascalCase` (`SiteLayout.jsx`, `ProductCard.jsx`, `RequireAuth.jsx`, `PWAInstallBanner.jsx`).
- **Styles (`styles/`)** : Noms en `kebab-case` (`main.css`, `collection.css`).
- **Services & Utilities (`lib/`)** : Noms en `kebab-case` ou `camelCase` (`store.js`, `format.js`, `api.js`).

---

## 4. STABILITÉ TECHNIQUE & CORRECTION HYDRATION PWA

### Résolution Définitive des Erreurs d'Hydratation (Hydration Mismatch)
Les données d'état d'authentification (`user`), de panier et de badges provenant du stockage local (`localStorage`) diffèrent inévitablement entre le rendu initial du serveur (SSR) et le client.

**Solutions d'Hydratation Mises en Place** :
1. **Header Action Icons Guard (`mounted && user`)** : L'affichage des icônes privilèges réservées aux clients authentifiés (*Notifications*, *Favoris*, *Commandes*) ainsi que la pillule de compte utilisateur dans `SiteLayout.jsx` sont strictement conditionnés par la variable `mounted`. Au cours du premier passage d'hydratation, le client produit exactement le même DOM HTML que le serveur node.js (panier public + bouton connexion). Une fois hydraté (`useEffect`), l'interface bascule sans moindre conflit vers l'état connecté du client.
2. **Footer Client-Side Guard (`mounted`)** : Le footer d'inspiration Fenty/Dior est enveloppé par une vérification `mounted` active au niveau du client uniquement (`useEffect(() => setMounted(true), [])`), isolant totalement la structure du footer contre toute altération post-SSR par les extensions de traduction navigateur (Google Translate, DeepL, etc.).
3. **Support PWA Native** : Le manifest (`public/manifest.json`) et le Service Worker (`public/sw.js`) assurent l'installation native sur Android/iOS et la mise en cache hors-ligne des ressources statiques.

---

## 5. ROADMAP ET CONTINUITÉ BACKEND

1. **Phase 1 (Actuelle)** : Store React centralisé dans `lib/store.js` alimenté par `db.json` et la couche d'abstraction API `lib/services/api.js`.
2. **Phase 2 (Migration Supabase)** : Remplacement du mock API dans `lib/services/api.js` par les requêtes Supabase Client en suivant le schéma de base de données documenté dans `docs/06-supabase-schema.sql`.
