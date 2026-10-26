"use client";

import Link from "next/link";
import { Heart, ShoppingBag } from "lucide-react";
import { useRouter } from "next/navigation";
import { useStore } from "@/lib/store";
import { money } from "@/lib/format";

export function ProductCard({ product }) {
  const router = useRouter();
  const { addToCart, wishlist, toggleWishlist } = useStore();

  const images = product.images?.length ? product.images : [product.image];
  const href = `/produit/${encodeURIComponent(product.id)}`;
  const isWishlisted = wishlist.includes(product.id);

  const discountPercent =
    product.oldPrice && product.oldPrice > product.price
      ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)
      : null;

  const buyersCount = 300 + (parseInt(product.id, 36) % 450 || 180);

  const handleCardClick = (event) => {
    const clickedInteractive = event.target.closest("a,button,input,select,textarea,label");
    if (!clickedInteractive) {
      router.push(href);
    }
  };

  return (
    <article
      className="product-card Image2-product-card"
      data-product-id={product.id}
      tabIndex={0}
      role="link"
      aria-label={`Voir ${product.name}, référence ${product.reference}`}
      onClick={handleCardClick}
    >
      <div className="product-media studio-media-wrap">
        <Link className="product-media-link" href={href}>
          <img className="product-img product-img-main" loading="lazy" src={images[0]} alt={product.name} />
          <img className="product-img product-img-alt" loading="lazy" src={images[1] || images[0]} alt="" aria-hidden="true" />
        </Link>

        <div className="studio-badge-stack">
          {product.new ? (
            <span className="studio-tag-pill">NOUVEAU</span>
          ) : product.bestseller || product.rating >= 4.8 ? (
            <span className="studio-tag-pill">BESTSELLER</span>
          ) : discountPercent ? (
            <span className="studio-tag-pill sale">-{discountPercent}%</span>
          ) : null}
        </div>

        <button
          type="button"
          className={`wishlist-circle-btn ${isWishlisted ? "is-active" : ""}`}
          onClick={() => toggleWishlist(product.id)}
          aria-label="Ajouter aux favoris"
        >
          <Heart fill={isWishlisted ? "#f37021" : "none"} color={isWishlisted ? "#f37021" : "#444444"} width={16} height={16} />
        </button>

        <button
          type="button"
          className="studio-quick-add-btn"
          disabled={product.stock <= 0}
          onClick={() => addToCart(product.id)}
        >
          <ShoppingBag width={14} height={14} /> Ajout rapide
        </button>
      </div>

      <div className="product-info studio-info-box">
        <div className="product-meta-row" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
          <span className="product-brand-tag">{product.brand || "AgriMarket"}</span>
          {product.location && (
            <span style={{ fontSize: "11px", color: "#6a7b63", display: "inline-flex", alignItems: "center", gap: "2px" }}>
              📍 {product.location}
            </span>
          )}
        </div>

        <h3 className="studio-product-title">
          <Link href={href}>{product.name}</Link>
        </h3>

        <div className="studio-rating-row">
          <div className="studio-stars">★★★★★</div>
          <span className="reviews-count">({product.reviews || 42})</span>
        </div>

        <div className="studio-bottom-line">
          <div className="studio-price-box">
            <strong className="studio-price">
              {money(product.price)}
              {product.unit && (
                <span style={{ fontSize: "12px", fontWeight: "normal", color: "#555", marginLeft: "4px" }}>
                  / {product.unit.replace("_", " ")}
                </span>
              )}
            </strong>
            {product.oldPrice && <del className="studio-old-price">{money(product.oldPrice)}</del>}
          </div>
          <div className="studio-buyers-tag">+{buyersCount} ventes</div>
        </div>
      </div>
    </article>
  );
}

