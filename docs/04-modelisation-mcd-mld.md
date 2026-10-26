# 📊 Modélisation MCD / MLD — ITEXAL Beauty

> Document : `04-modelisation-mcd-mld.md` · Version 2.0.0

---

## 1. Modèle Conceptuel de Données (MCD)

Le MCD représente les entités métier du projet et leurs relations, indépendamment de tout SGBD.

```
┌─────────────────┐          ┌─────────────────────┐
│    UTILISATEUR  │          │      CATEGORIE       │
├─────────────────┤          ├─────────────────────┤
│ id (PK)         │          │ id (PK)              │
│ nom             │          │ nom                  │
│ prenom          │          │ slug                 │
│ email           │          │ description          │
│ telephone       │          └──────────┬──────────┘
│ mot_de_passe    │                     │ 1
│ role            │                     │ appartient à
│ avatar          │                     │
│ skin_type       │                   N │
│ hair_type       │          ┌──────────▼──────────┐        ┌────────────────┐
│ created_at      │          │       PRODUIT        │        │     MARQUE     │
└────────┬────────┘          ├─────────────────────┤        ├────────────────┤
         │                   │ id (PK)              │N      1│ id (PK)        │
         │ possède           │ reference            ├────────┤ nom            │
         │                   │ nom                  │        │ logo_url       │
         │                   │ description          │        │ description    │
         │         1         │ description_courte   │        └────────────────┘
         └──────────────────►│ prix                 │
                          N  │ ancien_prix          │
                             │ image                │
         ┌──────────────────►│ images[]             │
         │                   │ stock                │
         │                   │ new                  │
         │         1         │ promo                │
         │                   │ featured             │
         │                   │ taille               │
         │                   │ benefices[]          │
         │                   │ composition          │
         │                   │ usage                │
         │                   │ note_moyenne         │
         │                   │ nombre_avis          │
         │                   │ created_at           │
         │                   └──────────┬──────────┘
         │                              │
    PANIER                              │ fait l'objet d'
    (état transitoire)                  │
         │                           N  │
         │                   ┌──────────▼──────────┐
         │                   │       AVIS          │
         │                   ├─────────────────────┤
         │                   │ id (PK)              │
         │                   │ note (1-5)           │
         │                   │ titre                │
         │                   │ commentaire          │
         │                   │ validated            │
         │                   │ created_at           │
         │                   └─────────────────────┘
         │
         │
┌────────▼────────┐          ┌─────────────────────┐
│    COMMANDE     │1        N│  LIGNE_COMMANDE      │
├─────────────────┤          ├─────────────────────┤
│ id (PK)         ├──────────┤ id (PK)              │
│ statut          │          │ commande_id (FK)     │
│ sous_total      │          │ produit_id (FK)      │
│ frais_livraison │          │ nom_produit           │
│ total           │          │ prix_unitaire        │
│ ville           │          │ quantite             │
│ adresse         │          │ image                │
│ created_at      │          └─────────────────────┘
└────────┬────────┘
         │
         │
┌────────▼────────┐          ┌─────────────────────┐
│    ADRESSE      │          │    NOTIFICATION      │
├─────────────────┤          ├─────────────────────┤
│ id (PK)         │          │ id (PK)              │
│ utilisateur_id  │          │ utilisateur_id (FK)  │
│ libelle         │          │ type                 │
│ ville           │          │ titre                │
│ adresse_detail  │          │ message              │
│ telephone       │          │ lien                 │
│ par_defaut      │          │ lue                  │
└─────────────────┘          │ created_at           │
                             └─────────────────────┘

┌─────────────────┐          ┌─────────────────────┐
│  LISTE_FAVORIS  │          │   ARTICLE_BLOG      │
├─────────────────┤          ├─────────────────────┤
│ utilisateur_id  │          │ id (PK)              │
│ produit_id      │          │ titre                │
│ added_at        │          │ extrait              │
└─────────────────┘          │ corps[]              │
                             │ image                │
                             │ categorie            │
                             │ temps_lecture        │
                             │ published_at         │
                             └─────────────────────┘

┌─────────────────────────────────────────────────────┐
│              DEMANDE_PRODUIT                        │
├─────────────────────────────────────────────────────┤
│ id (PK) · nom · email · produit_demande · message   │
│ statut · created_at                                 │
└─────────────────────────────────────────────────────┘
```

