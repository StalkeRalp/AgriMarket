"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { getProducts, getUsers, getOrders, getReviews, getNotifications } from "@/lib/services/api";
import db from "@/db.json";

const StoreContext = createContext(null);

function read(key, fallback) {
  try { return JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback)); }
  catch { return fallback; }
}

function refreshLegacyNotifications(storedNotifications) {
  if (!Array.isArray(storedNotifications)) return db.notifications || [];
  const seededNotifications = new Map((db.notifications || []).map(item => [item.id, item]));
  return storedNotifications.map(item => {
    const seeded = seededNotifications.get(item.id);
    const containsLegacyBeautyContent = /beauty|dior|itx-2026|sérum|rituel beauté|prestige/i
      .test(`${item.title || ""} ${item.message || ""}`);
    return seeded && containsLegacyBeautyContent ? { ...seeded, read: Boolean(item.read) } : item;
  });
}

function refreshLegacyReviews(storedReviews) {
  if (!Array.isArray(storedReviews) || !storedReviews.length) return db.reviews || [];
  const containsLegacyCosmetics = storedReviews.some(r =>
    ["p1", "p2", "p9"].includes(r.productId) ||
    /couleur|teinte|texture légère|routine/i.test(`${r.title || ""} ${r.comment || ""}`)
  );
  if (containsLegacyCosmetics) {
    const custom = storedReviews.filter(r =>
      !["rv-1", "rv-2", "rv-3"].includes(r.id) &&
      !["p1", "p2", "p9"].includes(r.productId) &&
      !/couleur|teinte|texture légère|routine/i.test(`${r.title || ""} ${r.comment || ""}`)
    );
    return [...custom, ...(db.reviews || [])];
  }
  return storedReviews;
}

