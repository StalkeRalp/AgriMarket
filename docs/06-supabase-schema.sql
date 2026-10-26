-- ============================================================
-- ITEXAL BEAUTY — Schéma SQL Supabase (PostgreSQL)
-- Version : 2.0.0 | Août 2026
-- 
-- Instructions :
--   1. Ouvrir Supabase → SQL Editor
--   2. Coller ce script et exécuter (Run)
--   3. Vérifier dans Table Editor que toutes les tables sont créées
-- ============================================================


-- ============================================================
-- 0. EXTENSIONS REQUISES
-- ============================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- Pour la recherche full-text


-- ============================================================
-- 1. ENUM TYPES
-- ============================================================
DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('CLIENT', 'ADMIN', 'MODERATOR');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE order_status AS ENUM (
    'Nouvelle',
    'En préparation',
    'Expédiée',
    'En cours de livraison',
    'Livrée',
    'Annulée',
    'Remboursée'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE notif_type AS ENUM ('ORDER', 'PROMO', 'SYSTEM', 'INFO', 'REVIEW');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE payment_method AS ENUM ('MTN_MONEY', 'ORANGE_MONEY', 'CARD', 'CASH_ON_DELIVERY');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;


-- ============================================================
-- 2. TABLE : CATEGORIES
-- ============================================================
CREATE TABLE IF NOT EXISTS categories (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nom         VARCHAR(100) NOT NULL,
  slug        VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  image_url   TEXT,
  ordre       INTEGER DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE categories IS 'Catégories de produits (Soins, Maquillage, Parfums, Capillaire, Nouveautés)';

-- Données initiales
INSERT INTO categories (nom, slug, description, ordre) VALUES
  ('Soins du Visage', 'soins', 'Sérums, crèmes et élixirs précieux.', 1),
  ('Maquillage', 'maquillage', 'Palettes, poudres et rouges à lèvres.', 2),
  ('Parfumerie', 'parfums', 'Fragrances d''exception et nectars royaux.', 3),
  ('Soins Capillaires', 'capillaire', 'Huiles, masques et sérums fortifiants.', 4),
  ('Nouveautés', 'nouveautes', 'Les dernières créations beauté.', 5)
ON CONFLICT (slug) DO NOTHING;


-- ============================================================
-- 3. TABLE : BRANDS (MARQUES)
-- ============================================================
CREATE TABLE IF NOT EXISTS brands (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nom         VARCHAR(100) NOT NULL,
  slug        VARCHAR(100) UNIQUE NOT NULL,
  logo_url    TEXT,
  description TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE brands IS 'Marques distribuées sur la marketplace';

INSERT INTO brands (nom, slug) VALUES
  ('L''Élixir', 'l-elixir'),
  ('Floréa', 'florea'),
  ('Aurore', 'aurore'),
  ('Natura', 'natura'),
  ('Éclat', 'eclat'),
  ('Clarité', 'clarite'),
  ('Belle', 'belle'),
  ('Aime', 'aime')
ON CONFLICT (slug) DO NOTHING;


-- ============================================================
-- 4. TABLE : USERS (Profils étendus — liés à auth.users Supabase)
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
  id              UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email           VARCHAR(255) UNIQUE NOT NULL,
  nom             VARCHAR(100),
  prenom          VARCHAR(100),
  telephone       VARCHAR(20),
  role            user_role DEFAULT 'CLIENT',
  avatar_url      TEXT,
  skin_type       VARCHAR(50),
  hair_type       VARCHAR(50),
  favorite_brand  VARCHAR(100),
  notif_email     BOOLEAN DEFAULT TRUE,
  notif_whatsapp  BOOLEAN DEFAULT TRUE,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE users IS 'Profils utilisateurs étendus, liés à auth.users de Supabase';


-- ============================================================
-- 5. TABLE : PRODUCTS (PRODUITS)
-- ============================================================
CREATE TABLE IF NOT EXISTS products (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reference           VARCHAR(50) UNIQUE NOT NULL,
  nom                 VARCHAR(200) NOT NULL,
  description         TEXT,
  description_courte  TEXT,
  prix                NUMERIC(10,2) NOT NULL CHECK (prix > 0),
  ancien_prix         NUMERIC(10,2) CHECK (ancien_prix IS NULL OR ancien_prix > prix),
  stock               INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
  image               TEXT,
  images              TEXT[] DEFAULT '{}',
  taille              VARCHAR(50),
  benefices           TEXT[] DEFAULT '{}',
  composition         TEXT,
  usage_mode          TEXT,
  precautions         TEXT,
  note_moyenne        NUMERIC(3,2) DEFAULT 0 CHECK (note_moyenne BETWEEN 0 AND 5),
  nombre_avis         INTEGER DEFAULT 0,
  is_new              BOOLEAN DEFAULT FALSE,
  is_promo            BOOLEAN DEFAULT FALSE,
  is_featured         BOOLEAN DEFAULT FALSE,
  is_active           BOOLEAN DEFAULT TRUE,
  category_id         UUID REFERENCES categories(id) ON DELETE SET NULL,
  brand_id            UUID REFERENCES brands(id) ON DELETE SET NULL,
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW()
);

-- Index pour performances
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_brand ON products(brand_id);
CREATE INDEX IF NOT EXISTS idx_products_is_active ON products(is_active);
CREATE INDEX IF NOT EXISTS idx_products_is_promo ON products(is_promo);
CREATE INDEX IF NOT EXISTS idx_products_is_featured ON products(is_featured);
CREATE INDEX IF NOT EXISTS idx_products_nom_trgm ON products USING GIN(nom gin_trgm_ops);

COMMENT ON TABLE products IS 'Catalogue de produits cosmétiques ITEXAL Beauty';


-- ============================================================
-- 6. TABLE : ORDERS (COMMANDES)
-- ============================================================
CREATE TABLE IF NOT EXISTS orders (
  id                  VARCHAR(30) PRIMARY KEY,
  user_id             UUID REFERENCES users(id) ON DELETE SET NULL,
  statut              order_status DEFAULT 'Nouvelle',
  sous_total          NUMERIC(10,2) NOT NULL CHECK (sous_total >= 0),
  frais_livraison     NUMERIC(10,2) DEFAULT 2000 CHECK (frais_livraison >= 0),
  total               NUMERIC(10,2) NOT NULL CHECK (total >= 0),
  methode_paiement    payment_method,
  paiement_ref        VARCHAR(100),
  paiement_confirme   BOOLEAN DEFAULT FALSE,
  -- Informations client (dénormalisées pour historique)
  nom_client          VARCHAR(100),
  email_client        VARCHAR(255),
  telephone_client    VARCHAR(20),
  ville               VARCHAR(100),
  adresse             TEXT,
  notes               TEXT,
  -- Suivi
  tracking_number     VARCHAR(100),
  estimated_delivery  DATE,
  delivered_at        TIMESTAMPTZ,
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_statut ON orders(statut);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);

COMMENT ON TABLE orders IS 'Commandes passées sur la marketplace';


-- ============================================================
-- 7. TABLE : ORDER_ITEMS (LIGNES DE COMMANDE)
-- ============================================================
CREATE TABLE IF NOT EXISTS order_items (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id        VARCHAR(30) NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id      UUID REFERENCES products(id) ON DELETE SET NULL,
  nom_produit     VARCHAR(200) NOT NULL,
  prix_unitaire   NUMERIC(10,2) NOT NULL CHECK (prix_unitaire > 0),
  quantite        INTEGER NOT NULL CHECK (quantite > 0),
  image           TEXT
);

CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);

COMMENT ON TABLE order_items IS 'Détail des produits par commande';


-- ============================================================
-- 8. TABLE : REVIEWS (AVIS CLIENTS)
-- ============================================================
CREATE TABLE IF NOT EXISTS reviews (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id  UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  user_id     UUID REFERENCES users(id) ON DELETE SET NULL,
  nom_auteur  VARCHAR(100),
  note        INTEGER NOT NULL CHECK (note BETWEEN 1 AND 5),
  titre       VARCHAR(200),
  commentaire TEXT,
  valide      BOOLEAN DEFAULT FALSE,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_reviews_product_id ON reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_reviews_user_id ON reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_valide ON reviews(valide);

COMMENT ON TABLE reviews IS 'Avis et notes clients sur les produits';


-- ============================================================
-- 9. TABLE : ADDRESSES (ADRESSES DE LIVRAISON)
-- ============================================================
CREATE TABLE IF NOT EXISTS addresses (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  libelle         VARCHAR(50) DEFAULT 'Maison',
  ville           VARCHAR(100) NOT NULL,
  adresse_detail  TEXT NOT NULL,
  telephone       VARCHAR(20),
  par_defaut      BOOLEAN DEFAULT FALSE,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_addresses_user_id ON addresses(user_id);

COMMENT ON TABLE addresses IS 'Adresses de livraison enregistrées par les clients';


-- ============================================================
-- 10. TABLE : WISHLIST (FAVORIS)
-- ============================================================
CREATE TABLE IF NOT EXISTS wishlist (
  user_id     UUID REFERENCES users(id) ON DELETE CASCADE,
  product_id  UUID REFERENCES products(id) ON DELETE CASCADE,
  added_at    TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, product_id)
);

COMMENT ON TABLE wishlist IS 'Liste de favoris clients (relation N-N utilisateur-produit)';


-- ============================================================
-- 11. TABLE : NOTIFICATIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS notifications (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type        notif_type DEFAULT 'INFO',
  titre       VARCHAR(200) NOT NULL,
  message     TEXT NOT NULL,
  lien        TEXT,
  lien_texte  VARCHAR(100),
  icone       VARCHAR(50),
  lue         BOOLEAN DEFAULT FALSE,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_lue ON notifications(lue);

COMMENT ON TABLE notifications IS 'Centre de notifications clients';


-- ============================================================
-- 12. TABLE : BLOG_POSTS (ARTICLES BLOG)
-- ============================================================
CREATE TABLE IF NOT EXISTS blog_posts (
  id            VARCHAR(100) PRIMARY KEY,
  titre         VARCHAR(300) NOT NULL,
  extrait       TEXT,
  corps         TEXT[] DEFAULT '{}',
  image         TEXT,
  categorie     VARCHAR(100),
  temps_lecture VARCHAR(20),
  publie        BOOLEAN DEFAULT TRUE,
  published_at  TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE blog_posts IS 'Articles du journal beauté ITEXAL';

INSERT INTO blog_posts (id, titre, extrait, corps, image, categorie, temps_lecture) VALUES
  ('routine-essentielle', 'Routine essentielle pour une peau lumineuse',
   'Découvrez les étapes clés pour un rituel beauté fluide, du nettoyage à l''hydratation.',
   ARRAY[
     'Pour une peau éclatante, commencez toujours par un nettoyage doux.',
     'Ensuite, appliquez un sérum hydratant et un soin adapté à votre type de peau.',
     'Terminez avec une crème riche ou un baume selon vos besoins, et n''oubliez jamais la protection solaire.'
   ],
   'https://images.pexels.com/photos/7649269/pexels-photo-7649269.jpeg?auto=compress&w=900',
   'Soins', '4 min'),
  ('choisir-parfum', 'Comment choisir un parfum qui vous ressemble',
   'Quelques conseils pour trouver la fragrance idéale selon votre style et vos envies.',
   ARRAY[
     'Un parfum se découvre en plusieurs temps: l''ouverture, le coeur et le sillage.',
     'Privilégiez des notes qui évoquent votre humeur: florales pour la douceur, boisées pour l''élégance.',
     'N''hésitez pas à choisir une fragrance qui évolue avec vous tout au long de la journée.'
   ],
   'https://images.pexels.com/photos/7668330/pexels-photo-7668330.jpeg?auto=compress&w=900',
   'Parfums', '5 min'),
  ('maquillage-minimaliste', 'Maquillage minimaliste: le naturel revisité',
   'Les astuces pour un maquillage léger, adapté au bureau comme au week-end.',
   ARRAY[
     'Un teint naturel passe par une base légère et un correcteur ciblé.',
     'Optez pour une touche de couleur sur les lèvres et un fard neutre sur les paupières.',
     'Pour un fini frais, appliquez un peu d''enlumineur sur les zones de lumière.'
   ],
   'https://images.pexels.com/photos/7315792/pexels-photo-7315792.jpeg?auto=compress&w=900',
   'Maquillage', '3 min')
ON CONFLICT (id) DO NOTHING;


-- ============================================================
-- 13. TABLE : PRODUCT_REQUESTS (DEMANDES PRODUITS)
-- ============================================================
CREATE TABLE IF NOT EXISTS product_requests (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nom             VARCHAR(100),
  email           VARCHAR(255),
  produit_demande VARCHAR(200) NOT NULL,
  message         TEXT,
  statut          VARCHAR(30) DEFAULT 'En attente',
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE product_requests IS 'Demandes de produits spécifiques soumises par les clients';


-- ============================================================
-- 14. TABLE : CONTACT_MESSAGES (MESSAGES CONTACT)
-- ============================================================
CREATE TABLE IF NOT EXISTS contact_messages (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nom         VARCHAR(100) NOT NULL,
  email       VARCHAR(255) NOT NULL,
  sujet       VARCHAR(200),
  message     TEXT NOT NULL,
  traite      BOOLEAN DEFAULT FALSE,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE contact_messages IS 'Messages envoyés via le formulaire de contact';


-- ============================================================
-- 15. TRIGGERS — Mise à jour automatique updated_at
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at_users
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER set_updated_at_products
  BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER set_updated_at_orders
  BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();


-- ============================================================
-- 16. TRIGGER — Mise à jour note_moyenne et nombre_avis sur products
-- ============================================================
CREATE OR REPLACE FUNCTION update_product_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE products
  SET
    note_moyenne = (
      SELECT COALESCE(AVG(note), 0)
      FROM reviews
      WHERE product_id = COALESCE(NEW.product_id, OLD.product_id)
        AND valide = TRUE
    ),
    nombre_avis = (
      SELECT COUNT(*)
      FROM reviews
      WHERE product_id = COALESCE(NEW.product_id, OLD.product_id)
        AND valide = TRUE
    )
  WHERE id = COALESCE(NEW.product_id, OLD.product_id);
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER sync_product_rating
  AFTER INSERT OR UPDATE OR DELETE ON reviews
  FOR EACH ROW EXECUTE FUNCTION update_product_rating();


-- ============================================================
-- 17. FONCTION RPC — Décrémenter le stock à la commande
-- ============================================================
CREATE OR REPLACE FUNCTION decrement_stock(p_product_id UUID, p_quantity INTEGER)
RETURNS VOID AS $$
BEGIN
  UPDATE products
  SET stock = GREATEST(0, stock - p_quantity)
  WHERE id = p_product_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- ============================================================
-- 18. FONCTION RPC — Créer le profil utilisateur après inscription
-- ============================================================
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, nom, prenom)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'nom',
    NEW.raw_user_meta_data->>'prenom'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger sur auth.users (Supabase Auth)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();


-- ============================================================
-- 19. ROW LEVEL SECURITY (RLS)
-- ============================================================

-- Activer RLS sur toutes les tables sensibles
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- USERS : voir et modifier uniquement son propre profil
CREATE POLICY "users_self_read" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "users_self_update" ON users
  FOR UPDATE USING (auth.uid() = id);

-- Admins : accès complet
CREATE POLICY "admin_full_access_users" ON users
  FOR ALL USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'ADMIN')
  );

-- ORDERS : un client voit uniquement ses commandes
CREATE POLICY "orders_self_read" ON orders
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "orders_self_insert" ON orders
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "admin_full_access_orders" ON orders
  FOR ALL USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'ADMIN')
  );

-- ORDER_ITEMS : lecture liée aux commandes accessibles
CREATE POLICY "order_items_read" ON order_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id
        AND orders.user_id = auth.uid()
    )
  );

