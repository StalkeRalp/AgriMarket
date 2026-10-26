# 🔧 Documentation Technique — ITEXAL Beauty

> Document : `02-technique.md` · Version 2.0.0

---

## 1. Stack & Dépendances

| Technologie | Version | Rôle |
|---|---|---|
| Next.js | 16.3.0 | Framework React (App Router, SSG, SSR) |
| React | 19.2.4 | Interface utilisateur |
| React DOM | 19.2.4 | Rendu DOM |
| Lucide React | 1.21.0 | Icônes vectorielles |
| Zod | 4.4.3 | Validation de schémas de formulaire |
| Vanilla CSS | — | Système de design custom (6 fichiers CSS) |

### Outils de développement
- **Node.js** ≥ 18.x
- **npm** ≥ 9.x
- **Git** — branche `marketplace` sur GitHub

---

## 2. Conventions de Code

### 2.1 Nommage des fichiers

| Type | Convention | Exemple |
|---|---|---|
| Pages Next.js | `page.jsx` dans dossier route | `app/catalogue/page.jsx` |
| Composants | PascalCase | `ProductCard.jsx` |
| Utilitaires | camelCase | `format.js` |
| Styles CSS | kebab-case | `main.css` |
| Données | SCREAMING_SNAKE pour constantes | `PRODUCT_SEED` |

### 2.2 Aliases d'import

Configuré dans `jsconfig.json` :
```json
{ "paths": { "@/*": ["./*"] } }
```

Usage :
```js
import { useStore } from "@/lib/store";
import { getProducts } from "@/lib/services/api";
import db from "@/db.json";
```

### 2.3 Directives client / serveur

- **`"use client"`** : Obligatoire pour tout composant utilisant `useState`, `useEffect`, `useStore`, événements DOM.
- **Server Components** : Pages statiques sans interactivité (ex: blog article, pages info).

---

## 3. Système de Design CSS

### 3.1 Fichiers CSS

| Fichier | Contenu |
|---|---|
| `styles/main.css` | Tout le système de design (variables, composants, utilitaires) |
| `styles/branding.css` | Variables CSS de la marque |
| `styles/cart-auth.css` | Panier latéral, formulaires auth |
| `styles/collection.css` | Grille produits, filtres, badges |
| `styles/ux.css` | Animations, micro-interactions |
| `styles/next.css` | Réinitialisation et overrides Next.js |

### 3.2 Variables CSS principales

```css
/* Palette marque */
--color-primary: #8738ce;        /* Violet luxe */
--color-secondary: #f5ebf8;      /* Lilas clair */
--color-accent: #eb4d4b;         /* Rouge/corail promotions */
--color-dark: #291533;           /* Texte foncé */
--color-nude: #fdf6f0;           /* Fond nude/beige */
--color-border: #e3dcd5;         /* Bordures sobres */

/* Typographie */
--font-display: 'Playfair Display'; /* Titres serif élégants */
--font-body: 'Inter', sans-serif;   /* Corps de texte */

/* Espacements */
--container-max: 1380px;
--section-gap: 80px;
```

### 3.3 Classes CSS clés

| Classe | Usage |
|---|---|
| `.container` | Conteneur centré max 1380px |
| `.orders-page` | Wrapper pages compte (breadcrumb + hero) |
| `.orders-hero` | Bandeau hero luxury (breadcrumb + titre) |
| `.orders-filter-bar` | Barre de navigation par onglets |
| `.orders-tab` | Tab de navigation (actif : `.is-active`) |
| `.order-card-luxury` | Carte contenu luxury (border, shadow) |
| `.dior-btn-primary` | Bouton principal (fond violet) |
| `.dior-btn-outline` | Bouton secondaire (contour) |
| `.user-menu-pill` | Pill utilisateur connecté dans header |
| `.not-found-container` | Conteneur page 404 animée |

---

## 4. Couche Données (Data Layer)

### 4.1 Principe

```
db.json (source de vérité simulée)
    │
    ├── lib/services/api.js   ← Couche d'accès données
    │       │
    │       ├── getProducts()
    │       ├── getProductById(id)
    │       ├── getOrders()
    │       ├── createOrder(data)
    │       ├── getBlogPosts()
    │       ├── getNotifications()
    │       └── ... (voir api.js)
    │
    └── lib/context/StoreContext.jsx  ← Initialisation état global
```

