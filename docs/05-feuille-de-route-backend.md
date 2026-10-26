# 🗺️ Feuille de Route — Intégration Backend Supabase

> Document : `05-feuille-de-route-backend.md` · Version 2.0.0

---

## Vision

Le frontend ITEXAL Beauty est **déjà complet et production-ready**. La prochaine phase consiste à le brancher sur un vrai backend Supabase (PostgreSQL + Auth + Storage + Realtime) **sans modifier un seul composant UI**.

> 🎯 **Principe de la couche API** : seul `lib/services/api.js` sera modifié lors de l'intégration. Les composants React restent intacts.

---

## Phase 1 — Mise en place Supabase (1-2 jours)

### Étapes

1. **Créer le projet Supabase**
   - Aller sur [supabase.com](https://supabase.com)
   - Nouveau projet → Région : Europe (Frankfurt) ou US East
   - Noter `Project URL` et `anon key`

2. **Configurer les variables d'environnement**
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   SUPABASE_SERVICE_ROLE_KEY=eyJ...  (serveur uniquement, jamais exposé)
   ```

3. **Exécuter le script SQL**
   - Copier le contenu de `docs/06-supabase-schema.sql`
   - Dans Supabase → SQL Editor → Coller et exécuter
   - Vérifier que toutes les tables, RLS et triggers sont créés

4. **Installer le client Supabase**
   ```bash
   npm install @supabase/supabase-js
   ```

5. **Créer le client Supabase**
   ```js
   // lib/supabase.js
   import { createClient } from '@supabase/supabase-js';

   export const supabase = createClient(
     process.env.NEXT_PUBLIC_SUPABASE_URL,
     process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
   );
   ```

---

## Phase 2 — Migration des Données (1 jour)

### Importer `db.json` dans Supabase

**Option A : Via l'interface Supabase**
- Table Editor → Import CSV (exporter db.json en CSV)

**Option B : Script Node.js de migration**
```js
// scripts/migrate-db.js
import { createClient } from '@supabase/supabase-js';
import db from '../db.json' assert { type: 'json' };

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

async function migrate() {
  // Catégories
  await supabase.from('categories').insert(db.categories);
  // Marques
  await supabase.from('brands').insert(db.brands);
  // Produits (mapper les IDs)
  await supabase.from('products').insert(db.products.map(p => ({
    reference: p.reference,
    nom: p.name,
    description: p.description,
    prix: p.price,
    ancien_prix: p.oldPrice,
    stock: p.stock,
    image: p.image,
    images: p.images,
    // ... autres champs
  })));
  // Blog, avis, etc.
}

migrate();
```

---

## Phase 3 — Authentification Supabase Auth (2-3 jours)

### Remplacement de l'auth simulée

**Fichier à modifier :** `lib/services/api.js`

```js
import { supabase } from '@/lib/supabase';

// CONNEXION
export async function signIn(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data.user;
}

// INSCRIPTION avec OTP email
export async function signUp(email, password, metadata) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: metadata, emailRedirectTo: `${window.location.origin}/verification-otp` }
  });
  if (error) throw error;
  return data;
}

// DÉCONNEXION
export async function signOut() {
  await supabase.auth.signOut();
}

// RÉCUPÉRER SESSION
export async function getSession() {
  const { data } = await supabase.auth.getSession();
  return data.session;
}

