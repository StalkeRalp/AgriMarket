"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { Heart, ShoppingBag, Trash2, Share2, Sparkles, ArrowRight, Check, ShieldCheck, Star } from "lucide-react";
import { useStore } from "@/lib/store";
import { useRequireAuth } from "@/composants/RequireAuth";

const SUGGESTIONS = [
  {
    id: "sug-1",
    name: "Crème Jeunesse Régénérante - Guerlain",
    brand: "GUERLAIN",
    price: 42000,
    category: "Soins Visage",
    image: "https://images.unsplash.com/photo-1608248597461-897b693e5066?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "sug-2",
    name: "Eau de Parfum Rose Nobile - Acqua di Parma",
    brand: "ACQUA DI PARMA",
    price: 55000,
    category: "Parfums",
    image: "https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "sug-3",
    name: "Poudre Compacte Fini Mat - Fenty Beauty",
    brand: "FENTY BEAUTY",
    price: 22000,
    category: "Maquillage",
    image: "https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "sug-4",
    name: "Sérum Capillaire Fortifiant - Olaplex N°7",
    brand: "OLAPLEX",
    price: 27500,
    category: "Capillaire",
    image: "https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?auto=format&fit=crop&w=800&q=80"
  }
];

export default function FavorisPage() {
  const { user, hydrated } = useRequireAuth();
  const { products, wishlist, toggleWishlist, addToCart, notify } = useStore();
  const [addedNotice, setAddedNotice] = useState(null);

  // Dynamic products from store wishlist array
  const favoritedProducts = useMemo(() => {
    if (!wishlist || !wishlist.length) return [];
    return products.filter(p => wishlist.includes(p.id));
  }, [products, wishlist]);

  const triggerNotice = (msg) => {
    if (notify) notify(msg);
    setAddedNotice(msg);
    setTimeout(() => setAddedNotice(null), 3500);
  };

  const handleRemove = (id, name) => {
    toggleWishlist(id);
    triggerNotice(`"${name}" a été retiré de vos favoris.`);
  };

  const handleClearAll = () => {
    if (window.confirm("Voulez-vous vraiment vider votre liste de favoris ?")) {
      wishlist.forEach(id => toggleWishlist(id));
      triggerNotice("Votre liste de favoris a été entièrement vidée.");
    }
  };

  const handleAddToCart = (product) => {
    addToCart(product.id || product);
    triggerNotice(`"${product.name}" a été ajouté à votre panier !`);
  };

  const handleAddAllToCart = () => {
    favoritedProducts.forEach(product => addToCart(product.id));
    triggerNotice(`Tous vos favoris ont été ajoutés à votre panier !`);
  };

  const handleAddSuggestion = (item) => {
    toggleWishlist(item.id);
    triggerNotice(`"${item.name}" a été ajouté à vos favoris !`);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: "Ma Wishlist ITEXAL Beauty",
        text: "Découvrez ma sélection privée d'exception sur ITEXAL Beauty !",
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      triggerNotice("Lien de votre wishlist copié dans le presse-papier !");
    }
  };

  return (
    <main className="favorites-page">
      {/* Toast Notification */}
      {addedNotice && (
        <div className="favorites-toast">
          <Sparkles width={16} />
          <span>{addedNotice}</span>
        </div>
      )}

      {/* Luxury Breadcrumbs */}
      <nav className="collection-breadcrumb container">
        <Link href="/">Accueil</Link>
        <span>/</span>
        <strong>Ma Sélection Privée (Favoris)</strong>
      </nav>

      {/* Dior / Gucci Luxury Editorial Hero Header */}
      <header className="favorites-hero container">
        <div className="favorites-hero__inner">
          <span className="eyebrow">HAUTE BEAUTÉ & SÉLECTION SUR-MESURE</span>
          <h1>Mes Coups de Cœur & Favoris</h1>
          <p>
            Retrouvez ici vos rituels de soin précieux, parfums envoûtants et indispensables maquillage sauvegardés pour votre prochaine commande.
          </p>
        </div>
      </header>

      <div className="container">
        {/* Action & Utility Ribbon */}
        {favoritedProducts.length > 0 ? (
          <div className="favorites-ribbon">
            <div className="favorites-count-badge">
              <strong>{favoritedProducts.length}</strong> {favoritedProducts.length === 1 ? "ARTICLE SAUVEGARDÉ" : "ARTICLES SAUVEGARDÉS"}
            </div>

            <div className="favorites-actions">
              <button className="btn-pill-primary" onClick={handleAddAllToCart}>
                <ShoppingBag width={15} /> Tout ajouter au panier
              </button>
              <button className="btn-pill-outline" onClick={handleShare}>
                <Share2 width={15} /> Partager ma wishlist
              </button>
              <button className="favorites-clear-btn" onClick={handleClearAll}>
                <Trash2 width={14} /> Vider la liste
              </button>
            </div>
          </div>
        ) : null}

        {/* Favorites Products Grid */}
        {favoritedProducts.length > 0 ? (
          <div className="favorites-grid">
            {favoritedProducts.map((product) => (
              <article className="favorites-card" key={product.id}>
                <div className="favorites-card__media">
                  {product.bestseller && <span className="favorites-tag">Best-Seller</span>}
                  <button 
                    className="favorites-remove-btn" 
                    onClick={() => handleRemove(product.id, product.name)}
                    title="Retirer de mes favoris"
                  >
                    <Trash2 width={15} />
                  </button>
                  <Link href={`/produit/${product.id}`}>
                    <img src={product.image} alt={product.name} />
                  </Link>
                </div>

                <div className="favorites-card__info">
                  <span className="brand-label">{product.brand || "ITEXAL BEAUTY"}</span>
                  <h3>
                    <Link href={`/produit/${product.id}`}>{product.name}</Link>
                  </h3>

                  <div className="favorites-card__meta">
                    <span className="stock-badge"><Check width={12} /> En Stock (Livraison 24h)</span>
                    <div className="stars-gold">{"★".repeat(product.rating || 5)}</div>
                  </div>

                  <div className="favorites-card__price-row">
                    <div className="price-box">
                      <strong className="current-price">{product.price?.toLocaleString("fr-FR")} FCFA</strong>
                      {product.oldPrice && (
                        <span className="old-price">{product.oldPrice?.toLocaleString("fr-FR")} FCFA</span>
                      )}
                    </div>

                    <button 
                      className="favorites-add-cart-btn" 
                      onClick={() => handleAddToCart(product)}
                    >
                      <ShoppingBag width={15} /> Ajouter
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          /* Empty Wishlist Dior Experience */
          <div className="favorites-empty-card">
            <div className="empty-icon-wrap">
              <Heart width={42} height={42} />
            </div>
            <h2>Votre Sélection Privée est actuellement vide</h2>
            <p>
              Parcourez notre catalogue Haute Beauté et cliquez sur l'icône de cœur sur n'importe quel produit pour constituer votre sélection sur-mesure.
            </p>
            <Link href="/catalogue" className="btn-pill-primary">
              Découvrir le Catalogue <ArrowRight width={16} />
            </Link>
          </div>
        )}
      </div>

      {/* Chanel-Inspired "Complétez votre Rituel" Recommendation Rail */}
      <section className="favorites-suggestions container">
        <div className="favorites-section-head">
          <div>
            <span className="eyebrow">INSPIRATIONS & COMPLÉMENTS</span>
            <h2>Complétez Votre Rituel Beauté</h2>
          </div>
          <Link href="/catalogue" className="editorial-link">
            Voir toute la sélection <ArrowRight width={14} />
          </Link>
        </div>

        <div className="suggestions-grid">
          {SUGGESTIONS.map((item) => {
            const isFav = wishlist.includes(item.id);
            return (
              <article className="suggestion-card" key={item.id}>
                <div className="suggestion-media">
                  <img src={item.image} alt={item.name} />
                  <button 
                    className={`suggestion-fav-btn ${isFav ? "is-active" : ""}`}
                    onClick={() => handleAddSuggestion(item)}
                    title="Ajouter aux favoris"
                  >
                    <Heart width={15} fill={isFav ? "#4a2e58" : "none"} color={isFav ? "#4a2e58" : "#1a1412"} />
                  </button>
                </div>
                <div className="suggestion-info">
                  <span className="brand-label">{item.brand}</span>
                  <h3>{item.name}</h3>
                  <strong className="price-tag">{item.price.toLocaleString("fr-FR")} FCFA</strong>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* Reassurance Guarantee Bar */}
      <section className="favorites-reassurance">
        <div className="container reassurance-grid">
          <div className="reassurance-item">
            <ShieldCheck width={24} />
            <div>
              <strong>Produits 100% Certifiés</strong>
              <p>Authenticité garantie auprès des grandes maisons.</p>
            </div>
          </div>
          <div className="reassurance-item">
            <Sparkles width={24} />
            <div>
              <strong>Conseil Beauté Personnalisé</strong>
              <p>Nos experts beauté vous guident par WhatsApp 7j/7.</p>
            </div>
          </div>
          <div className="reassurance-item">
            <ShoppingBag width={24} />
            <div>
              <strong>Expédition Express 24h/48h</strong>
              <p>Livraison sécurisée à Douala, Yaoundé et tout le Cameroun.</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
