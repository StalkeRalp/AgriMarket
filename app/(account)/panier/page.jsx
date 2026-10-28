"use client";

import Link from "next/link";
import { 
  ArrowRight, 
  CheckCircle2, 
  ChevronRight, 
  LockKeyhole, 
  MapPin, 
  Minus, 
  Plus, 
  ShieldCheck, 
  ShoppingBag, 
  Store, 
  Trash2, 
  Truck 
} from "lucide-react";
import { useState } from "react";
import { useStore } from "@/lib/store";
import { money } from "@/lib/format";
import { calculatePromoDiscount } from "@/lib/promo";

export default function CartPage() {
  const { lines, subtotal, shipping, total, setQuantity, removeFromCart } = useStore();
  const [promoCode, setPromoCode] = useState("");
  const [appliedPromo, setAppliedPromo] = useState(null);
  const [promoError, setPromoError] = useState("");
  const promoResult = appliedPromo ? calculatePromoDiscount(appliedPromo.code, lines) : { valid: false, discount: 0 };
  const promoDiscount = promoResult.valid ? promoResult.discount : 0;

  // Seuil de gratuité logistique / livraison à partir de 25 000 FCFA
  const freeShippingThreshold = 25000;
  const remainingForFreeShipping = Math.max(0, freeShippingThreshold - subtotal);
  const freeShippingProgress = Math.min(100, (subtotal / freeShippingThreshold) * 100);

  const handleApplyPromo = (e) => {
    e.preventDefault();
    const result = calculatePromoDiscount(promoCode, lines);
    if (!result.valid) {
      setAppliedPromo(null);
      setPromoError("Ce code promo n’est pas valide pour les produits de votre panier.");
      sessionStorage.removeItem("agrimarket.checkoutPromo");
      return;
    }
    const code = promoCode.trim().toUpperCase();
    setAppliedPromo({ code });
    setPromoError("");
    sessionStorage.setItem("agrimarket.checkoutPromo", JSON.stringify({ code }));
  };

  return (
    <main className="cart-page">
      <div className="container" style={{ maxWidth: "1540px", margin: "0 auto", padding: "0 24px" }}>
        {/* Fil d'Ariane */}
        <nav className="agri-cart-breadcrumb" aria-label="Fil d'ariane">
          <Link href="/">Accueil</Link>
          <ChevronRight width={13} height={13} />
          <Link href="/catalogue">Catalogue</Link>
          <ChevronRight width={13} height={13} />
          <strong>Mon Panier de Commande</strong>
        </nav>

        {/* En-tête de la page */}
        <header className="agri-cart-header">
          <div className="agri-cart-kicker">
            <ShoppingBag width={14} height={14} />
            <span>COMMANDE DIRECTE BORD CHAMP</span>
          </div>
          <h1>
            Mon Panier d&apos;Achat <span>({lines.length} référence{lines.length > 1 ? "s" : ""})</span>
          </h1>
          <p>
            Vérifiez vos quantités de récoltes, semences, intrants ou équipements avant de valider votre acheminement.
          </p>
        </header>

        {!lines.length ? (
          <div className="agri-cart-empty-card">
            <div className="agri-cart-empty-icon-wrap">
              <ShoppingBag width={44} height={44} />
            </div>
            <h2>Votre panier agropastoral est actuellement vide</h2>
            <p>
              Explorez nos récoltes fraîches du terroir, semences certifiées, animaux d&apos;élevage, provendes et outillages disponibles au Cameroun.
            </p>
            <Link className="agri-cart-primary-btn" href="/catalogue">
              <span>Explorer tout le catalogue</span>
              <ArrowRight width={15} height={15} />
            </Link>
          </div>
        ) : (
          <>
            {/* Barre de seuil de livraison / mutualisation logistique */}
            <div className="agri-shipping-progress-card">
              <div className="agri-shipping-progress-info">
                <div className="agri-shipping-icon-box">
                  <Truck width={20} height={20} />
                </div>
                {remainingForFreeShipping > 0 ? (
                  <p>
                    Plus que <strong>{money(remainingForFreeShipping)}</strong> pour bénéficier de la <strong>livraison groupée offerte</strong> à Douala et Yaoundé !
                  </p>
                ) : (
                  <p className="agri-shipping-unlocked">
                    <CheckCircle2 width={18} height={18} />
                    <span>Félicitations ! Votre commande bénéficie de la <strong>livraison logistique offerte</strong> sur les axes principaux !</span>
                  </p>
                )}
              </div>
              <div className="agri-progress-track">
                <div className="agri-progress-fill" style={{ width: `${freeShippingProgress}%` }} />
              </div>
            </div>

            {/* Layout 2 colonnes */}
            <div className="agri-cart-layout">
              {/* Colonne gauche : Liste des articles */}
              <div className="agri-cart-items-column">
                <div className="agri-cart-table-head">
                  <span>PRODUITS &amp; PROVENANCE</span>
                  <span>QUANTITÉ &amp; TOTAL</span>
                </div>

                <div className="agri-cart-items-list">
                  {lines.map(({ product, quantity }) => (
                    <article className="agri-cart-item-row" key={product.id}>
                      <Link href={`/produit/${product.id}`} className="agri-cart-item-thumb">
                        <img src={product.image} alt={product.name} />
                      </Link>

                      <div className="agri-cart-item-info">
                        <div className="agri-cart-item-tags">
                          <span className="agri-cart-cat-tag">
                            {product.category || "Filière locale"}
                          </span>
                          {product.brand && (
                            <span className="agri-cart-brand-tag">
                              <Store width={11} height={11} />
                              {product.brand}
                            </span>
                          )}
                        </div>

                        <h3>
                          <Link href={`/produit/${product.id}`}>{product.name}</Link>
                        </h3>

                        <div className="agri-cart-item-metadata">
                          <span className="agri-cart-unit-badge">
                            Conditionnement : {product.unit ? product.unit.replace("_", " ") : (product.size || "Standard")}
                          </span>
                          {product.location && (
                            <span className="agri-cart-origin-badge">
                              <MapPin width={12} height={12} />
                              Origine : {product.location}
                            </span>
                          )}
                        </div>

                        {/* Sélecteur de quantité rectangulaire */}
                        <div className="agri-cart-qty-wrapper">
                          <span className="agri-qty-label">Quantité :</span>
                          <div className="agri-cart-qty-picker">
                            <button 
                              type="button"
                              onClick={() => setQuantity(product.id, quantity - 1)} 
                              aria-label="Diminuer la quantité"
                            >
                              <Minus width={13} height={13} />
                            </button>
                            <strong>{quantity}</strong>
                            <button 
                              type="button"
                              onClick={() => setQuantity(product.id, quantity + 1)} 
                              aria-label="Augmenter la quantité"
                            >
                              <Plus width={13} height={13} />
                            </button>
                          </div>
                        </div>
                      </div>

                      <div className="agri-cart-item-pricing">
                        <strong className="agri-cart-total-price">
                          {money(product.price * quantity)}
                        </strong>
                        {quantity > 1 && (
                          <span className="agri-cart-unit-calc">
                            {money(product.price)} l&apos;unité
                          </span>
                        )}
                        <button 
                          type="button"
                          className="agri-cart-remove-btn" 
                          onClick={() => removeFromCart(product.id)}
                          title="Supprimer cet article"
                        >
                          <Trash2 width={13} height={13} />
                          <span>Supprimer</span>
                        </button>
                      </div>
                    </article>
                  ))}
                </div>

                <div className="agri-cart-bottom-actions">
                  <Link href="/catalogue" className="agri-cart-continue-link">
                    <span>← Continuer mes achats au catalogue</span>
                  </Link>
                </div>
              </div>

              {/* Colonne droite : Récapitulatif commande */}
              <aside className="agri-cart-summary-sidebar">
                <div className="agri-cart-summary-card">
                  <h2>Récapitulatif de la commande</h2>

                  {/* Formulaire Code Avantage */}
                  <form onSubmit={handleApplyPromo} className="agri-promo-form">
                    <input
                      type="text"
                      placeholder="Code avantage ou promo"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value)}
                    />
                    <button type="submit" className="agri-promo-apply-btn">
                      Appliquer
                    </button>
                  </form>
                  {appliedPromo && promoDiscount > 0 && (
                    <p className="agri-promo-success-msg">
                      <CheckCircle2 width={13} height={13} />
                      <span>Code {appliedPromo.code} appliqué : {money(promoDiscount)} de remise.</span>
                    </p>
                  )}
                  {promoError && <p className="agri-promo-error-msg" role="alert">{promoError}</p>}

                  {/* Lignes de calcul */}
                  <div className="agri-summary-lines-stack">
                    <div className="agri-summary-line">
                      <span>Sous-total articles</span>
                      <strong>{money(subtotal)}</strong>
                    </div>

                    <div className="agri-summary-line">
                      <span>Frais de logistique &amp; livraison</span>
                      <strong>{remainingForFreeShipping === 0 ? "GRATUIT" : money(shipping)}</strong>
                    </div>

                    {promoDiscount > 0 && (
                      <div className="agri-summary-line agri-discount-line">
                        <span>Remise promo ({appliedPromo.code})</span>
                        <strong>-{money(promoDiscount)}</strong>
                      </div>
                    )}

                    <div className="agri-summary-total-line">
                      <span>Montant total TTC</span>
                      <strong>{money(Math.max(0, total - promoDiscount))}</strong>
                    </div>
                  </div>

                  {/* CTA Principal Commander */}
                  <div className="agri-checkout-cta-box">
                    <Link className="agri-cart-checkout-btn" href="/commande">
                      <span>Passer à la caisse</span>
                      <ArrowRight width={16} height={16} />
                    </Link>
                  </div>

                  {/* Engagements de confiance */}
                  <div className="agri-cart-guarantees">
                    <div className="agri-cart-guarantee-item">
                      <Truck width={16} height={16} />
                      <span>Livraison sécurisée dans les 10 régions</span>
                    </div>
                    <div className="agri-cart-guarantee-item">
                      <ShieldCheck width={16} height={16} />
                      <span>Traçabilité et origine bord champ vérifiée</span>
                    </div>
                    <div className="agri-cart-guarantee-item">
                      <LockKeyhole width={16} height={16} />
                      <span>Paiement sécurisé : MTN MoMo, Orange Money &amp; Cash</span>
                    </div>
                  </div>
                </div>
              </aside>
            </div>
          </>
        )}
      </div>
    </main>
  );
}

