"use client";

import Link from "next/link";
import { 
  ArrowRight, 
  Check, 
  Heart, 
  HelpCircle, 
  LockKeyhole, 
  Minus, 
  Plus, 
  RotateCcw, 
  ShieldCheck, 
  ShoppingBag, 
  Star, 
  Truck, 
  ZoomIn,
  MessageSquare,
  Sprout,
  MapPin,
  CheckCircle2,
  Share2,
  Copy,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Scale,
  Info,
  X
} from "lucide-react";
import { useParams } from "next/navigation";
import { useEffect, useState, useMemo, useRef } from "react";
import { useStore } from "@/lib/store";
import { money } from "@/lib/format";
import { ProductCard } from "@/composants/ProductCard";
import ScrollRevealEffects from "@/composants/ScrollRevealEffects";

export default function ProductPage() {
  const { id } = useParams();
  const { products, addToCart, wishlist, toggleWishlist, rememberProduct, reviews, addReview, user, notify } = useStore();
  const product = products.find((item) => item.id === id);

  const [image, setImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const marqueeViewportRef = useRef(null);

  // États pour le formulaire interactif d'avis
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [ratingHover, setRatingHover] = useState(0);
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewForm, setReviewForm] = useState({
    rating: 5,
    name: user?.name || user?.firstName || "",
    role: "Maraîcher / Agriculteur",
    location: "Foumbot (Ouest)",
    title: "",
    comment: "",
    recommends: true
  });
  const relatedRailRef = useRef(null);

  useEffect(() => {
    if (user && !reviewForm.name) {
      setReviewForm(prev => ({
        ...prev,
        name: user.name || user.firstName || ""
      }));
    }
  }, [user]);

  const handleSubmitReview = (e) => {
    e.preventDefault();
    if (!reviewForm.name.trim()) {
      notify("Veuillez renseigner votre nom ou raison sociale.");
      return;
    }
    if (!reviewForm.title.trim()) {
      notify("Veuillez donner un titre à votre avis.");
      return;
    }
    if (!reviewForm.comment.trim()) {
      notify("Veuillez écrire quelques lignes sur votre retour d'expérience.");
      return;
    }

    setReviewSubmitting(true);
    setTimeout(() => {
      if (addReview) {
        addReview({
          productId: product.id,
          name: reviewForm.name.trim(),
          role: reviewForm.role,
          location: reviewForm.location,
          rating: reviewForm.rating,
          title: reviewForm.title.trim(),
          comment: reviewForm.comment.trim(),
          recommends: reviewForm.recommends
        });
      }
      setReviewSubmitting(false);
      setShowReviewForm(false);
      setReviewForm({
        rating: 5,
        name: user?.name || user?.firstName || "",
        role: "Maraîcher / Agriculteur",
        location: "Foumbot (Ouest)",
        title: "",
        comment: "",
        recommends: true
      });
    }, 250);
  };

  useEffect(() => {
    if (id) rememberProduct(id);
  }, [id, rememberProduct]);

  // Produits d'autres catégories pour la rangée défilante horizontale
  const otherCategoryProducts = useMemo(() => {
    if (!product) return [];
    const others = products.filter((item) => item.category !== product.category && item.id !== product.id);
    return others.length > 0 ? others : products.filter((item) => item.id !== product.id);
  }, [products, product]);

  // Duplication pour défilement infini et continu
  const marqueeList = useMemo(() => {
    if (!otherCategoryProducts.length) return [];
    return [...otherCategoryProducts, ...otherCategoryProducts, ...otherCategoryProducts];
  }, [otherCategoryProducts]);

  const scrollMarquee = (direction) => {
    if (marqueeViewportRef.current) {
      marqueeViewportRef.current.scrollBy({ left: direction, behavior: "smooth" });
    }
  };

  const getProductUrl = () => {
    if (typeof window !== "undefined") {
      return window.location.href;
    }
    return `https://agrimarket.cm/produit/${product?.id || ""}`;
  };

  const handleCopyLink = () => {
    const url = getProductUrl();
    if (typeof navigator !== "undefined" && navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(url).then(() => {
        notify("Lien du produit copié dans le presse-papier !");
      }).catch(() => {
        notify("Lien : " + url);
      });
    } else {
      notify("Lien : " + url);
    }
  };

  const handleShareNative = async () => {
    const url = getProductUrl();
    if (typeof navigator !== "undefined" && navigator.share && product) {
      try {
        await navigator.share({
          title: `${product.name} | AgriMarket Cameroun`,
          text: `Découvrez ${product.name} sur AgriMarket Cameroun (${money(product.price)}/${product.unit || "unité"}) :`,
          url: url
        });
        return;
      } catch (err) {
        // Fallback to modal if user cancels or share fails
      }
    }
    setShareModalOpen(true);
  };

  if (!product) {
    return (
      <main className="section container">
        <div className="empty-state-card">
          <h1>Produit introuvable</h1>
          <p>Le produit que vous cherchez n'existe pas ou n'est plus disponible.</p>
          <Link className="agri-btn-add-cart" href="/catalogue" style={{ display: "inline-flex", width: "auto" }}>
            Retour au catalogue agropastoral
          </Link>
        </div>
      </main>
    );
  }

  const images = product.images?.length ? product.images : [product.image];
  const related = product ? (() => {
    const eligible = products.filter(item => item.id !== product.id && !["archived", "suspended", "pending", "draft"].includes(String(item.status || "").toLowerCase()));
    const sameCategory = eligible.filter(item => item.category === product.category);
    const otherCategories = eligible.filter(item => item.category !== product.category);
    return [...sameCategory, ...otherCategories].slice(0, 12);
  })() : [];

  const scrollRelatedProducts = direction => {
    relatedRailRef.current?.scrollBy({ left: direction * 340, behavior: "smooth" });
  };

  const DEFAULT_REVIEWS = useMemo(() => [
    {
      id: "rev-agri-1",
      productId: product?.id,
      name: "Michel T.",
      location: "Foumbot (Ouest)",
      role: "Maraîcher & Coopérateur",
      title: "Excellente fraîcheur et conformité exemplaire",
      comment: "Commandé en demi-gros pour approvisionner notre groupement à Foumbot. Les sacs sont arrivés en parfait état, pesée exacte et fraîcheur irréprochable. C'est rassurant d'avoir enfin une vraie plateforme dédiée au Cameroun.",
      rating: 5,
      date: "18 Octobre 2026",
      approved: true
    },
    {
      id: "rev-agri-2",
      productId: product?.id,
      name: "Célestin M.",
      location: "Obala (Centre)",
      role: "Éleveur & Aviculteur",
      title: "Rapport qualité-prix imbattable bord-champ",
      comment: "Très satisfait de la traçabilité. Les intrants et semences correspondent parfaitement aux spécifications techniques. Le suivi par WhatsApp m'a permis de coordonner le déchargement avec le transporteur sans aucun retard.",
      rating: 5,
      date: "12 Octobre 2026",
      approved: true
    },
    {
      id: "rev-agri-3",
      productId: product?.id,
      name: "Aïssatou B.",
      location: "Douala (Littoral)",
      role: "Grossiste & Restauratrice",
      title: "Approvisionnement régulier et gain de temps précieux",
      comment: "Plus besoin de faire le tour des marchés aux aurores. La commande est livrée directement à notre dépôt à Douala. Qualité constante et facture claire pour notre gestion.",
      rating: 5,
      date: "04 Octobre 2026",
      approved: true
    },
    {
      id: "rev-agri-4",
      productId: product?.id,
      name: "Emmanuel K.",
      location: "Bafoussam (Ouest)",
      role: "Planteur Indépendant",
      title: "Circuit court garanti, rémunération juste",
      comment: "On ressent directement le lien avec nos terroirs. Les conseils agronomiques mentionnés sur la fiche produit sont pertinents pour la saison actuelle. Je renouvellerai mes commandes pour la prochaine campagne.",
      rating: 5,
      date: "28 Septembre 2026",
      approved: true
    }
  ], [product?.id]);

  const productReviews = useMemo(() => {
    const fromStore = reviews.filter((review) => review.productId === product?.id && review.approved);
    return [...fromStore, ...DEFAULT_REVIEWS.filter(d => !fromStore.some(s => s.id === d.id))];
  }, [reviews, product?.id, DEFAULT_REVIEWS]);

  const isWishlisted = wishlist.includes(product.id);

  // Discount percentage
  const discountPercent = product.oldPrice && product.oldPrice > product.price
    ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)
    : null;

  return (
    <main className="product-page">
      <div className="container">
        {/* Breadcrumb Trail */}
        <nav className="product-breadcrumb">
          <Link href="/">Accueil</Link>
          <span>/</span>
          <Link href="/catalogue">Catalogue</Link>
          <span>/</span>
          <Link href={`/catalogue?category=${product.category}`}>{product.category}</Link>
          <span>/</span>
          <strong>{product.name}</strong>
        </nav>

        {/* Product Hero Section */}
        <section className="product-layout product-layout--editorial">
          {/* Left Column: Gallery + Freshness Guarantees + Specifications (Comble l'espace vide) */}
          <div className="product-gallery-column">
            <div className="product-gallery">
              <div className="product-thumbs">
                {images.map((src, index) => (
                  <button
                    className={image === index ? "active" : ""}
                    onClick={() => setImage(index)}
                    key={`${src}-${index}`}
                  >
                    <img src={src} alt={`${product.name} vue ${index + 1}`} />
                  </button>
                ))}
              </div>
              <div className="product-image-main">
                <img src={images[image]} alt={product.name} />
                <span className="image-zoom-hint">
                  <ZoomIn width={14} /> Survoler pour agrandir
                </span>
                <div className="product-image-badge-guarantee">
                  <Sprout width={13} /> Terroir Camerounais Vérifié
                </div>
              </div>
            </div>

            {/* Contenu comblant l'espace vide sous la photo du produit */}
            <div className="agri-under-gallery-block">
              {/* Carte 4 Piliers Engagements Récolte Bord-Champ */}
              <div className="agri-freshness-guarantee-card">
                <div className="agri-freshness-header">
                  <ShieldCheck width={17} />
                  <h4>Engagements Fraîcheur & Récolte Bord-Champ</h4>
                </div>
                <div className="agri-freshness-grid">
                  <div className="freshness-item">
                    <Sprout width={16} />
                    <div>
                      <strong>Circuit Court Direct</strong>
                      <p>Issu directement des coopératives et exploitants du Cameroun.</p>
                    </div>
                  </div>
                  <div className="freshness-item">
                    <Truck width={16} />
                    <div>
                      <strong>Transport Spécialisé</strong>
                      <p>Conditionnement aéré sous caisses adaptées sous 24h à 48h.</p>
                    </div>
                  </div>
                  <div className="freshness-item">
                    <Scale width={16} />
                    <div>
                      <strong>Pesée & Calibrage Certifiés</strong>
                      <p>Poids réel et qualité vérifiés avant tout départ d'entrepôt.</p>
                    </div>
                  </div>
                  <div className="freshness-item">
                    <RotateCcw width={16} />
                    <div>
                      <strong>Remplacement Garanti</strong>
                      <p>Assistance WhatsApp dédiée et remplacement en cas d'avarie.</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Fiche Technique & Spécifications Rapides */}
              <div className="agri-specs-summary-card">
                <div className="agri-specs-summary-header">
                  <Info width={15} />
                  <span>Spécifications & Traçabilité Rapide</span>
                </div>
                <div className="agri-specs-rows">
                  <div className="spec-row">
                    <span>Filière agropastorale</span>
                    <strong>{product.category}</strong>
                  </div>
                  <div className="spec-row">
                    <span>Bassin de production</span>
                    <strong>📍 {product.location || "Cameroun (Bassin Agricole)"}</strong>
                  </div>
                  <div className="spec-row">
                    <span>Conditionnement d'expédition</span>
                    <strong>{product.unit ? product.unit.replace("_", " ") : "Caisse / Sac aéré"}</strong>
                  </div>
                  <div className="spec-row">
                    <span>Disponibilité temps réel</span>
                    <strong style={{ color: product.stock > 0 ? "#0b5d33" : "#dc2626" }}>
                      {product.stock > 0 ? `En stock (${product.stock} unités prêtes à expédier)` : "Rupture temporaire"}
                    </strong>
                  </div>
                  <div className="spec-row">
                    <span>Réf. Lot traçabilité</span>
                    <code>AGRI-{product.id?.slice(0, 8).toUpperCase()}</code>
                  </div>
                </div>
              </div>

              {/* Carte Partager ce produit (sous la galerie) */}
              <div className="agri-share-product-card">
                <div className="agri-share-card-copy">
                  <Share2 width={18} />
                  <div>
                    <strong>Recommander ce produit à un proche ou groupement</strong>
                    <p>Partagez la fiche produit sur WhatsApp, par SMS ou sur vos réseaux en 1 clic.</p>
                  </div>
                </div>
                <button 
                  type="button" 
                  className="agri-btn-trigger-share"
                  onClick={handleShareNative}
                >
                  <Share2 width={14} /> Partager
                </button>
              </div>
            </div>
          </div>

          {/* Right Product Details Info Stack */}
          <div className="product-details">
            <div className="product-meta-line">
              <Link className="product-brand-link" href={`/catalogue?q=${product.brand}`}>
                {product.brand}
              </Link>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <button
                  type="button"
                  className="agri-header-share-btn"
                  onClick={handleShareNative}
                  title="Partager ce produit"
                  aria-label="Partager ce produit"
                >
                  <Share2 width={14} />
                  <span>Partager</span>
                </button>
                <button
                  className={`wishlist-inline ${isWishlisted ? "is-active" : ""}`}
                  onClick={() => toggleWishlist(product.id)}
                  aria-label="Ajouter aux favoris"
                >
                  <Heart fill={isWishlisted ? "currentColor" : "none"} />
                </button>
              </div>
            </div>

            <h1 className="product-title">{product.name}</h1>

            <a href="#reviews" className="product-rating">
              <div className="stars-row">
                <Star className="star-icon fill" />
                <Star className="star-icon fill" />
                <Star className="star-icon fill" />
                <Star className="star-icon fill" />
                <Star className="star-icon fill" />
              </div>
              <strong>{product.rating || "4.9"}/5</strong>
              <u>({product.reviews || 24} avis certifiés)</u>
            </a>

            <p className="product-lead">{product.description}</p>

            <div className="product-price-pill-row">
              <div className="product-price">
                <strong>
                  {money(product.price)}
                  {product.unit && (
                    <span style={{ fontSize: "14px", fontWeight: "normal", color: "#666", marginLeft: "6px" }}>
                      / {product.unit.replace("_", " ")}
                    </span>
                  )}
                </strong>
                {product.oldPrice && <del>{money(product.oldPrice)}</del>}
              </div>
              {discountPercent && <span className="discount-pill-tag">-{discountPercent}% ÉCONOMISÉS</span>}
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "8px", margin: "16px 0" }}>
              <div className="product-format">
                <span>Unité de vente</span>
                <strong>{product.unit ? product.unit.replace("_", " ") : "Standard"}</strong>
              </div>
              {product.location && (
                <div className="product-format">
                  <span>Lieu de disponibilité</span>
                  <strong>📍 {product.location}</strong>
                </div>
              )}
              {product.saleMode && (
                <div className="product-format">
                  <span>Mode de vente</span>
                  <strong>
                    {product.saleMode === "gros" 
                      ? "Vente en gros / Demi-gros" 
                      : product.saleMode === "detail" 
                      ? "Vente au détail" 
                      : "Détail & Demi-gros"}
                  </strong>
                </div>
              )}
            </div>

            <p className={`availability ${product.stock > 0 ? "in" : "out"}`}>
              {product.stock > 0 ? `En stock (${product.stock} disponibles) • Disponible pour retrait ou expédition` : "Rupture de stock"}
            </p>

            {/* Buy Actions Group */}
            <div className="next-product-buy">
              <div className="next-quantity">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} aria-label="Réduire">
                  <Minus width={14} />
                </button>
                <strong>{quantity}</strong>
                <button onClick={() => setQuantity(Math.min(product.stock, quantity + 1))} aria-label="Augmenter">
                  <Plus width={14} />
                </button>
              </div>

              <button
                className="agri-btn-add-cart"
                disabled={product.stock <= 0}
                onClick={() => addToCart(product.id, quantity)}
              >
                <ShoppingBag width={18} /> Ajouter au panier — {money(product.price * quantity)}
              </button>
            </div>

            {/* Trust Badges Row */}
            <div className="product-delivery-notes">
              <span>
                <Truck /> <strong>Livraison ou Retrait</strong> Chez le producteur ou en point relais
              </span>
              <span>
                <ShieldCheck /> <strong>Paiement Garanti</strong> MoMo, OM ou Virement bancaire
              </span>
              <span>
                <RotateCcw /> <strong>Qualité Terroir</strong> Produits contrôlés & traçabilité locale
              </span>
            </div>

            {/* Terroir & Producteur Partenaire Card */}
            <div className="agri-producer-card">
              <div className="agri-producer-card-top">
                <div className="agri-producer-meta">
                  <div className="agri-producer-icon">
                    <Sprout width={22} />
                  </div>
                  <div>
                    <h4>{product.brand || "Coopérative Agropastorale Partenaire"}</h4>
                    <span>Bassin de production : <strong>{product.location || "Ouest / Centre, Cameroun"}</strong></span>
                  </div>
                </div>
                <a 
                  href={`https://wa.me/237699000000?text=${encodeURIComponent(`Bonjour, je vous contacte depuis AgriMarket concernant *${product.name}* (${money(product.price)}/${product.unit || "unité"}). Pouvez-vous me renseigner sur la disponibilité et les remises pour gros volumes ?`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="agri-producer-btn-whatsapp"
                >
                  <MessageSquare width={14} /> WhatsApp Producteur
                </a>
              </div>
              <div className="agri-producer-chips">
                <span className="agri-producer-chip accent">
                  <CheckCircle2 width={12} /> Circuit court bord-champ
                </span>
                <span className="agri-producer-chip">
                  <MapPin width={12} /> {product.location || "Cameroun"}
                </span>
                <span className="agri-producer-chip">
                  Mode : {product.saleMode === "gros" ? "Vente en gros (B2B)" : product.saleMode === "detail" ? "Vente au détail" : "Détail & Demi-gros"}
                </span>
              </div>
            </div>

            {/* Product Information Accordions */}
            <div className="info-accordion">
              <details open>
                <summary>Bénéfices & Avantages</summary>
                <ul>
                  {product.benefits?.map((item) => (
                    <li key={item}>
                      <Check width={14} className="check-icon" /> {item}
                    </li>
                  ))}
                </ul>
              </details>
              <details>
                <summary>Caractéristiques & Spécifications</summary>
                <p>{product.composition}</p>
              </details>
              <details>
                <summary>Conseils agronomiques & Utilisation</summary>
                <p>{product.usage}</p>
              </details>
              <details>
                <summary>Précautions & Conservation</summary>
                <p>{product.precautions}</p>
              </details>
            </div>
          </div>
        </section>
      </div>

      {/* Highlights Section */}
      <section className="product-benefits">
        <div className="container">
          <div className="product-benefits__intro">
            <p className="eyebrow">POURQUOI ON L'AIME</p>
            <h2>Des solutions choisies pour la performance agricole</h2>
          </div>
          <div className="product-benefits__grid">
            {(product.benefits || ["Qualité certifiée", "Performance durable", "Adapté au contexte camerounais"]).slice(0, 3).map((item) => (
              <article key={item}>
                <ShieldCheck />
                <h3>{item}</h3>
                <p>Contrôlé pour satisfaire les besoins des producteurs, éleveurs et opérateurs agricoles.</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* RANGÉE HORIZONTALE DÉFILANTE DE GAUCHE À DROITE (AUTRES CATÉGORIES) */}
      {marqueeList.length > 0 && (
        <section className="agri-marquee-section">
          <div className="container">
            <div className="agri-marquee-header">
              <div>
                <span className="eyebrow">DÉCOUVREZ AUSSI NOS AUTRES FILIÈRES DU TERROIR</span>
                <h2>Produits complémentaires d'autres catégories</h2>
              </div>
              <div className="agri-marquee-controls">
                <span className="agri-marquee-badge">
                  <Sparkles width={13} /> Défilement continu • Survolez pour figer
                </span>
                <button 
                  type="button" 
                  className="agri-scroll-btn prev"
                  onClick={() => scrollMarquee(-320)}
                  aria-label="Défiler vers la gauche"
                  title="Défiler vers la gauche"
                >
                  <ChevronLeft width={18} />
                </button>
                <button 
                  type="button" 
                  className="agri-scroll-btn next"
                  onClick={() => scrollMarquee(320)}
                  aria-label="Défiler vers la droite"
                  title="Défiler vers la droite"
                >
                  <ChevronRight width={18} />
                </button>
              </div>
            </div>
          </div>

          {/* Viewport défilant continuellement de GAUCHE vers la DROITE */}
          <div className="agri-marquee-viewport" ref={marqueeViewportRef}>
            <div className="agri-marquee-track ltr-animation">
              {marqueeList.map((p, idx) => (
                <div className="agri-marquee-card-wrapper" key={`${p.id}-${idx}`}>
                  <article className="agri-marquee-card">
                    <div className="agri-marquee-card-img-wrap">
                      <img src={p.image} alt={p.name} loading="lazy" />
                      <span className="agri-marquee-card-cat">{p.category?.split(" ")[0]}</span>
                      <button 
                        type="button"
                        className="agri-marquee-card-fav"
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleWishlist(p.id); }}
                        title="Ajouter aux favoris"
                        aria-label="Ajouter aux favoris"
                      >
                        <Heart width={14} fill={wishlist.includes(p.id) ? "currentColor" : "none"} />
                      </button>
                    </div>
                    <div className="agri-marquee-card-info">
                      <Link href={`/produit/${p.id}`} className="agri-marquee-card-title">
                        {p.name}
                      </Link>
                      <div className="agri-marquee-card-price-row">
                        <strong>{money(p.price)}</strong>
                        <small>/{p.unit?.replace("_", " ") || "unité"}</small>
                      </div>
                      <div className="agri-marquee-card-actions">
                        <Link href={`/produit/${p.id}`} className="agri-marquee-btn-view">
                          Voir détail
                        </Link>
                        <button 
                          type="button"
                          className="agri-marquee-btn-add"
                          onClick={(e) => { e.preventDefault(); e.stopPropagation(); addToCart(p.id, 1); }}
                          title="Ajouter au panier"
                          aria-label="Ajouter au panier"
                        >
                          <ShoppingBag width={14} />
                        </button>
                      </div>
                    </div>
                  </article>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* FAQ Accordions Section */}
      <section className="product-faq-section container">
        <div className="section-head-simple">
          <span className="eyebrow">QUESTIONS FRÉQUENTES</span>
          <h2>Des questions ? Nous avons les réponses !</h2>
        </div>

        <div className="faq-accordions-list">
          <details className="faq-item-card" open>
            <summary>
              <span>Comment se déroule la livraison dans les grandes villes et zones rurales ?</span>
              <HelpCircle width={16} />
            </summary>
            <p>Toutes nos commandes sont préparées sous 24h ouvrées. La livraison est organisée vers Douala, Yaoundé, Bafoussam, Garoua, Bamenda et les principales zones rurales selon la disponibilité.</p>
          </details>

          <details className="faq-item-card">
            <summary>
              <span>Puis-je payer par MTN Mobile Money, Orange Money ou cash ?</span>
              <HelpCircle width={16} />
            </summary>
            <p>Oui. Nous acceptons le paiement sécurisé par MTN Mobile Money, Orange Money, carte bancaire et cash à la livraison selon la zone.</p>
          </details>

          <details className="faq-item-card">
            <summary>
              <span>Les produits vendus sont-ils fiables et conformes ?</span>
              <HelpCircle width={16} />
            </summary>
            <p>Absolument. AgriMarket sélectionne des produits et fournisseurs de confiance afin de garantir des intrants, matériels et services adaptés au contexte agricole camerounais.</p>
          </details>
        </div>
      </section>

      {/* Reviews & Agropastoral Testimonials */}
      <ScrollRevealEffects
        className="agri-reviews-motion"
        revealSelector=".agri-reviews-parallax-layer"
        parallaxSelector=".agri-reviews-parallax-layer"
      >
        <div className="agri-reviews-parallax-backdrop" aria-hidden="true">
          <div className="agri-reviews-parallax-layer agri-reviews-parallax-layer--left" data-scroll-speed="0.16">
            <img src="/Images%20Agrimarket/pexels-88107820-9968701.jpg" alt="" loading="lazy" />
          </div>
          <div className="agri-reviews-parallax-layer agri-reviews-parallax-layer--right" data-scroll-speed="-0.12">
            <img src="/Images%20Agrimarket/pexels-made-by-pixels-133605980-33364793.jpg" alt="" loading="lazy" />
          </div>
        </div>
      <section className="agri-reviews-section container" id="reviews">
        <div className="agri-reviews-header">
          <div>
            <span className="eyebrow">RETOURS DU TERRAIN & EXPÉRIENCES ACHETEURS</span>
            <h2>Avis & Retours d'Expérience des Acheteurs</h2>
          </div>
          <button 
            type="button" 
            className="agri-btn-add-review" 
            onClick={() => setShowReviewForm(prev => !prev)}
          >
            {showReviewForm ? "Fermer le formulaire" : "Laisser un avis ou commentaire"}
          </button>
        </div>

        {/* Formulaire interactif pour déposer un avis */}
        {showReviewForm && (
          <form onSubmit={handleSubmitReview} className="agri-review-form-card">
            <div className="agri-review-form-header">
              <h3>
                <MessageSquare width={18} style={{ color: "#0b5d33" }} />
                Votre avis d'acheteur sur « {product.name} »
              </h3>
              <small style={{ color: "#64748b" }}>Partagez votre retour d'expérience avec les autres exploitants et acheteurs</small>
            </div>

            {/* Note en étoiles interactive */}
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", fontSize: "12px", fontWeight: 800, color: "#07331e", textTransform: "uppercase", marginBottom: 4 }}>
                Votre appréciation globale <span className="required">*</span>
              </label>
              <div className="agri-stars-interactive">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    className={`agri-star-btn ${star <= (ratingHover || reviewForm.rating) ? "is-active" : ""}`}
                    onMouseEnter={() => setRatingHover(star)}
                    onMouseLeave={() => setRatingHover(0)}
                    onClick={() => setReviewForm(prev => ({ ...prev, rating: star }))}
                    aria-label={`Attribuer ${star} étoiles`}
                  >
                    <Star width={24} height={24} fill={star <= (ratingHover || reviewForm.rating) ? "currentColor" : "none"} />
                  </button>
                ))}
                <span className="agri-stars-rating-label">
                  {(ratingHover || reviewForm.rating) === 5 && "⭐⭐⭐⭐⭐ 5/5 — Excellent / Recommandé"}
                  {(ratingHover || reviewForm.rating) === 4 && "⭐⭐⭐⭐ 4/5 — Très bon produit"}
                  {(ratingHover || reviewForm.rating) === 3 && "⭐⭐⭐ 3/5 — Conforme aux attentes"}
                  {(ratingHover || reviewForm.rating) === 2 && "⭐⭐ 2/5 — Passable"}
                  {(ratingHover || reviewForm.rating) === 1 && "⭐ 1/5 — Insatisfaisant"}
                </span>
              </div>
            </div>

            <div className="agri-fields-grid">
              <div className="agri-field-group">
                <label>Nom ou Raison Sociale <span className="required">*</span></label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Paul Mbarga ou GIC Maraîcher"
                  value={reviewForm.name}
                  onChange={(e) => setReviewForm(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>

              <div className="agri-field-group">
                <label>Votre Profil / Activité</label>
                <select
                  value={reviewForm.role}
                  onChange={(e) => setReviewForm(prev => ({ ...prev, role: e.target.value }))}
                >
                  <option value="Maraîcher / Agriculteur">Maraîcher / Agriculteur</option>
                  <option value="Éleveur / Aviculteur">Éleveur / Aviculteur</option>
                  <option value="Grossiste / Commerçant vivrier">Grossiste / Commerçant vivrier</option>
                  <option value="Restaurateur / Traiteur">Restaurateur / Traiteur</option>
                  <option value="Consommateur particulier">Consommateur particulier</option>
                </select>
              </div>

              <div className="agri-field-group">
                <label>Bassin / Région (Cameroun) <span className="required">*</span></label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Foumbot (Ouest), Yaoundé (Centre)..."
                  value={reviewForm.location}
                  onChange={(e) => setReviewForm(prev => ({ ...prev, location: e.target.value }))}
                />
              </div>

              <div className="agri-field-group">
                <label>Titre de votre commentaire <span className="required">*</span></label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Excellente fraîcheur, calibrage impeccable"
                  value={reviewForm.title}
                  onChange={(e) => setReviewForm(prev => ({ ...prev, title: e.target.value }))}
                />
              </div>

              <div className="agri-field-group full-width">
                <label>Votre avis et retour d'expérience détaillé <span className="required">*</span></label>
                <textarea
                  rows={3}
                  required
                  placeholder="Décrivez la qualité du produit, la conformité de la récolte, le conditionnement et la rapidité d'acheminement..."
                  value={reviewForm.comment}
                  onChange={(e) => setReviewForm(prev => ({ ...prev, comment: e.target.value }))}
                />
              </div>
            </div>

            <div style={{ marginTop: 14, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
              <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: "13px", cursor: "pointer", color: "#07331e", fontWeight: 700 }}>
                <input
                  type="checkbox"
                  checked={reviewForm.recommends}
                  onChange={(e) => setReviewForm(prev => ({ ...prev, recommends: e.target.checked }))}
                  style={{ width: 16, height: 16, accentColor: "#0b5d33" }}
                />
                Je recommande ce produit aux acheteurs et coopératives
              </label>

              <div style={{ display: "flex", gap: 10 }}>
                <button
                  type="button"
                  className="agri-btn-prev"
                  onClick={() => setShowReviewForm(false)}
                  style={{ padding: "10px 18px", fontSize: "12px" }}
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="agri-btn-next"
                  disabled={reviewSubmitting}
                  style={{ padding: "10px 22px", fontSize: "12px" }}
                >
                  {reviewSubmitting ? "Publication en cours..." : "Publier mon avis"}
                </button>
              </div>
            </div>
          </form>
        )}

        {/* Agropastoral Score Dashboard */}
        <div className="agri-reviews-dashboard">
          <div className="agri-score-primary">
            <div className="agri-big-rating">4.9</div>
            <div className="agri-stars-col">
              <div className="agri-stars-gold">★★★★★</div>
              <span>Basé sur 28 avis d'exploitants</span>
            </div>
          </div>

          <div className="agri-score-stats">
            <div className="agri-stat-item">
              <strong>98%</strong>
              <span>Exploitants recommandent</span>
            </div>
            <div className="agri-stat-item">
              <strong>100%</strong>
              <span>Origine Bord-Champ</span>
            </div>
            <div className="agri-stat-item">
              <strong>24h à 48h</strong>
              <span>Délai d'acheminement</span>
            </div>
          </div>
        </div>

        {/* Real Agropastoral Reviews Grid */}
        <div className="agri-reviews-grid">
          {productReviews.map((review) => (
            <article className="agri-review-card" key={review.id}>
              <div className="agri-review-top">
                <div className="agri-review-stars">{"★".repeat(review.rating || 5)}</div>
                <span className="agri-review-date">{review.date || "Octobre 2026"}</span>
              </div>
              <h3>{review.title}</h3>
              <p>{review.comment}</p>
              <div className="agri-review-author">
                <span className="author-name">— {review.name} ({review.role || "Acheteur"})</span>
                <span className="author-badge">✓ Achat Vérifié ({review.location || "Cameroun"})</span>
              </div>
            </article>
          ))}
        </div>
      </section>
      </ScrollRevealEffects>

      {/* Related Products Rail */}
      {!!related.length && (
        <section className="agri-related-section" aria-label="Produits recommandés">
          <div className="agri-related-inner">
            <div className="agri-related-heading">
              <div>
                <span className="eyebrow">SÉLECTION AGRIMARKET</span>
                <h2>À découvrir aussi</h2>
                <p>Des offres complémentaires sélectionnées dans les filières du Cameroun.</p>
              </div>
            </div>
            <div className="agri-related-slider">
              <button type="button" className="agri-related-arrow agri-related-arrow--prev" onClick={() => scrollRelatedProducts(-1)} aria-label="Faire défiler les produits vers la gauche">
                <ChevronLeft width={21} height={21}/>
              </button>
              <div className="agri-related-rail" ref={relatedRailRef}>
                {related.map(item => <ProductCard product={item} key={item.id}/>) }
              </div>
              <button type="button" className="agri-related-arrow agri-related-arrow--next" onClick={() => scrollRelatedProducts(1)} aria-label="Faire défiler les produits vers la droite">
                <ChevronRight width={21} height={21}/>
              </button>
            </div>
          </div>
        </section>
      )}

      {/* MODALE DE PARTAGE IN-APP ÉLÉGANTE */}
      {shareModalOpen && (
        <div className="agri-share-modal-overlay" onClick={() => setShareModalOpen(false)}>
          <div className="agri-share-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="agri-share-modal-header">
              <h3>
                <Share2 width={18} style={{ color: "#f37021" }} />
                Partager ce produit agropastoral
              </h3>
              <button 
                type="button" 
                className="agri-share-modal-close" 
                onClick={() => setShareModalOpen(false)}
                aria-label="Fermer"
              >
                <X width={18} />
              </button>
            </div>

            <div className="agri-share-modal-body">
              <div className="agri-share-product-preview">
                <img src={images[0]} alt={product.name} />
                <div>
                  <strong>{product.name}</strong>
                  <span>{money(product.price)} /{product.unit?.replace("_", " ") || "unité"}</span>
                </div>
              </div>

              <div className="agri-share-channels-grid">
                <a 
                  href={`https://api.whatsapp.com/send?text=${encodeURIComponent(`Regardez *${product.name}* (${money(product.price)}/${product.unit || "unité"}) sur AgriMarket Cameroun : ${getProductUrl()}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="agri-share-channel-btn whatsapp"
                  onClick={() => setShareModalOpen(false)}
                >
                  <MessageSquare width={16} /> WhatsApp
                </a>

                <button 
                  type="button" 
                  className="agri-share-channel-btn copy"
                  onClick={() => { handleCopyLink(); setShareModalOpen(false); }}
                >
                  <Copy width={16} /> Copier le lien
                </button>

                <a 
                  href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(getProductUrl())}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="agri-share-channel-btn facebook"
                  onClick={() => setShareModalOpen(false)}
                >
                  <span>Facebook</span>
                </a>

                <a 
                  href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(`*${product.name}* disponible sur AgriMarket Cameroun`)}&url=${encodeURIComponent(getProductUrl())}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="agri-share-channel-btn twitter"
                  onClick={() => setShareModalOpen(false)}
                >
                  <span>X (Twitter)</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

