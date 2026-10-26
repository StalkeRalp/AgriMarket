/**
 * ITEXAL BEAUTY - Data Access & Service Layer (API Layer)
 * 
 * Centralise tous les accès aux données du site en important db.json.
 * Lorsque le vrai backend sera connecté, seules les fonctions de cette couche 
 * seront modifiées (remplacement par des requêtes fetch / Supabase) sans toucher 
 * aux composants UI.
 */

import db from "@/db.json";

const getCatalog = () => {
  if (Array.isArray(db.agriCatalog) && db.agriCatalog.length > 0) return db.agriCatalog;
  return db.products || [];
};

const getCategoryList = () => {
  if (Array.isArray(db.categories) && db.categories.length > 0) return db.categories;
  const catalog = getCatalog();
  const mapped = [...new Set((catalog || []).map((item) => item?.category).filter(Boolean))];
  return mapped.map((name, index) => ({
    id: `cat-${index + 1}`,
    slug: name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
    name,
    description: `Produits ${name.toLowerCase()} disponibles sur AgriMarket.`
  }));
};

const getBrandList = () => {
  if (Array.isArray(db.brands) && db.brands.length > 0) return db.brands;
  const catalog = getCatalog();
  const mapped = [...new Set((catalog || []).map((item) => item?.brand).filter(Boolean))];
  return mapped.map((name, index) => ({
    id: `b-${index + 1}`,
    name,
    logo: "/Images/placeholder-agri.png"
  }));
};

// --- PRODUITS ---
export async function getProducts() {
  return Promise.resolve(getCatalog());
}

export async function getProductById(id) {
  const products = getCatalog();
  const product = products.find((p) => p.id === id);
  return Promise.resolve(product || null);
}

export async function getProductsByCategory(categorySlug) {
  const products = getCatalog();
  if (!categorySlug || categorySlug === "tous") return Promise.resolve(products);
  return Promise.resolve(
    products.filter((p) => p.category?.toLowerCase() === categorySlug.toLowerCase())
  );
}

export async function getProductsByBrand(brandName) {
  const products = getCatalog();
  if (!brandName) return Promise.resolve(products);
  return Promise.resolve(
    products.filter((p) => p.brand?.toLowerCase() === brandName.toLowerCase())
  );
}

export async function saveProduct(productData) {
  let products = getCatalog();
  const existingIndex = products.findIndex((p) => p.id === productData.id);
  
  if (existingIndex >= 0) {
    products[existingIndex] = { ...products[existingIndex], ...productData };
  } else {
    const newProduct = {
      ...productData,
      id: productData.id || `p${Date.now()}`
    };
    products.push(newProduct);
  }
  return Promise.resolve(productData);
}

export async function deleteProduct(id) {
  const products = getCatalog();
  const nextProducts = products.filter((p) => p.id !== id);
  if (Array.isArray(db.agriCatalog) && db.agriCatalog.length > 0) {
    db.agriCatalog = nextProducts;
  } else {
    db.products = nextProducts;
  }
  return Promise.resolve(true);
}

// --- CATÉGORIES & MARQUES ---
export async function getCategories() {
  return Promise.resolve(getCategoryList());
}

export async function getBrands() {
  return Promise.resolve(getBrandList());
}

// --- UTILISATEURS ---
export async function getUsers() {
  return Promise.resolve(db.users || []);
}

export async function getUserById(id) {
  const users = db.users || [];
  return Promise.resolve(users.find((u) => u.id === id) || null);
}

export async function saveUser(userData) {
  let users = db.users || [];
  const idx = users.findIndex((u) => u.id === userData.id);
  if (idx >= 0) {
    users[idx] = { ...users[idx], ...userData };
  } else {
    users.push(userData);
  }
  return Promise.resolve(userData);
}

// --- COMMANDES ---
export async function getOrders() {
  return Promise.resolve(db.orders || []);
}

export async function getOrderById(id) {
  const orders = db.orders || [];
  return Promise.resolve(orders.find((o) => o.id === id) || null);
}

export async function createOrder(orderData) {
  const newOrder = {
    id: orderData.id || `ITX-2026-${Math.floor(1000 + Math.random() * 9000)}`,
    createdAt: new Date().toISOString(),
    status: "Confirmée",
    ...orderData
  };
  if (db.orders) {
    db.orders.unshift(newOrder);
  }
  return Promise.resolve(newOrder);
}

export async function updateOrderStatus(orderId, status) {
  const orders = db.orders || [];
  const order = orders.find((o) => o.id === orderId);
  if (order) {
    order.status = status;
  }
  return Promise.resolve(order);
}

// --- AVIS CLIENTS ---
export async function getReviews() {
  return Promise.resolve(db.reviews || []);
}

export async function getReviewsByProductId(productId) {
  const reviews = db.reviews || [];
  return Promise.resolve(reviews.filter((r) => r.productId === productId));
}

export async function addReview(reviewData) {
  const newReview = {
    id: `rv-${Date.now()}`,
    createdAt: new Date().toISOString(),
    approved: true,
    ...reviewData
  };
  if (db.reviews) {
    db.reviews.unshift(newReview);
  }
  return Promise.resolve(newReview);
}

// --- BLOG & ARTICLES ---
export async function getBlogPosts() {
  return Promise.resolve(db.blogPosts || []);
}

export async function getBlogPostById(id) {
  const posts = db.blogPosts || [];
  return Promise.resolve(posts.find((post) => post.id === id) || null);
}

// --- NOTIFICATIONS ---
export async function getNotifications() {
  return Promise.resolve(db.notifications || []);
}

// --- PAGES D'INFORMATION ---
export async function getInfoPages() {
  return Promise.resolve(db.infoPages || {});
}

export async function getInfoPageByKey(key) {
  const pages = db.infoPages || {};
  return Promise.resolve(pages[key] || null);
}
