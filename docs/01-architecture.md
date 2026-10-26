# 🏗️ Architecture du Projet — ITEXAL Beauty

> Document : `01-architecture.md` · Version 2.0.0

---

## 1. Vue d'ensemble

ITEXAL Beauty est une **Single Page Application (SPA) hybride** construite avec **Next.js 16 App Router**. L'architecture suit le modèle **JAMstack** avec rendu statique côté serveur (SSG/SSR) et interactions dynamiques côté client via React Context.

```
┌────────────────────────────────────────────────────────────────┐
│                         NAVIGATEUR CLIENT                      │
│                                                                │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │               Next.js App (App Router)                   │  │
│  │                                                          │  │
│  │  ┌─────────────┐  ┌──────────────┐  ┌───────────────┐  │  │
│  │  │  SiteLayout │  │  StoreContext│  │  Service Worker│  │  │
│  │  │  (navbar,   │  │  (état global│  │  (PWA cache,  │  │  │
│  │  │   footer)   │  │   panier,    │  │   offline,    │  │  │
│  │  └─────────────┘  │   user...)   │  │   push notifs)│  │  │
│  │                   └──────────────┘  └───────────────┘  │  │
│  │                          │                               │  │
│  │              ┌───────────▼───────────┐                  │  │
│  │              │   lib/services/api.js │                  │  │
│  │              │   (Data Access Layer) │                  │  │
│  │              └───────────┬───────────┘                  │  │
│  │                          │                               │  │
│  │              ┌───────────▼───────────┐                  │  │
│  │              │       db.json         │                  │  │
│  │              │  (Source de vérité    │                  │  │
│  │              │   simulée — dev)      │                  │  │
│  │              └───────────────────────┘                  │  │
│  └──────────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────┘
                              │ (futur)
                              ▼
┌────────────────────────────────────────────────────────────────┐
│                    BACKEND (À venir)                           │
│                                                                │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │                    SUPABASE                              │  │
│  │                                                          │  │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌────────┐  │  │
│  │  │ PostgreSQL│  │   Auth   │  │ Storage  │  │Realtime│  │  │
│  │  │ (tables, │  │ (JWT,    │  │ (images  │  │(notifs,│  │  │
│  │  │ RLS, RPC)│  │  OTP...)  │  │  produits│  │ stock) │  │  │
│  │  └──────────┘  └──────────┘  └──────────┘  └────────┘  │  │
│  └─────────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────┘
```

---

## 2. Structure des Dossiers