### 4.2 Structure de `db.json`

```json
{
  "products":    [...],   // 37 produits complets
  "categories":  [...],   // 5 catégories
  "brands":      [...],   // 6 marques
  "users":       [...],   // Utilisateurs de démonstration
  "addresses":   [...],   // Adresses de livraison démo
  "reviews":     [...],   // Avis clients démo
  "orders":      [...],   // Commandes démo
  "notifications": [...], // Notifications démo
  "blogPosts":   [...],   // 3 articles blog
  "infoPages":   {...}    // Pages info (CGV, livraison, etc.)
}
```

### 4.3 Remplacer `db.json` par le vrai backend

Seul `lib/services/api.js` doit être modifié :

```js
// AVANT (dev — db.json)
export async function getProducts() {
  return Promise.resolve(db.products || []);
}

// APRÈS (production — Supabase)
export async function getProducts() {
  const { data, error } = await supabase.from('products').select('*');
  if (error) throw error;
  return data;
}
```

✅ Aucun composant UI à modifier.

---

## 5. Authentification (Mode Simulation)

L'authentification actuelle est **simulée côté client** via `StoreContext` :

| Flux | Comportement |
|---|---|
| **Connexion** | Recherche dans `users[]`, auto-création si inconnu |
| **Inscription** | Génère un code OTP aléatoire (affiché dans toast) |
| **Vérification OTP** | Accepte n'importe quel code (mode démo) |
| **Mot de passe oublié** | Génère un token RST- affiché dans toast |
| **Réinitialisation** | Met à jour le mot de passe en état local |
| **Persistance** | `localStorage` via `itexal.user` |

> ⚠️ **Sécurité** : Ce mode est uniquement pour la démonstration. L'intégration Supabase Auth est documentée dans `05-feuille-de-route-backend.md`.

---

## 6. PWA — Progressive Web App

### 6.1 Fichiers PWA

| Fichier | Rôle |
|---|---|
| `public/manifest.json` | Identité app, icônes, raccourcis |
| `public/sw.js` | Service Worker (cache, offline, push) |
| `app/layout.jsx` | Enregistrement SW + meta tags Apple/Android |

### 6.2 Stratégies de Cache

| Type de ressource | Stratégie |
|---|---|
| Images CDN (Pexels) | Cache First |
| JS / CSS / Fonts | Cache First |
| Pages HTML | Network First → Cache Fallback |
| Offline fallback | Retour à la page d'accueil |

### 6.3 Installation PWA

L'application peut être installée sur :
- **Android** : Chrome → Menu → "Ajouter à l'écran d'accueil"
- **iOS** : Safari → Partager → "Sur l'écran d'accueil"
- **Desktop** : Chrome/Edge → Icône installation dans la barre d'adresse

---

## 7. Validation des Formulaires (Zod)

Les schémas Zod se trouvent dans `lib/validations/` :

| Fichier | Contenu |
|---|---|
| `auth.js` | Connexion, inscription, reset MDP |
| `commerce.js` | Commande, adresse de livraison |
| `produits.js` | Création / édition produit (admin) |
| `communication.js` | Formulaire de contact, demande produit |

---

## 8. Sécurité (Frontend)

| Mesure | Implémentation |
|---|---|
| XSS | Pas de `dangerouslySetInnerHTML` sur données utilisateur |
| CSRF | Stateless (pas de cookies de session) |
| Validation entrées | Schémas Zod sur tous les formulaires |
| Protection routes | Middleware Next.js + redirect si `!user` |
| Stockage sécurisé | Pas de mot de passe stocké en clair côté client |

---

## 9. SEO

| Élément | Statut |
|---|---|
| `<title>` dynamiques | ✅ Template `%s — ITEXAL Beauty` |
| Meta description | ✅ Par page |
| Open Graph | ✅ Configuré dans `layout.jsx` |
| `robots.txt` | ✅ Présent |
| `sitemap.xml` | ✅ Présent (42 routes) |
| Sémantique HTML5 | ✅ `<main>`, `<header>`, `<article>`, `<nav>` |
| Heading hierarchy | ✅ Un seul `<h1>` par page |

---

*Documentation Technique — ITEXAL Beauty v2.0.0 — Août 2026*
