"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { getProducts, getUsers, getOrders, getReviews, getNotifications } from "@/lib/services/api";
import db from "@/db.json";

const StoreContext = createContext(null);

function read(key, fallback) {
  try { return JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback)); }
  catch { return fallback; }
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
    setNotifications(read("agrimarket.notifications", db.notifications || []));
    setUsers(read("agrimarket.users", db.users || []));
    setUser(read("agrimarket.user", null));
    setPendingVerification(read("agrimarket.pendingVerification", null));
    setResetTokens(read("agrimarket.resetTokens", {}));
    setAddresses(read("agrimarket.addresses", db.addresses || []));
    setReviews(read("agrimarket.reviews", db.reviews || []));
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

  const checkout = useCallback(customer => {
    if (!lines.length) throw new Error("Le panier est vide.");
    const order = {
      id: `CMD-${Date.now().toString().slice(-8)}`,
      createdAt: new Date().toISOString(), status: "Nouvelle", customer,
      items: lines.map(({ product, quantity }) => ({ productId: product.id, name: product.name, price: product.price, quantity, image: product.image })),
      subtotal, shipping, total,
    };
    setOrders(current => [order, ...current]);
    setProducts(current => current.map(product => cart[product.id] ? { ...product, stock: Math.max(0, product.stock - Number(cart[product.id])) } : product));
    setCart({});

    // Automatically trigger a real-time order notification!
    addNotification({
      type: "ORDER",
      title: "Nouvelle commande enregistrée !",
      message: `Votre commande #${order.id} d'un montant de ${total} FCFA a été validée avec succès.`,
      link: `/confirmation/${order.id}`,
      linkText: "Voir la commande",
      icon: "Package"
    });

    return order;
  }, [lines, subtotal, shipping, total, cart, addNotification]);

  const updateUserProfile = useCallback((profileData) => {
    setUser(prev => {
      if (!prev) return null;
      const updated = { ...prev, ...profileData };
      setUsers(currentUsers =>
        currentUsers.map(u => (u.id === prev.id || u.email === prev.email ? { ...u, ...profileData } : u))
      );
      return updated;
    });
    notify("Profil et paramètres mis à jour avec succès !");
  }, [notify]);

  const value = useMemo(() => ({
    products, setProducts, cart, lines, itemCount, subtotal, shipping, total,
    addToCart, setQuantity, removeFromCart, wishlist, toggleWishlist,
    orders, setOrders, checkout, users, setUsers, user, setUser, updateUserProfile, login, register, logout,
    pendingVerification, setPendingVerification, sendOtp, verifyOtp, requestPasswordReset, resetPassword,
    addresses, setAddresses, reviews, setReviews, productRequests, setProductRequests,
    recentProducts, rememberProduct, cartOpen, setCartOpen, hydrated, notify,
    notifications, setNotifications, unreadNotificationsCount,
    markAllNotificationsAsRead, toggleNotificationReadStatus, deleteNotification, addNotification
  }), [products, cart, lines, itemCount, subtotal, shipping, total, addToCart, setQuantity, removeFromCart, wishlist, toggleWishlist, orders, checkout, users, user, updateUserProfile, login, register, logout, pendingVerification, sendOtp, verifyOtp, requestPasswordReset, resetPassword, addresses, reviews, productRequests, recentProducts, rememberProduct, cartOpen, hydrated, notify, notifications, unreadNotificationsCount, markAllNotificationsAsRead, toggleNotificationReadStatus, deleteNotification, addNotification]);

  return <StoreContext.Provider value={value}>{children}<div className={`toast ${toastMessage ? "show" : ""}`} role="status">{toastMessage}</div></StoreContext.Provider>;
}

export function useStore() {
  const context = useContext(StoreContext);
  if (!context) throw new Error("useStore doit être utilisé dans StoreProvider");
  return context;
}
