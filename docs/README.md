# 📚 ITEXAL Beauty — Documentation Générale du Projet

> **Marketplace e-commerce cosmétiques de luxe — Cameroun**  
> Version : `2.0.0` · Stack : Next.js 16 / React 19 / Vanilla CSS · Statut : Production UI ✅

---

## 🗂️ Table des matières

| # | Document | Description | Lien |
|---|---|---|---|
| 1 | **Architecture** | Diagramme et structure du projet | [`docs/01-architecture.md`](./01-architecture.md) |
| 2 | **Documentation Technique** | Stack, conventions, composants clés | [`docs/02-technique.md`](./02-technique.md) |
| 3 | **Guide d'Utilisation & Lancement** | Installation, démarrage, déploiement | [`docs/03-guide-lancement.md`](./03-guide-lancement.md) |
| 4 | **Modélisation MCD / MLD** | Modèle conceptuel et logique des données | [`docs/04-modelisation-mcd-mld.md`](./04-modelisation-mcd-mld.md) |
| 5 | **Feuille de Route Backend** | Plan d'intégration Supabase / API | [`docs/05-feuille-de-route-backend.md`](./05-feuille-de-route-backend.md) |
| 6 | **Script SQL Supabase** | Toutes les tables, contraintes, RLS, triggers | [`docs/06-supabase-schema.sql`](./06-supabase-schema.sql) |

---

## 🎯 Présentation du Projet

**ITEXAL Beauty** est une marketplace e-commerce spécialisée dans les cosmétiques de luxe pour le marché camerounais. Elle propose une expérience d'achat haut de gamme, inspirée des grandes maisons (Dior, Gucci), avec une identité visuelle forte : palette nude/rose poudré, typographie serif élégante, animations douces.

### Fonctionnalités principales

| Module | Statut |
|---|---|
| Catalogue produits (37+ références) | ✅ Opérationnel |
| Panier & commande | ✅ Opérationnel |
| Authentification (OTP simulé) | ✅ Opérationnel |
| Espace compte & profil | ✅ Opérationnel |
| Blog beauté & articles | ✅ Opérationnel |
| Comparateur de produits | ✅ Opérationnel |
| Recherche temps réel | ✅ Opérationnel |
| Notifications | ✅ Opérationnel |
| PWA (mode hors-ligne) | ✅ Opérationnel |
| Page 404 animée | ✅ Opérationnel |
| Panel Admin | ✅ Interface |
| Paiement Mobile Money / MTN | 🔜 Intégration backend |
| Backend Supabase | 🔜 Feuille de route prête |
| API REST NestJS | 🔜 Architecture définie |

---

## 🛠️ Stack Technologique

```
Frontend     : Next.js 16.3 (App Router) + React 19
Styling      : Vanilla CSS (design system custom luxury)
Icons        : Lucide React 1.21
Validation   : Zod 4.4
State        : React Context API (StoreContext)
Données      : db.json + lib/services/api.js (data layer)
PWA          : Service Worker + Web Manifest
Déploiement  : Vercel (recommandé) / VPS Ubuntu
Backend cible: Supabase (PostgreSQL + Auth + Storage + Realtime)
```

---

## 🚀 Démarrage Rapide

```bash
# 1. Cloner le dépôt
git clone https://github.com/StalkeRalp/ITexal.git
cd ITexal/Marketplace

# 2. Installer les dépendances
npm install

# 3. Lancer en développement
npm run dev
# → http://localhost:3000

# 4. Build production
npm run build && npm start
```

---

## 📂 Structure Racine

```
Marketplace/
├── app/               # Pages Next.js (App Router)
├── composants/        # Composants partagés
├── lib/
│   ├── context/       # StoreContext (state global)
│   ├── data/          # Ponts vers db.json
│   ├── services/      # api.js (couche accès données)
│   └── store.js       # Export useStore
├── public/
│   ├── manifest.json  # PWA Manifest
│   └── sw.js          # Service Worker
├── styles/            # CSS système de design
├── db.json            # Base de données simulée (source de vérité)
└── docs/              # ← Vous êtes ici
```

---

## 👩‍💻 Équipe & Contact

| Rôle | Contact |
|---|---|
| Chef de projet / Dev Full-Stack | StalkeRalp |
| Dépôt GitHub | [github.com/StalkeRalp/ITexal](https://github.com/StalkeRalp/ITexal) |
| Branche principale | `marketplace` |

---

*Documentation générée le 13 août 2026 — ITEXAL Beauty v2.0.0*