-- ADDRESSES : accès à ses propres adresses
CREATE POLICY "addresses_self" ON addresses
  FOR ALL USING (auth.uid() = user_id);

-- WISHLIST : accès à ses propres favoris
CREATE POLICY "wishlist_self" ON wishlist
  FOR ALL USING (auth.uid() = user_id);

-- NOTIFICATIONS : accès à ses propres notifications
CREATE POLICY "notifications_self" ON notifications
  FOR ALL USING (auth.uid() = user_id);

-- REVIEWS : lecture publique, écriture authentifiée, modification propriétaire
CREATE POLICY "reviews_public_read" ON reviews
  FOR SELECT USING (valide = TRUE);

CREATE POLICY "reviews_auth_insert" ON reviews
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "reviews_self_update" ON reviews
  FOR UPDATE USING (auth.uid() = user_id);

-- PRODUCTS : lecture publique, modification admin uniquement
CREATE POLICY "products_public_read" ON products
  FOR SELECT USING (is_active = TRUE);

-- CATEGORIES, BRANDS : lecture publique
CREATE POLICY "categories_public_read" ON categories
  FOR SELECT USING (TRUE);

CREATE POLICY "brands_public_read" ON brands
  FOR SELECT USING (TRUE);

-- BLOG_POSTS : lecture publique
CREATE POLICY "blog_public_read" ON blog_posts
  FOR SELECT USING (publie = TRUE);


