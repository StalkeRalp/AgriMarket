"use client";

import Link from "next/link";
import { ArrowRight, LockKeyhole, Minus, Plus, ShieldCheck, ShoppingBag, Trash2, Truck } from "lucide-react";
import { useState } from "react";
import { useStore } from "@/lib/store";
import { money } from "@/lib/format";

export default function CartPage() {
  const { lines, subtotal, shipping, total, setQuantity, removeFromCart } = useStore();
  const [promoCode, setPromoCode] = useState("");
  const [discountApplied, setDiscountApplied] = useState(false);

  // Free shipping threshold at 25,000 FCFA
  const freeShippingThreshold = 25000;
  const remainingForFreeShipping = Math.max(0, freeShippingThreshold - subtotal);
  const freeShippingProgress = Math.min(100, (subtotal / freeShippingThreshold) * 100);

  const handleApplyPromo = (e) => {
    e.preventDefault();
    if (promoCode.trim()) {
      setDiscountApplied(true);
    }
  };

  return (
    <main className="cart-page">
      <div className="container">
        {/* Breadcrumb */}
        <nav className="product-breadcrumb">
          <Link href="/">Accueil</Link>
          <span>/</span>
          <strong>Mon Panier</strong>
        </nav>

        {/* Page Hero Header */}
        <header className="cart-page-header">
          <p className="eyebrow">VOTRE SÉLECTION</p>
          <h1>Votre Panier ({lines.length} produit{lines.length > 1 ? "s" : ""})</h1>
        </header>

        {!lines.length ? (
          <div className="empty-state-card section">
            <ShoppingBag width={48} height={48} className="empty-cart-icon" />
            <h2>Votre panier est actuellement vide</h2>
            <p>Découvrez les vivriers, semences, intrants, matériels et produits d'élevage en direct de nos producteurs partenaires.</p>
            <Link className="btn-pill-primary" href="/catalogue">
              Explorer le catalogue
            </Link>
          </div>
        ) : (
          <>
            {/* Free Delivery Threshold Bar */}
            <div className="free-shipping-progress-card">
              <div className="free-shipping-text">
                <Truck width={20} className="truck-icon" />
                {remainingForFreeShipping > 0 ? (
                  <span>
                    Plus que <strong>{money(remainingForFreeShipping)}</strong> pour débloquer la <strong>livraison GRATUITE</strong> !
                  </span>
                ) : (
                  <span className="unlocked-text">
                    🎉 Félicitations ! Vous bénéficiez de la <strong>livraison GRATUITE</strong> à Douala et Yaoundé !
                  </span>
                )}
              </div>
              <div className="progress-bar-track">
                <div className="progress-bar-fill" style={{ width: `${freeShippingProgress}%` }} />
              </div>
            </div>

            {/* Cart Layout 2-Columns */}
            <div className="cart-layout">
              {/* Left Items List */}
              <div className="cart-items-column">
                <div className="cart-items-header">
                  <span>Produit</span>
                  <span>Prix & Quantité</span>
                </div>

                <div className="cart-list">
                  {lines.map(({ product, quantity }) => (
                    <article className="cart-item-card" key={product.id}>
                      <Link href={`/produit/${product.id}`} className="cart-item-media">
                        <img src={product.image} alt={product.name} />
                      </Link>

                      <div className="cart-item-details">
                        <span className="product-brand">{product.brand}</span>
                        <h3>
                          <Link href={`/produit/${product.id}`}>{product.name}</Link>
                        </h3>
                        <span className="cart-item-format">
                          Unité : {product.unit ? product.unit.replace("_", " ") : (product.size || "Standard")}
                          {product.location ? ` • 📍 ${product.location}` : ""}
                        </span>

                        <div className="qty-picker">
                          <button onClick={() => setQuantity(product.id, quantity - 1)} aria-label="Moins">
                            <Minus width={14} />
                          </button>
                          <strong>{quantity}</strong>
                          <button onClick={() => setQuantity(product.id, quantity + 1)} aria-label="Plus">
                            <Plus width={14} />
                          </button>
                        </div>
                      </div>

                      <div className="cart-item-price-actions">
                        <strong className="cart-item-price">{money(product.price * quantity)}</strong>
                        <button className="remove-item-btn" onClick={() => removeFromCart(product.id)}>
                          <Trash2 width={15} /> Supprimer
                        </button>
                      </div>
                    </article>
                  ))}
                </div>

                <div className="cart-actions-bar">
                  <Link href="/catalogue" className="continue-shopping-link">
                    ← Continuer mes achats
                  </Link>
                </div>
              </div>

              {/* Right Summary Card (Matching disign/Panier.png) */}
              <aside className="summary-card-modern">
                <h2>Récapitulatif de la commande</h2>

                {/* Promo code form */}
                <form onSubmit={handleApplyPromo} className="promo-code-box">
                  <input
                    type="text"
                    placeholder="Code promo ou avantage"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                  />
                  <button type="submit" className="btn-apply-promo">
                    Appliquer
                  </button>
                </form>
                {discountApplied && <p className="promo-success-note">✓ Code promo appliqué !</p>}

                <div className="summary-rows-stack">
                  <div className="summary-row">
                    <span>Sous-total articles</span>
                    <strong>{money(subtotal)}</strong>
                  </div>

                  <div className="summary-row">
                    <span>Frais de livraison</span>
                    <strong>{remainingForFreeShipping === 0 ? "GRATUIT" : money(shipping)}</strong>
                  </div>

                  {discountApplied && (
                    <div className="summary-row promo-discount-row">
                      <span>Remise Privilège</span>
                      <strong>-{money(2500)}</strong>
                    </div>
                  )}

                  <div className="summary-row summary-total-row">
                    <span>Montant total</span>
                    <strong>{money(discountApplied ? Math.max(0, total - 2500) : total)}</strong>
                  </div>
                </div>

                <div className="checkout-cta-wrapper">
                  <Link className="btn-pill-primary btn-block checkout-btn-large" href="/commande">
                    Commander maintenant <ArrowRight width={18} />
                  </Link>
                </div>

                <div className="cart-trust-badges">
                  <span>
                    <Truck width={16} /> Livraison express 24-48h
                  </span>
                  <span>
                    <ShieldCheck width={16} /> Produits 100% certifiés
                  </span>
                  <span>
                    <LockKeyhole width={16} /> Paiement MoMo, OM & Cash
                  </span>
                </div>
              </aside>
            </div>
          </>
        )}
      </div>
    </main>
  );
}

