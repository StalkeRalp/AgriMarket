# 🚀 Guide d'Utilisation & Lancement — ITEXAL Beauty

> Document : `03-guide-lancement.md` · Version 2.0.0

---

## 1. Prérequis

| Outil | Version minimale | Vérification |
|---|---|---|
| Node.js | ≥ 18.x | `node --version` |
| npm | ≥ 9.x | `npm --version` |
| Git | ≥ 2.x | `git --version` |

---

## 2. Installation

### 2.1 Cloner le dépôt

```bash
git clone https://github.com/StalkeRalp/ITexal.git
cd ITexal/Marketplace
```

### 2.2 Basculer sur la bonne branche

```bash
git checkout marketplace
```

### 2.3 Installer les dépendances

```bash
npm install
```

---

## 3. Lancer en Développement

```bash
npm run dev
```

- L'application sera disponible sur : **http://localhost:3000**
- Le rechargement à chaud (Hot Reload) est activé automatiquement.
- Le Service Worker PWA **ne s'active pas** en mode dev (comportement normal).

> **Astuce** : Ouvrez la console navigateur (F12) pour voir les logs `[PWA]` et `[SW]`.

---

## 4. Build de Production

```bash
npm run build
```

Résultat attendu :
```
✓ Compiled successfully
✓ Collecting page data (42 routes)
✓ Generating static pages (42/42)
✓ Finalizing page optimization
```

### Lancer le serveur de production

```bash
npm start
```

- Disponible sur : **http://localhost:3000**
- Le Service Worker PWA **s'active** en production.

---

## 5. Variables d'Environnement

Créez un fichier `.env.local` à la racine (copier depuis `.env.example` si disponible) :

```env
# Supabase (à remplir lors de l'intégration backend)
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Configuration application
NEXT_PUBLIC_APP_URL=https://itexal.cm
NEXT_PUBLIC_APP_NAME=ITEXAL Beauty

# Paiement Mobile Money (à venir)
MTN_API_KEY=
ORANGE_API_KEY=
```

> ⚠️ Ne jamais committer `.env.local` — il est dans `.gitignore`.

---

## 6. Comptes de Démonstration

En mode développement (données simulées `db.json`) :

| Rôle | Email | Mot de passe |
|---|---|---|
| **Administrateur** | `admin@itexal.cm` | `admin123` |
| **Client** | `client@demo.cm` | `demo123` |
| **Tout email** | N'importe quel email | N'importe quel mot de passe |

> En mode démo, n'importe quel email/mot de passe fonctionne — un compte est créé automatiquement.

### Flux d'inscription OTP simulé
1. Aller sur `/inscription`
2. Remplir le formulaire → Soumettre
3. Un **code OTP à 6 chiffres** apparaît dans le toast en bas de l'écran
4. Copier ce code et le saisir sur `/verification-otp`
5. Compte créé et connexion automatique

---

## 7. Navigation Principale

| URL | Page |
|---|---|
| `/` | Page d'accueil |
| `/catalogue` | Catalogue complet (filtres, tri, recherche) |
| `/produit/[id]` | Fiche produit détaillée |
| `/panier` | Panier d'achat |
| `/commande` | Formulaire de commande |
| `/connexion` | Page de connexion |
| `/inscription` | Page d'inscription |
| `/compte` | Tableau de bord compte |
| `/profil` | Profil & paramètres (éditable) |
| `/commandes` | Historique commandes |
| `/blog` | Blog beauté |
| `/admin` | Panel administrateur |

---

## 8. Panel Administrateur

Accès : `/admin`  
Rôle requis : `ADMIN`

| Section | URL |
|---|---|
| Dashboard | `/admin` |
| Gestion produits | `/admin/produits` |
| Nouveau produit | `/admin/produits/nouveau` |
| Éditer produit | `/admin/produits/[id]` |
| Gestion commandes | `/admin/commandes` |
| Gestion clients | `/admin/clients` |

---

## 9. Déploiement sur Vercel (Recommandé)

### Via CLI

```bash
npm install -g vercel
vercel login
vercel --prod
```

### Via Interface Web

1. Connecter le dépôt GitHub sur [vercel.com](https://vercel.com)
2. Sélectionner la branche `marketplace`
3. Framework : **Next.js** (auto-détecté)
4. Ajouter les variables d'environnement dans les Settings Vercel
5. Déployer → URL générée automatiquement

### Configuration recommandée Vercel

```json
{
  "framework": "nextjs",
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "installCommand": "npm install"
}
```

---

## 10. Déploiement sur VPS Ubuntu (Avancé)

```bash
# 1. Sur le serveur VPS (Ubuntu 22.04+)
sudo apt update && sudo apt install -y nodejs npm nginx certbot

# 2. Cloner et installer
git clone https://github.com/StalkeRalp/ITexal.git /var/www/itexal
cd /var/www/itexal/Marketplace
npm install && npm run build

# 3. Démarrer avec PM2
npm install -g pm2
pm2 start "npm start" --name itexal-beauty
pm2 startup && pm2 save

# 4. Configurer Nginx (reverse proxy)
# /etc/nginx/sites-available/itexal.cm
server {
    listen 80;
    server_name itexal.cm www.itexal.cm;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

# 5. HTTPS avec Certbot
sudo certbot --nginx -d itexal.cm -d www.itexal.cm
```

---

## 11. Tester la PWA

1. Builder en production : `npm run build && npm start`
2. Ouvrir Chrome sur `http://localhost:3000`
3. F12 → Application → Service Workers → Vérifier que `sw.js` est enregistré
4. F12 → Application → Manifest → Vérifier les icônes et métadonnées
5. F12 → Lighthouse → Run PWA audit

---

## 12. Commandes Utiles

```bash
# Développement
npm run dev              # Serveur dev avec hot reload

# Production
npm run build            # Build optimisé
npm start                # Serveur de production

# Linting (si configuré)
npm run lint

# Git workflow
git add .
git commit -m "feat: description"
git push origin marketplace
```

---

*Guide Lancement — ITEXAL Beauty v2.0.0 — Août 2026*