-- ============================================================
-- 20. VUES UTILES
-- ============================================================

-- Vue produits avec leur catégorie et marque (pour les composants)
CREATE OR REPLACE VIEW v_products AS
SELECT
  p.*,
  c.nom AS categorie_nom,
  c.slug AS categorie_slug,
  b.nom AS marque_nom
FROM products p
LEFT JOIN categories c ON p.category_id = c.id
LEFT JOIN brands b ON p.brand_id = b.id
WHERE p.is_active = TRUE;

-- Vue commandes avec nombre de lignes
CREATE OR REPLACE VIEW v_orders_summary AS
SELECT
  o.*,
  COUNT(oi.id) AS nb_articles
FROM orders o
LEFT JOIN order_items oi ON o.id = oi.order_id
GROUP BY o.id;

-- Vue avis validés avec info produit
CREATE OR REPLACE VIEW v_reviews_approved AS
SELECT
  r.*,
  p.nom AS produit_nom,
  p.image AS produit_image
FROM reviews r
JOIN products p ON r.product_id = p.id
WHERE r.valide = TRUE
ORDER BY r.created_at DESC;


-- ============================================================
-- FIN DU SCRIPT
-- ============================================================
-- Vérifier :
--   SELECT table_name FROM information_schema.tables
--   WHERE table_schema = 'public' ORDER BY table_name;
-- ============================================================