// MOT DE PASSE OUBLIÉ
export async function resetPassword(email) {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/reinitialisation-mot-de-passe`
  });
  if (error) throw error;
}
```

**Adapter `StoreContext.jsx`** pour écouter la session Supabase :
```js
useEffect(() => {
  supabase.auth.getSession().then(({ data: { session } }) => {
    setUser(session?.user ?? null);
  });

  const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
    setUser(session?.user ?? null);
  });

  return () => subscription.unsubscribe();
}, []);
```

---

## Phase 4 — Migration des Données CRUD (3-5 jours)

### Réécriture de `lib/services/api.js`

```js
import { supabase } from '@/lib/supabase';

// PRODUITS
export async function getProducts() {
  const { data, error } = await supabase
    .from('products')
    .select('*, categories(*), brands(*)')
    .eq('is_active', true)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

export async function getProductById(id) {
  const { data, error } = await supabase
    .from('products')
    .select('*, categories(*), brands(*), reviews(*)')
    .eq('id', id)
    .single();
  if (error) throw error;
  return data;
}

// COMMANDES
export async function createOrder(orderData) {
  const { data: order, error } = await supabase
    .from('orders')
    .insert([orderData])
    .select()
    .single();
  if (error) throw error;

  // Insérer les lignes de commande
  await supabase.from('order_items').insert(
    orderData.items.map(item => ({ ...item, order_id: order.id }))
  );

  // Décrémenter le stock
  for (const item of orderData.items) {
    await supabase.rpc('decrement_stock', {
      p_product_id: item.product_id,
      p_quantity: item.quantite
    });
  }

  return order;
}

// FAVORIS
export async function toggleWishlist(userId, productId) {
  const { data: existing } = await supabase
    .from('wishlist')
    .select('product_id')
    .eq('user_id', userId)
    .eq('product_id', productId)
    .maybeSingle();

  if (existing) {
    await supabase.from('wishlist').delete()
      .eq('user_id', userId).eq('product_id', productId);
    return false;
  } else {
    await supabase.from('wishlist').insert({ user_id: userId, product_id: productId });
    return true;
  }
}
```

---

## Phase 5 — Storage (Images Produits) (1-2 jours)

```js
// Upload image produit (panel admin)
export async function uploadProductImage(file, productId) {
  const ext = file.name.split('.').pop();
  const path = `products/${productId}/${Date.now()}.${ext}`;

  const { error } = await supabase.storage
    .from('itexal-media')
    .upload(path, file, { cacheControl: '3600', upsert: false });

  if (error) throw error;

  const { data } = supabase.storage.from('itexal-media').getPublicUrl(path);
  return data.publicUrl;
}

// Upload avatar utilisateur
export async function uploadAvatar(file, userId) {
  const path = `avatars/${userId}.${file.name.split('.').pop()}`;
  const { error } = await supabase.storage
    .from('itexal-media')
    .upload(path, file, { upsert: true });
  if (error) throw error;
  return supabase.storage.from('itexal-media').getPublicUrl(path).data.publicUrl;
}
```

---

## Phase 6 — Notifications Realtime (1-2 jours)

```js
// Écoute des nouvelles notifications en temps réel
export function subscribeToNotifications(userId, callback) {
  return supabase
    .channel('notifications')
    .on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'notifications',
      filter: `user_id=eq.${userId}`
    }, (payload) => callback(payload.new))
    .subscribe();
}
```

---

## Phase 7 — Paiement Mobile Money (2-4 semaines)

### MTN Mobile Money Cameroun

```
API : MTN MoMo API (sandbox disponible)
Endpoint : POST /collection/v1_0/requesttopay
Headers : Authorization: Bearer {access_token}
          Ocp-Apim-Subscription-Key: {subscription_key}
```

### Orange Money Cameroun

```
API : Orange Money API Cameroun
Endpoint : POST /orange-money-webpay/cm/v1/webpayment
```

### Flow de paiement suggéré

```
Client → Saisit numéro MTN/Orange
    → API ITEXAL (Next.js Route Handler)
    → MTN/Orange API (initiation paiement)
    → Webhook callback (confirmation)
    → Mise à jour statut commande (Supabase)
    → Notification client (Realtime)
```

---

## Récapitulatif des Étapes

| Phase | Description | Durée estimée | Priorité |
|---|---|---|---|
| 1 | Setup Supabase + variables env | 1-2 jours | 🔴 Critique |
| 2 | Migration données db.json | 1 jour | 🔴 Critique |
| 3 | Auth Supabase (remplacement simulation) | 2-3 jours | 🔴 Critique |
| 4 | CRUD Produits, Commandes, Avis | 3-5 jours | 🟠 Haute |
| 5 | Storage (images, avatars) | 1-2 jours | 🟠 Haute |
| 6 | Notifications Realtime | 1-2 jours | 🟡 Moyenne |
| 7 | Paiement Mobile Money | 2-4 semaines | 🟡 Moyenne |

> **Total estimé** : 3-6 semaines pour une intégration complète backend.

---

## Points d'Attention

1. **Jamais exposer `SERVICE_ROLE_KEY`** côté client — uniquement dans les Route Handlers Next.js côté serveur.
2. **RLS (Row Level Security)** : Activer et configurer soigneusement pour chaque table (voir `06-supabase-schema.sql`).
3. **Tokens JWT** : Supabase Auth gère automatiquement le refresh des tokens.
4. **CORS** : Ajouter l'URL de production dans les settings Supabase.
5. **Rate Limiting** : Configurer des limites sur les endpoints de paiement.

---

*Feuille de Route Backend — ITEXAL Beauty v2.0.0 — Août 2026*