export function StoreProvider({ children }) {
  const catalogSeed = Array.isArray(db.agriCatalog) && db.agriCatalog.length ? db.agriCatalog : (db.products || []);
  const [products, setProducts] = useState(catalogSeed);
  const [cart, setCart] = useState({});
  const [wishlist, setWishlist] = useState([]);
  const [orders, setOrders] = useState(db.orders || []);
  const [notifications, setNotifications] = useState(db.notifications || []);
  const [users, setUsers] = useState(db.users || []);
  const [user, setUser] = useState(null);
  const [addresses, setAddresses] = useState(db.addresses || []);
  const [reviews, setReviews] = useState(db.reviews || []);
  const [productRequests, setProductRequests] = useState([]);
  const [recentProducts, setRecentProducts] = useState([]);
  const [hydrated, setHydrated] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  const [pendingVerification, setPendingVerification] = useState(null);
  const [resetTokens, setResetTokens] = useState({});

  useEffect(() => {
    // Purge old cosmetics cached products if present
    try {
      if (localStorage.getItem("itexal.products")) {
        localStorage.removeItem("itexal.products");
        localStorage.removeItem("itexal.cart");
      }
    } catch {}

    const seedProducts = catalogSeed;
    const cachedProducts = read("agrimarket.products", seedProducts);
    setProducts(cachedProducts);
    setCart(read("agrimarket.cart", {}));
    setWishlist(read("agrimarket.wishlist", []));
    setOrders(read("agrimarket.orders", db.orders || []));
    setNotifications(refreshLegacyNotifications(read("agrimarket.notifications", db.notifications || [])));
    setUsers(read("agrimarket.users", db.users || []));
    setUser(read("agrimarket.user", null));
    setPendingVerification(read("agrimarket.pendingVerification", null));
    setResetTokens(read("agrimarket.resetTokens", {}));
    setAddresses(read("agrimarket.addresses", db.addresses || []));
    setReviews(refreshLegacyReviews(read("agrimarket.reviews", db.reviews || [])));
    setProductRequests(read("agrimarket.productRequests", []));
    setRecentProducts(read("agrimarket.recentProducts", []));
    setHydrated(true);
  }, []);

  useEffect(() => { if (hydrated) localStorage.setItem("agrimarket.products", JSON.stringify(products)); }, [products, hydrated]);
  useEffect(() => { if (hydrated) localStorage.setItem("agrimarket.cart", JSON.stringify(cart)); }, [cart, hydrated]);
  useEffect(() => { if (hydrated) localStorage.setItem("agrimarket.wishlist", JSON.stringify(wishlist)); }, [wishlist, hydrated]);
  useEffect(() => { if (hydrated) localStorage.setItem("agrimarket.orders", JSON.stringify(orders)); }, [orders, hydrated]);
  useEffect(() => { if (hydrated) localStorage.setItem("agrimarket.notifications", JSON.stringify(notifications)); }, [notifications, hydrated]);
  useEffect(() => { if (hydrated) localStorage.setItem("agrimarket.users", JSON.stringify(users)); }, [users, hydrated]);
  useEffect(() => { if (hydrated) user ? localStorage.setItem("agrimarket.user", JSON.stringify(user)) : localStorage.removeItem("agrimarket.user"); }, [user, hydrated]);
  useEffect(() => { if (hydrated) pendingVerification ? localStorage.setItem("agrimarket.pendingVerification", JSON.stringify(pendingVerification)) : localStorage.removeItem("agrimarket.pendingVerification"); }, [pendingVerification, hydrated]);
  useEffect(() => { if (hydrated) localStorage.setItem("agrimarket.resetTokens", JSON.stringify(resetTokens)); }, [resetTokens, hydrated]);
  useEffect(() => { if (hydrated) localStorage.setItem("agrimarket.addresses", JSON.stringify(addresses)); }, [addresses, hydrated]);
  useEffect(() => { if (hydrated) localStorage.setItem("agrimarket.reviews", JSON.stringify(reviews)); }, [reviews, hydrated]);
  useEffect(() => { if (hydrated) localStorage.setItem("agrimarket.productRequests", JSON.stringify(productRequests)); }, [productRequests, hydrated]);
  useEffect(() => { if (hydrated) localStorage.setItem("agrimarket.recentProducts", JSON.stringify(recentProducts.slice(0, 8))); }, [recentProducts, hydrated]);

  const notify = useCallback(message => {
    setToastMessage(message);
    window.clearTimeout(notify.timer);
    notify.timer = window.setTimeout(() => setToastMessage(""), 2600);
  }, []);

  const unreadNotificationsCount = useMemo(() => {
    return notifications.filter(n => !n.read).length;
  }, [notifications]);

  const markAllNotificationsAsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }, []);

  const toggleNotificationReadStatus = useCallback((id) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: !n.read } : n));
  }, []);

  const deleteNotification = useCallback((id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const addNotification = useCallback((notif) => {
    const newNotif = {
      id: `notif-${Date.now()}`,
      date: new Date().toISOString(),
      read: false,
      ...notif
    };
    setNotifications(prev => [newNotif, ...prev]);
  }, []);

  const lines = useMemo(() => Object.entries(cart).map(([id, quantity]) => {
    const product = products.find(item => item.id === id);
    return product ? { product, quantity: Number(quantity) } : null;
  }).filter(Boolean), [cart, products]);
  const itemCount = useMemo(() => lines.reduce((sum, line) => sum + line.quantity, 0), [lines]);
  const subtotal = useMemo(() => lines.reduce((sum, line) => sum + line.product.price * line.quantity, 0), [lines]);
  const shipping = lines.length ? 2000 : 0;
  const total = subtotal + shipping;

  const addToCart = useCallback((id, quantity = 1, open = true) => {
    const product = products.find(item => item.id === id);
    if (!product || product.stock <= 0) return notify("Produit indisponible");
    setCart(current => {
      const nextQuantity = Number(current[id] || 0) + quantity;
      if (nextQuantity > product.stock) { notify("Stock disponible insuffisant"); return current; }
      return { ...current, [id]: nextQuantity };
    });
    notify("Produit ajouté au panier");
    if (open) setCartOpen(true);
  }, [products, notify]);

  const setQuantity = useCallback((id, quantity) => setCart(current => {
    const next = { ...current };
    const product = products.find(item => item.id === id);
    if (quantity <= 0) delete next[id]; else next[id] = Math.min(quantity, product?.stock || quantity);
    return next;
  }), [products]);
  const removeFromCart = useCallback(id => setCart(current => { const next = { ...current }; delete next[id]; return next; }), []);
  const toggleWishlist = useCallback(id => setWishlist(current => current.includes(id) ? current.filter(item => item !== id) : [id, ...current]), []);
  const rememberProduct = useCallback(id => setRecentProducts(current => [id, ...current.filter(item => item !== id)].slice(0, 8)), []);

  const login = useCallback((email, password) => {
    const emailLower = email.toLowerCase();
    let found = users.find(u => u.email.toLowerCase() === emailLower);
    
    // SIMULATION MODE: Auto-create user on the fly for any email/password entered
    if (!found) {
      const namePart = email.split('@')[0] || "Client";
      const newUser = {
        id: `u-${Date.now()}`,
        firstName: namePart.charAt(0).toUpperCase() + namePart.slice(1),
        lastName: "ITexal",
        email: emailLower,
        password: password || "123456",
        role: "CLIENT"
      };
      setUsers(current => [...current, newUser]);
      found = newUser;
    }
    
    const { password: _, ...safe } = found;
    setUser(safe);
    notify("Connexion réussie !");
    return safe;
  }, [users, notify]);

  const register = useCallback(data => {
    const emailLower = data.email.toLowerCase();
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const pendingData = {
      ...data,
      email: emailLower,
      otpCode,
      expiresAt: Date.now() + 10 * 60 * 1000
    };
    setPendingVerification(pendingData);
    notify(`Code OTP généré : ${otpCode}`);
    return { email: emailLower, otpCode };
  }, [notify]);

  const sendOtp = useCallback((email) => {
    const emailLower = email.toLowerCase();
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    setPendingVerification(prev => ({
      ...(prev || {}),
      email: emailLower,
      otpCode,
      expiresAt: Date.now() + 10 * 60 * 1000
    }));
    notify(`Code OTP généré : ${otpCode}`);
    return otpCode;
  }, [notify]);

  const verifyOtp = useCallback((email, code) => {
    // SIMULATION MODE: Accept any OTP code or matching code
    const targetPending = pendingVerification || {
      email: email.toLowerCase(),
      name: email.split('@')[0] || "Client ITexal",
      firstName: "Client",
      lastName: "ITexal"
    };

    const { otpCode: _, expiresAt: __, ...userData } = targetPending;
    const newUser = {
      id: `u-${Date.now()}`,
      role: "CLIENT",
      ...userData
    };
    setUsers(current => [...current, newUser]);
    const { password: ___, ...safe } = newUser;
    setUser(safe);
    setPendingVerification(null);
    notify("Compte vérifié et créé avec succès !");
    return true;
  }, [pendingVerification, notify]);

  const requestPasswordReset = useCallback((email) => {
    const emailLower = email.toLowerCase();
    const token = `RST-${Math.floor(1000 + Math.random() * 9000)}`;
    const resetEntry = {
      email: emailLower,
      token,
      expiresAt: Date.now() + 15 * 60 * 1000
    };
    setResetTokens(prev => ({ ...prev, [token]: resetEntry }));
    notify(`Code de réinitialisation généré : ${token}`);
    return { success: true, token };
  }, [notify]);

  const resetPassword = useCallback((token, newPassword) => {
    const cleanToken = (token || "").trim();
    const entry = resetTokens[cleanToken] || { email: "user@itexal.com" };

    setUsers(current => {
      const exists = current.some(u => u.email.toLowerCase() === entry.email.toLowerCase());
      if (exists) {
        return current.map(u => {
          if (u.email.toLowerCase() === entry.email.toLowerCase()) {
            return { ...u, password: newPassword };
          }
          return u;
        });
      }
      return [
        ...current,
        {
          id: `u-${Date.now()}`,
          firstName: "Client",
          lastName: "ITexal",
          email: entry.email,
          password: newPassword,
          role: "CLIENT"
        }
      ];
    });

    setResetTokens(prev => {
      const next = { ...prev };
      delete next[cleanToken];
      return next;
    });

    notify("Mot de passe modifié avec succès ! Vous pouvez vous connecter.");
    return true;
  }, [resetTokens, notify]);

  const logout = useCallback(() => {
    setUser(null);
    notify("Déconnexion réussie.");
  }, [notify]);

  const checkout = useCallback((customer, customShipping = null, customPayment = {}) => {
    if (!lines.length) throw new Error("Le panier est vide.");

    const finalShipping = customShipping !== null ? Number(customShipping) : (lines.length ? 1500 : 0);
    const finalTotal = subtotal + finalShipping;
    const randomSuffix = Math.floor(10000 + Math.random() * 90000);
    const orderId = `AGRI-2026-${randomSuffix}`;

    const initialStatus = customPayment.status || (customPayment.method === "BANK_TRANSFER" ? "En attente de paiement" : "Confirmée");
    const paymentStatus = customPayment.paymentStatus || (
      customPayment.method === "CASH_ON_DELIVERY" ? "Paiement à la réception (Cash)" :
      customPayment.method === "BANK_TRANSFER" ? "En attente du virement" :
      "Payé & Validé"
    );

    const order = {
      id: orderId,
      createdAt: new Date().toISOString(),
      status: initialStatus,
      statusCode: initialStatus === "En attente de paiement" ? "pending_payment" : "confirmed",
      currentStepIndex: initialStatus === "En attente de paiement" ? 1 : 2,
      customer: {
        name: customer.name || "Client AgriMarket",
        phone: customer.phone || "",
        whatsapp: customer.whatsapp || customer.phone || "",
        email: customer.email || "",
        region: customer.region || "Littoral",
        city: customer.city || "Douala",
        district: customer.district || "",
        address: customer.address || "",
        deliveryMode: customer.deliveryMode || "LIVRAISON_DOMICILE",
        pickupPoint: customer.pickupPoint || null
      },
      // Flat properties for backward compatibility across various views
      name: customer.name || "Client AgriMarket",
      phone: customer.phone || "",
      whatsapp: customer.whatsapp || customer.phone || "",
      email: customer.email || "",
      region: customer.region || "Littoral",
      city: customer.city || "Douala",
      district: customer.district || "",
      address: customer.address || "",
      deliveryMode: customer.deliveryMode || "LIVRAISON_DOMICILE",
      pickupPoint: customer.pickupPoint || null,
      paymentMethod: customPayment.methodLabel || customer.payment || "MTN Mobile Money",
      paymentStatus: paymentStatus,
      paymentDetails: customPayment,
      items: lines.map(({ product, quantity }) => ({
        id: product.id,
        productId: product.id,
        name: product.name,
        price: product.price,
        unit: product.unit || "kg",
        origin: product.location || product.origin || "Cameroun",
        brand: product.brand || "Producteur Local",
        quantity,
        image: product.image
      })),
      subtotal,
      shipping: finalShipping,
      total: finalTotal,
      timeline: [
        {
          step: initialStatus,
          date: new Date().toISOString(),
          description: initialStatus === "En attente de paiement"
            ? "Commande enregistrée. En attente de la réception du virement bancaire pour validation."
            : "Commande validée et transmise aux producteurs et au service logistique AgriMarket."
        }
      ]
    };

    setOrders(current => [order, ...current]);
    // Deduct stock safely
    setProducts(current => current.map(product => {
      const purchasedQty = Number(cart[product.id] || 0);
      if (purchasedQty > 0) {
        return { ...product, stock: Math.max(0, product.stock - purchasedQty) };
      }
      return product;
    }));
    setCart({});

    // Automatically trigger a real-time order notification!
    addNotification({
      type: "ORDER",
      title: `Commande #${order.id} validée !`,
      message: `Votre commande d'un montant de ${finalTotal.toLocaleString("fr-FR")} FCFA a été enregistrée avec succès.`,
      link: `/confirmation/${order.id}`,
      linkText: "Voir le reçu",
      icon: "Package"
    });

    return order;
  }, [lines, subtotal, cart, addNotification]);

  const updateUserProfile = useCallback((profileData) => {
    setUser(prev => {
      const base = prev || { id: `u-${Date.now()}`, role: "CLIENT", firstName: "Exploitant", lastName: "AgriMarket", email: "client@agrimarket.cm" };
      const updated = { ...base, ...profileData };
      setUsers(currentUsers =>
        currentUsers.map(u => (u.id === base.id || u.email === base.email ? { ...u, ...profileData } : u))
      );
      try {
        localStorage.setItem("agrimarket.user", JSON.stringify(updated));
      } catch {}
      return updated;
    });
    notify("Profil et paramètres mis à jour avec succès !");
  }, [notify]);

  const addReview = useCallback((reviewData) => {
    const newReview = {
      id: `rev-${Date.now()}`,
      createdAt: new Date().toISOString(),
      date: new Intl.DateTimeFormat("fr-FR", { month: "long", year: "numeric" }).format(new Date()),
      approved: true,
      ...reviewData
    };
    setReviews(prev => [newReview, ...(prev || [])]);
    notify("Votre avis d'exploitant / acheteur a été publié avec succès !");
    return newReview;
  }, [notify]);

  const value = useMemo(() => ({
    products, setProducts, cart, lines, itemCount, subtotal, shipping, total,
    addToCart, setQuantity, removeFromCart, wishlist, toggleWishlist,
    orders, setOrders, checkout, users, setUsers, user, setUser, updateUserProfile, login, register, logout,
    pendingVerification, setPendingVerification, sendOtp, verifyOtp, requestPasswordReset, resetPassword,
    addresses, setAddresses, reviews, setReviews, addReview, productRequests, setProductRequests,
    recentProducts, rememberProduct, cartOpen, setCartOpen, hydrated, notify,
    notifications, setNotifications, unreadNotificationsCount,
    markAllNotificationsAsRead, toggleNotificationReadStatus, deleteNotification, addNotification
  }), [products, cart, lines, itemCount, subtotal, shipping, total, addToCart, setQuantity, removeFromCart, wishlist, toggleWishlist, orders, checkout, users, user, updateUserProfile, login, register, logout, pendingVerification, sendOtp, verifyOtp, requestPasswordReset, resetPassword, addresses, reviews, setReviews, addReview, productRequests, recentProducts, rememberProduct, cartOpen, hydrated, notify, notifications, unreadNotificationsCount, markAllNotificationsAsRead, toggleNotificationReadStatus, deleteNotification, addNotification]);

  return <StoreContext.Provider value={value}>{children}<div className={`toast ${toastMessage ? "show" : ""}`} role="status">{toastMessage}</div></StoreContext.Provider>;
}

export function useStore() {
  const context = useContext(StoreContext);
  if (!context) throw new Error("useStore doit être utilisé dans StoreProvider");
  return context;
}