---

## 2. Cardinalités

| Relation | Cardinalité | Description |
|---|---|---|
| UTILISATEUR → COMMANDE | 1,N | Un client passe plusieurs commandes |
| COMMANDE → LIGNE_COMMANDE | 1,N | Une commande contient plusieurs lignes |
| PRODUIT → LIGNE_COMMANDE | 1,N | Un produit peut être dans plusieurs lignes |
| PRODUIT → CATEGORIE | N,1 | Un produit appartient à une catégorie |
| PRODUIT → MARQUE | N,1 | Un produit appartient à une marque |
| UTILISATEUR → AVIS | 1,N | Un client donne plusieurs avis |
| PRODUIT → AVIS | 1,N | Un produit reçoit plusieurs avis |
| UTILISATEUR → ADRESSE | 1,N | Un client a plusieurs adresses |
| UTILISATEUR → LISTE_FAVORIS | N,N | Plusieurs clients aiment plusieurs produits |
| UTILISATEUR → NOTIFICATION | 1,N | Un client reçoit plusieurs notifications |

---

## 3. Modèle Logique de Données (MLD)

Le MLD traduit le MCD en tables relationnelles pour PostgreSQL (Supabase) :

### 3.1 Tables principales

```
users (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email         VARCHAR(255) UNIQUE NOT NULL,
  nom           VARCHAR(100),
  prenom        VARCHAR(100),
  telephone     VARCHAR(20),
  role          VARCHAR(20) DEFAULT 'CLIENT' CHECK (role IN ('CLIENT','ADMIN')),
  avatar_url    TEXT,
  skin_type     VARCHAR(50),
  hair_type     VARCHAR(50),
  favorite_brand VARCHAR(100),
  notif_email   BOOLEAN DEFAULT TRUE,
  notif_whatsapp BOOLEAN DEFAULT TRUE,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
)

categories (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nom           VARCHAR(100) NOT NULL,
  slug          VARCHAR(100) UNIQUE NOT NULL,
  description   TEXT,
  image_url     TEXT,
  ordre         INTEGER DEFAULT 0
)

brands (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nom           VARCHAR(100) NOT NULL,
  slug          VARCHAR(100) UNIQUE NOT NULL,
  logo_url      TEXT,
  description   TEXT
)

products (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reference     VARCHAR(50) UNIQUE NOT NULL,
  nom           VARCHAR(200) NOT NULL,
  description   TEXT,
  description_courte TEXT,
  prix          NUMERIC(10,2) NOT NULL CHECK (prix > 0),
  ancien_prix   NUMERIC(10,2),
  stock         INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
  image         TEXT,
  images        TEXT[],
  taille        VARCHAR(50),
  benefices     TEXT[],
  composition   TEXT,
  usage_mode    TEXT,
  precautions   TEXT,
  note_moyenne  NUMERIC(3,2) DEFAULT 0 CHECK (note_moyenne BETWEEN 0 AND 5),
  nombre_avis   INTEGER DEFAULT 0,
  is_new        BOOLEAN DEFAULT FALSE,
  is_promo      BOOLEAN DEFAULT FALSE,
  is_featured   BOOLEAN DEFAULT FALSE,
  is_active     BOOLEAN DEFAULT TRUE,
  category_id   UUID REFERENCES categories(id) ON DELETE SET NULL,
  brand_id      UUID REFERENCES brands(id) ON DELETE SET NULL,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
)

orders (
  id            VARCHAR(30) PRIMARY KEY,
  user_id       UUID REFERENCES users(id) ON DELETE SET NULL,
  statut        VARCHAR(50) DEFAULT 'Nouvelle',
  sous_total    NUMERIC(10,2) NOT NULL,
  frais_livraison NUMERIC(10,2) DEFAULT 2000,
  total         NUMERIC(10,2) NOT NULL,
  nom_client    VARCHAR(100),
  email_client  VARCHAR(255),
  telephone_client VARCHAR(20),
  ville         VARCHAR(100),
  adresse       TEXT,
  notes         TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
)

order_items (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id      VARCHAR(30) REFERENCES orders(id) ON DELETE CASCADE,
  product_id    UUID REFERENCES products(id) ON DELETE SET NULL,
  nom_produit   VARCHAR(200) NOT NULL,
  prix_unitaire NUMERIC(10,2) NOT NULL,
  quantite      INTEGER NOT NULL CHECK (quantite > 0),
  image         TEXT
)

reviews (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id    UUID REFERENCES products(id) ON DELETE CASCADE,
  user_id       UUID REFERENCES users(id) ON DELETE SET NULL,
  nom_auteur    VARCHAR(100),
  note          INTEGER NOT NULL CHECK (note BETWEEN 1 AND 5),
  titre         VARCHAR(200),
  commentaire   TEXT,
  valide        BOOLEAN DEFAULT FALSE,
  created_at    TIMESTAMPTZ DEFAULT NOW()
)

addresses (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID REFERENCES users(id) ON DELETE CASCADE,
  libelle       VARCHAR(50) DEFAULT 'Maison',
  ville         VARCHAR(100) NOT NULL,
  adresse_detail TEXT NOT NULL,
  telephone     VARCHAR(20),
  par_defaut    BOOLEAN DEFAULT FALSE,
  created_at    TIMESTAMPTZ DEFAULT NOW()
)

wishlist (
  user_id       UUID REFERENCES users(id) ON DELETE CASCADE,
  product_id    UUID REFERENCES products(id) ON DELETE CASCADE,
  added_at      TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, product_id)
)

notifications (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID REFERENCES users(id) ON DELETE CASCADE,
  type          VARCHAR(30) CHECK (type IN ('ORDER','PROMO','SYSTEM','INFO')),
  titre         VARCHAR(200) NOT NULL,
  message       TEXT NOT NULL,
  lien          TEXT,
  lien_texte    VARCHAR(100),
  lue           BOOLEAN DEFAULT FALSE,
  icone         VARCHAR(50),
  created_at    TIMESTAMPTZ DEFAULT NOW()
)

blog_posts (
  id            VARCHAR(100) PRIMARY KEY,
  titre         VARCHAR(300) NOT NULL,
  extrait       TEXT,
  corps         TEXT[],
  image         TEXT,
  categorie     VARCHAR(100),
  temps_lecture VARCHAR(20),
  publie        BOOLEAN DEFAULT TRUE,
  published_at  TIMESTAMPTZ DEFAULT NOW()
)

product_requests (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nom           VARCHAR(100),
  email         VARCHAR(255),
  produit       VARCHAR(200) NOT NULL,
  message       TEXT,
  statut        VARCHAR(30) DEFAULT 'En attente',
  created_at    TIMESTAMPTZ DEFAULT NOW()
)
```

---

## 4. Dictionnaire de Données

| Table | Champ | Type | Contrainte | Description |
|---|---|---|---|---|
| users | role | VARCHAR | `IN ('CLIENT','ADMIN')` | Rôle applicatif |
| products | prix | NUMERIC | `> 0` | Prix en FCFA |
| products | stock | INTEGER | `>= 0` | Quantité disponible |
| reviews | note | INTEGER | `BETWEEN 1 AND 5` | Note étoiles |
| orders | statut | VARCHAR | Enum applicatif | Statut commande |
| order_items | quantite | INTEGER | `> 0` | Quantité commandée |

---

*Modélisation MCD/MLD — ITEXAL Beauty v2.0.0 — Août 2026*