```
Marketplace/
│
├── app/                          # Next.js App Router
│   ├── layout.jsx                # Layout racine + PWA meta
│   ├── page.jsx                  # Page d'accueil
│   ├── not-found.jsx             # Page 404 animée (nuages)
│   ├── loading.jsx               # Écran de chargement
│   │
│   ├── catalogue/                # Catalogue produits (filtres, tri)
│   ├── produit/[id]/             # Fiche produit détaillée
│   ├── panier/                   # Panier et récapitulatif
│   ├── commande/                 # Formulaire de commande
│   ├── confirmation/[id]/        # Page de confirmation post-achat
│   ├── commandes/                # Historique commandes client
│   ├── commandes/[id]/           # Détail d'une commande
│   │
│   ├── connexion/                # Login (email + password simulé)
│   ├── inscription/              # Inscription + déclenchement OTP
│   ├── verification-otp/         # Vérification code OTP
│   ├── mot-de-passe-oublie/      # Demande réinitialisation MDP
│   ├── reinitialisation-mot-de-passe/ # Reset MDP par token
│   │
│   ├── profil/                   # Page profil & paramètres éditable
│   ├── compte/                   # Dashboard compte client
│   ├── adresses/                 # Gestion adresses de livraison
│   ├── favoris/                  # Liste d'envies
│   ├── avis/                     # Avis clients
│   ├── suivi-commande/           # Suivi colis temps réel
│   ├── notifications/            # Centre de notifications
│   │
│   ├── blog/                     # Blog beauté (grille d'articles)
│   ├── blog/[id]/                # Article de blog détaillé
│   │
│   ├── soins/                    # Page catégorie Soins
│   ├── maquillage/               # Page catégorie Maquillage
│   ├── parfums/                  # Page catégorie Parfums
│   ├── capillaire/               # Page catégorie Capillaire
│   ├── nouveautes/               # Nouvelles arrivées
│   ├── promotions/               # Produits en promotion
│   ├── marques/                  # Annuaire des marques
│   ├── comparateur/              # Comparateur de produits
│   │
│   ├── a-propos/                 # À propos ITEXAL
│   ├── contact/                  # Formulaire de contact
│   ├── faq/                      # Foire aux questions
│   ├── livraison/                # Politique de livraison
│   ├── retours/                  # Politique de retours
│   ├── conditions/               # CGV
│   ├── confidentialite/          # Politique de confidentialité
│   ├── paiements/                # Méthodes de paiement
│   ├── demande-produit/          # Demande de produit spécifique
│   │
│   └── admin/                    # Panel admin (protégé par rôle)
│       ├── page.jsx              # Dashboard administrateur
│       ├── [section]/            # Sections dynamiques admin
│       └── produits/
│           ├── nouveau/          # Création produit
│           └── [id]/             # Édition produit
│
├── composants/                   # Composants React partagés
│   ├── SiteLayout.jsx            # Header + Footer + Toast global
│   ├── AccountShell.jsx          # Shell espace compte (tabs nav)
│   ├── LogoutModal.jsx           # Modal confirmation déconnexion
│   ├── ProductCard.jsx           # Carte produit
│   ├── Collection.jsx            # Grille de produits + filtres
│   ├── AdminLayout.jsx           # Layout panel admin
│   ├── AdminSection.jsx          # Sections admin réutilisables
│   └── InfoPage.jsx              # Template pages informationnelles
│
├── lib/
│   ├── context/
│   │   └── StoreContext.jsx      # État global (panier, user, produits...)
│   ├── services/
│   │   └── api.js                # Couche d'accès données (Data Access Layer)
│   ├── data/
│   │   ├── initial-seed.js       # Re-export PRODUCT_SEED ← db.json
│   │   ├── blog.js               # Re-export BLOG_POSTS ← db.json
│   │   └── info.js               # Re-export INFO_PAGES ← db.json
│   ├── validations/              # Schémas Zod de validation
│   ├── securite/                 # Utilitaires sécurité
│   ├── format.js                 # Formateurs (monnaie, date...)
│   └── store.js                  # Export hook useStore
│
├── styles/                       # Système de design CSS
│   ├── main.css                  # CSS principal (6984 lignes)
│   ├── branding.css              # Variables marque
│   ├── cart-auth.css             # Styles panier & auth
│   ├── collection.css            # Styles grille produits
│   ├── next.css                  # Overrides Next.js
│   └── ux.css                    # Animations & micro-interactions
│
├── public/
│   ├── manifest.json             # PWA Manifest
│   ├── sw.js                     # Service Worker
│   ├── Images/                   # Médias locaux
│   └── logo/                     # Logo ITEXAL
│
├── db.json                       # 🔑 Base de données simulée
├── next.config.mjs               # Configuration Next.js + redirections
├── middleware.js                 # Middleware de navigation (route protection)
└── docs/                         # Documentation du projet
```

---

## 3. Flux de Données

```
Composant UI
    │
    ├── useStore() ──────────────► StoreContext
    │                                  │
    │                          ┌───────▼───────┐
    │                          │  localStorage  │  (persistance client)
    │                          └───────┬───────┘
    │                                  │
    └──── lib/services/api.js ─────────▼──────► db.json (dev)
                                                    │
                                              (futur: Supabase API)
```

---

## 4. Gestion d'État (StoreContext)

Le `StoreContext` expose les états et actions suivants :

| Catégorie | État / Action |
|---|---|
| **Produits** | `products`, `setProducts` |
| **Panier** | `cart`, `lines`, `itemCount`, `addToCart`, `removeFromCart`, `setQuantity` |
| **Favoris** | `wishlist`, `toggleWishlist` |
| **Commandes** | `orders`, `checkout`, `setOrders` |
| **Utilisateur** | `user`, `login`, `logout`, `register`, `updateUserProfile` |
| **Auth OTP** | `pendingVerification`, `sendOtp`, `verifyOtp` |
| **Notifications** | `notifications`, `addNotification`, `markAllAsRead` |
| **Adresses** | `addresses`, `setAddresses` |
| **Avis** | `reviews`, `setReviews` |
| **UI** | `cartOpen`, `setCartOpen`, `hydrated`, `notify` (toast) |

---

## 5. Architecture PWA

```
Service Worker (sw.js)
│
├── INSTALL → Pré-cache assets statiques (shell applicatif)
│
├── ACTIVATE → Nettoyage anciens caches
│
├── FETCH
│   ├── Images CDN (Pexels) → Cache First
│   ├── JS/CSS/Fonts → Cache First
│   └── Pages HTML → Network First → Cache Fallback
│
├── SYNC → Synchronisation commandes en file d'attente (offline)
│
└── PUSH → Notifications push (promotions, suivi colis)
```

---

*Architecture — ITEXAL Beauty v2.0.0 — Août 2026*
