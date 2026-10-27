"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, Check, Heart, Leaf, MapPin, PackageCheck, Share2, ShoppingBag, Sprout, Trash2 } from "lucide-react";
import { useStore } from "@/lib/store";
import { useRequireAuth } from "@/composants/RequireAuth";

const formatPrice = (price) => `${Number(price || 0).toLocaleString("fr-FR")} FCFA`;

export default function FavorisPage() {
  const { user, hydrated } = useRequireAuth();
  const { products, wishlist, toggleWishlist, addToCart, notify } = useStore();
  const [notice, setNotice] = useState("");
  const [confirmClear, setConfirmClear] = useState(false);

  const favoriteProducts = useMemo(() => products.filter((product) => wishlist.includes(product.id)), [products, wishlist]);
  const suggestions = useMemo(() => products.filter((product) => !wishlist.includes(product.id)).slice(0, 4), [products, wishlist]);

  const announce = (message) => {
    notify?.(message);
    setNotice(message);
    window.setTimeout(() => setNotice(""), 3200);
  };
  const addProduct = (product) => {
    addToCart(product.id);
    announce(`${product.name} ajouté au panier.`);
  };
  const shareList = async () => {
    try {
      if (navigator.share) await navigator.share({ title: "Ma sélection AgriMarket", text: "Les produits que j’ai repérés sur AgriMarket", url: window.location.href });
      else { await navigator.clipboard.writeText(window.location.href); announce("Lien de votre sélection copié."); }
    } catch { /* L’utilisateur peut annuler le partage. */ }
  };
  const clearFavorites = () => {
    [...wishlist].forEach((id) => toggleWishlist(id));
    setConfirmClear(false);
    announce("Votre sélection a été vidée.");
  };

  if (!hydrated || !user) return <main className="agri-favorites-loading"><span /><p>Chargement de votre sélection…</p></main>;

  return (
    <main className="agri-favorites-page">
      {notice && <div className="agri-favorites-toast" role="status"><Check size={16} />{notice}</div>}
      {confirmClear && <div className="agri-favorites-modal-backdrop" onClick={() => setConfirmClear(false)}><section className="agri-favorites-modal" role="dialog" aria-modal="true" aria-labelledby="clear-title" onClick={(event) => event.stopPropagation()}><span className="agri-favorites-modal-icon"><Trash2 /></span><h2 id="clear-title">Vider votre sélection ?</h2><p>Les produits enregistrés seront retirés de vos favoris.</p><div><button type="button" className="agri-favorites-danger" onClick={clearFavorites}>Vider les favoris</button><button type="button" className="agri-favorites-cancel" onClick={() => setConfirmClear(false)}>Garder ma sélection</button></div></section></div>}

      <header className="agri-favorites-hero">
        <div className="agri-favorites-hero-inner">
          <span className="agri-favorites-kicker"><Heart size={15} /> Votre carnet de produits</span>
          <h1>Vos favoris,<br /><span>au rythme des saisons.</span></h1>
          <p>Gardez à portée de main les récoltes, produits d’élevage et fournitures agricoles qui vous intéressent.</p>
          <div className="agri-favorites-hero-count"><strong>{favoriteProducts.length}</strong><span>{favoriteProducts.length === 1 ? "produit sélectionné" : "produits sélectionnés"}</span></div>
        </div>
        <div className="agri-favorites-hero-note"><Sprout size={22} /><span>Des produits locaux<br />pour vos projets agricoles</span></div>
      </header>

      <section className="agri-favorites-main">
        <div className="agri-favorites-breadcrumb"><Link href="/">Accueil</Link><span>/</span><strong>Mes favoris</strong></div>
        {favoriteProducts.length > 0 ? <>
          <div className="agri-favorites-toolbar"><div><span className="agri-favorites-section-kicker">VOTRE CARNET</span><h2>Produits enregistrés</h2></div><div className="agri-favorites-actions"><button type="button" className="agri-favorites-share" onClick={shareList}><Share2 size={16} />Partager</button><button type="button" className="agri-favorites-clear" onClick={() => setConfirmClear(true)}><Trash2 size={16} />Vider la liste</button></div></div>
          <div className="agri-favorites-grid">{favoriteProducts.map((product) => <article className="agri-favorite-card" key={product.id}>
            <div className="agri-favorite-image"><Link href={`/produit/${product.id}`}><img src={product.image || "/Images%20Agrimarket/images2/FOOD%20%E2%80%94%20BOBBI%20%20LIN.jpeg"} alt={product.name} /></Link><span className="agri-favorite-saved"><Heart size={13} fill="currentColor" /> Enregistré</span><button type="button" className="agri-favorite-remove" aria-label={`Retirer ${product.name} des favoris`} onClick={() => { toggleWishlist(product.id); announce(`${product.name} retiré des favoris.`); }}><Trash2 size={16} /></button></div>
            <div className="agri-favorite-info"><span className="agri-favorite-origin"><MapPin size={13} />{product.location || product.city || "Cameroun"}</span><h3><Link href={`/produit/${product.id}`}>{product.name}</Link></h3><p>{product.brand || product.sellerName || product.category || "Produit agricole"}{product.unit ? ` · ${product.unit}` : ""}</p><div className="agri-favorite-card-bottom"><strong>{formatPrice(product.price)}</strong><button type="button" onClick={() => addProduct(product)}><ShoppingBag size={15} />Ajouter</button></div></div>
          </article>)}</div>
        </> : <div className="agri-favorites-empty"><span><Heart size={30} /></span><span className="agri-favorites-section-kicker">VOTRE CARNET EST ENCORE VIDE</span><h2>Commencez votre sélection</h2><p>Enregistrez les produits qui vous intéressent pour les retrouver facilement lors de votre prochaine visite.</p><Link href="/catalogue">Explorer le catalogue <ArrowRight size={16} /></Link></div>}

        {suggestions.length > 0 && <section className="agri-favorites-discover"><div className="agri-favorites-toolbar"><div><span className="agri-favorites-section-kicker">À DÉCOUVRIR SUR AGRIMARKET</span><h2>Peut-être pour votre prochaine récolte</h2></div><Link href="/catalogue">Tout le catalogue <ArrowRight size={15} /></Link></div><div className="agri-favorites-grid agri-favorites-suggestions">{suggestions.map((product) => <article className="agri-favorite-card" key={product.id}><div className="agri-favorite-image"><Link href={`/produit/${product.id}`}><img src={product.image || "/Images%20Agrimarket/images2/FOOD%20%E2%80%94%20BOBBI%20%20LIN.jpeg"} alt={product.name} /></Link><button type="button" className="agri-favorite-remove agri-favorite-add" aria-label={`Ajouter ${product.name} aux favoris`} onClick={() => { toggleWishlist(product.id); announce(`${product.name} ajouté aux favoris.`); }}><Heart size={17} /></button></div><div className="agri-favorite-info"><span className="agri-favorite-origin"><Leaf size={13} />{product.category || "Sélection locale"}</span><h3><Link href={`/produit/${product.id}`}>{product.name}</Link></h3><p>{product.brand || product.sellerName || "AgriMarket Cameroun"}</p><div className="agri-favorite-card-bottom"><strong>{formatPrice(product.price)}</strong><Link href={`/produit/${product.id}`} aria-label={`Voir ${product.name}`}><ArrowRight size={17} /></Link></div></div></article>)}</div></section>}
      </section>

      <section className="agri-favorites-benefits"><div><span><PackageCheck size={22} /></span><p><strong>Une sélection à votre mesure</strong><small>Retrouvez facilement les produits repérés.</small></p></div><div><span><Sprout size={22} /></span><p><strong>Le meilleur des terroirs</strong><small>Découvrez les offres de producteurs locaux.</small></p></div><div><span><ShoppingBag size={22} /></span><p><strong>Prêts pour votre panier</strong><small>Ajoutez vos favoris quand vous le souhaitez.</small></p></div></section>
    </main>
  );
}
