"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { 
  ArrowRight, 
  CheckCircle2, 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  Compass, 
  Flame, 
  Headphones, 
  MapPin, 
  Package, 
  Search, 
  ShieldCheck, 
  Sparkles, 
  Tractor, 
  Truck, 
  Users 
} from "lucide-react";
import { ProductCard } from "@/composants/ProductCard";
import { useStore } from "@/lib/store";

const heroVideo = "/Videos%20Agrimarket/16464963_1920_1080_50fps.mp4";

// Slides promotionnelles pour la carte droite du Hero
const heroPromoSlides = [
  {
    tag: "Matériel & Équipements",
    title: "Tracteurs et machines agricoles",
    description: "Équipez votre exploitation avec du matériel certifié, révisé et garanti par nos concessionnaires partenaires.",
    image: "/Images%20Agrimarket/pexels-jakubzerdzicki-28100001.jpg",
    link: "/materiel"
  },
  {
    tag: "Semences Certifiées",
    title: "Semences hybrides & plants greffés",
    description: "Multipliez vos rendements grâce aux variétés améliorées de maïs, soja et rejets PIF sélectionnés.",
    image: "/Images%20Agrimarket/pexels-nasiru-othman-447186959-36757340.jpg",
    link: "/semences"
  },
  {
    tag: "Élevage & Nutrition",
    title: "Volailles, bétail & provendes",
    description: "Approvisionnement direct auprès des fermes et provenderies des bassins de production de l'Ouest et du Sud.",
    image: "/Images%20Agrimarket/pexels-the-northern-lense-2148554063-31120512.jpg",
    link: "/elevage"
  }
];

// 5 Tuiles du bandeau horizontal sous le hero
const horizontalCategories = [
  {
    title: "Agriculture",
    subtitle: "Vivriers & Récoltes",
    image: "/Images%20Agrimarket/pexels-jakubzerdzicki-28100001.jpg",
    link: "/vivriers"
  },
  {
    title: "Élevage",
    subtitle: "Bétail & Nutrition",
    image: "/Images%20Agrimarket/pexels-the-northern-lense-2148554063-31120512.jpg",
    link: "/elevage"
  },
  {
    title: "Pêche & Aquaculture",
    subtitle: "Alevins & Frais",
    image: "/Images%20Agrimarket/pexels-arnaud-vigne-36746332-7164535.jpg",
    link: "/catalogue?q=poisson"
  },
  {
    title: "Intrants",
    subtitle: "Engrais & Produits",
    image: "/Images%20Agrimarket/pexels-nasiru-othman-447186959-36757340.jpg",
    link: "/intrants"
  },
  {
    title: "Équipements",
    subtitle: "Tracteurs & Outils",
    image: "/Images%20Agrimarket/pexels-jakubzerdzicki-28100001.jpg",
    link: "/materiel"
  }
];

// Filières Stratégiques
const strategicFilieres = [
  {
    category: "FILIÈRE VIVRIÈRE & MARAÎCHÈRE",
    title: "Manioc, Maïs sec, Plantain & Tomates",
    description: "Les grands bassins de Foumbot, Obala et Loum livrés directement en ville pour marchés, cantines et ménages.",
    image: "/Images%20Agrimarket/pexels-jakubzerdzicki-28100001.jpg",
    link: "/vivriers"
  },
  {
    category: "FILIÈRE AVICOLE & ÉLEVAGE",
    title: "Poulets fermiers, Pondeuses & Provende",
    description: "Sécurité sanitaire, poussins d’un jour et nutrition équilibrée en direct des fermes des Hauts Plateaux.",
    image: "/Images%20Agrimarket/pexels-the-northern-lense-2148554063-31120512.jpg",
    link: "/elevage"
  },
  {
    category: "FILIÈRE MÉCANISATION & INTRANTS",
    title: "Motopompes solaires, Engrais NPK & Tracteurs",
    description: "Équipements fiables et fertilisants certifiés pour accroître vos rendements sans rupture d'activité.",
    image: "/Images%20Agrimarket/pexels-arnaud-vigne-36746332-7164535.jpg",
    link: "/materiel"
  }
];

// Coopératives vedettes
const featuredCooperatives = [
  {
    name: "Coopérative Maraîchère de Foumbot",
    region: "Ouest (Noun)",
    badge: "Coopérative Agréée",
    speciality: "Tomates, Piments, Poivrons & Légumes frais",
    productsCount: 18,
    link: "/catalogue?filter=coops"
  },
  {
    name: "GIC Vivrier d'Obala & Lekié",
    region: "Centre (Lekié)",
    badge: "Producteur Vérifié",
    speciality: "Manioc de table, Plantain gros michel, Bâtons de manioc",
    productsCount: 14,
    link: "/catalogue?filter=coops"
  },
  {
    name: "Coopérative des Planteurs du Moungo",
    region: "Littoral (Moungo)",
    badge: "Coopérative Certifiée",
    speciality: "Poivre blanc de Penja IGP, Bananes douces, Café",
    productsCount: 12,
    link: "/catalogue?filter=coops"
  },
  {
    name: "Ferme Avicole des Bamboutos",
    region: "Ouest (Mbouda / Bafoussam)",
    badge: "Éleveur Agréé",
    speciality: "Poulets de chair, Aliments provende, Œufs calibrés",
    productsCount: 9,
    link: "/catalogue?filter=coops"
  }
];

// Articles conseils
const adviceArticles = [
  {
    title: "Calendrier agricole Cameroun : Réussir la campagne maïs 2026",
    category: "Agronomie Pratique",
    date: "Mars 2026",
    readTime: "4 min",
    excerpt: "Les dates optimales de semis, le choix des semences hybrides certifiées et la gestion de la fertilisation de fond.",
    image: "/Images%20Agrimarket/pexels-nasiru-othman-447186959-36757340.jpg",
    link: "/blog/post-1"
  },
  {
    title: "Fiche technique : Alimentation optimale du poulet de chair",
    category: "Élevage & Provende",
    date: "Février 2026",
    readTime: "5 min",
    excerpt: "Comment équilibrer la ration démarrage et finition pour atteindre un poids vif de 2,2 kg en 42 jours sans surmortalité.",
    image: "/Images%20Agrimarket/pexels-the-northern-lense-2148554063-31120512.jpg",
    link: "/blog/post-2"
  },
  {
    title: "Irrigation solaire : Doubler ses récoltes maraîchères en saison sèche",
    category: "Mécanisation & Eau",
    date: "Janvier 2026",
    readTime: "6 min",
    excerpt: "Guide d'installation d'une motopompe solaire immergée pour arroser 2 hectares de tomates sans dépenser en carburant.",
    image: "/Images%20Agrimarket/pexels-jakubzerdzicki-28100001.jpg",
    link: "/blog/post-3"
  }
];

export default function HomePage() {
  const router = useRouter();
  const { products } = useStore();
  const [heroSearch, setHeroSearch] = useState("");
  const [heroRegion, setHeroRegion] = useState("Tout le Cameroun");
  const [promoSlideIndex, setPromoSlideIndex] = useState(0);
  const [activeCategoryTab, setActiveCategoryTab] = useState("all");

  const currentPromoSlide = heroPromoSlides[promoSlideIndex];

  const handleHeroSearch = (e) => {
    e.preventDefault();
    const query = heroSearch.trim();
    if (query) {
      router.push(`/catalogue?q=${encodeURIComponent(query)}&region=${encodeURIComponent(heroRegion)}`);
    } else if (heroRegion !== "Tout le Cameroun") {
      router.push(`/catalogue?region=${encodeURIComponent(heroRegion)}`);
    } else {
      router.push("/catalogue");
    }
  };

  // Filtrer les produits phares selon l'onglet actif
  const filteredProducts = products.filter((p) => {
    if (activeCategoryTab === "all") return true;
    if (activeCategoryTab === "vivriers") return p.category === "Produits vivriers et agricoles";
    if (activeCategoryTab === "elevage") return p.category === "Élevage et produits animaux";
    if (activeCategoryTab === "semences") return p.category === "Semences, plants et pépinières";
    if (activeCategoryTab === "intrants") return p.category === "Intrants agricoles";
    if (activeCategoryTab === "materiel") return p.category === "Matériel et équipements";
    if (activeCategoryTab === "transformes") return p.category === "Produits transformés";
    return true;
  }).slice(0, 8);

  return (
    <div className="agrimarket-homepage">
      {/* ======================================================================
          HERO SECTION PREMIUM : VIDÉO EN ARRIÈRE-PLAN + DISPOSITION MAQUETTE
          ====================================================================== */}
      <section className="agri-hero-wrapper" aria-label="Bannière d'accueil AgriMarket">
        {/* Vidéo existante conservée impérativement */}
        <video
          className="agri-hero-video"
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          poster="/Images%20Agrimarket/pexels-jakubzerdzicki-28100001.jpg"
        >
          <source src={heroVideo} type="video/mp4" />
        </video>

        {/* Dégradé sombre vert forêt assurant une parfaite lisibilité */}
        <div className="agri-hero-overlay" />

        <div className="agri-hero-container">
          {/* Colonne Gauche : Titre percutant, accroche terroir et recherche rectangulaire */}
          <div className="agri-hero-left">
            <div className="agri-hero-pill">
              <span>🌱</span>
              <span>La marketplace agropastorale du Cameroun</span>
            </div>

            <h1 className="agri-hero-title">
              Tout votre univers <span className="highlight-lime">agropastoral,</span> réuni au même endroit.
            </h1>

            <p className="agri-hero-subtitle">
              Achetez et vendez directement vos récoltes, semences, intrants, bétail et machines au meilleur prix garanti à travers tout le Cameroun.
            </p>

            {/* Barre de Recherche Rectangulaire Blanche type Maquette */}
            <form onSubmit={handleHeroSearch} className="agri-hero-search-box">
              <div className="agri-search-input-wrap">
                <Search width={18} height={18} />
                <input
                  type="text"
                  placeholder="Que recherchez-vous ? (ex: maïs, poulet, NPK, tracteur...)"
                  value={heroSearch}
                  onChange={(e) => setHeroSearch(e.target.value)}
                  aria-label="Rechercher un produit agricole"
                />
              </div>

              <div className="agri-search-divider" />

              <div className="agri-search-region-wrap">
                <MapPin width={16} height={16} />
                <select
                  value={heroRegion}
                  onChange={(e) => setHeroRegion(e.target.value)}
                  aria-label="Sélectionner une région"
                >
                  <option value="Tout le Cameroun">📍 Tout le Cameroun</option>
                  <option value="Centre">Centre (Yaoundé)</option>
                  <option value="Littoral">Littoral (Douala)</option>
                  <option value="Ouest">Ouest (Bafoussam)</option>
                  <option value="Nord">Nord (Garoua)</option>
                  <option value="Est">Est (Bertoua)</option>
                  <option value="Nord-Ouest">Nord-Ouest (Bamenda)</option>
                  <option value="Sud">Sud (Ebolowa)</option>
                  <option value="Extrême-Nord">Extrême-Nord (Maroua)</option>
                  <option value="Sud-Ouest">Sud-Ouest (Buéa)</option>
                  <option value="Adamaoua">Adamaoua (Ngaoundéré)</option>
                </select>
              </div>

              <button type="submit" className="agri-search-submit-btn">
                <span>Rechercher</span>
                <ArrowRight width={16} height={16} />
              </button>
            </form>

            {/* Mots-clés rapides populaires */}
            <div style={{ marginTop: "14px", display: "flex", flexWrap: "wrap", alignItems: "center", gap: "8px", fontSize: "12px", color: "#e2e8f0" }}>
              <span style={{ color: "var(--agri-lime)", fontWeight: 700 }}>Populaire :</span>
              <Link href="/catalogue?q=tomate" style={{ color: "#fff", textDecoration: "underline" }}>Tomates Foumbot</Link>
              <span style={{ opacity: 0.5 }}>•</span>
              <Link href="/catalogue?q=poulet" style={{ color: "#fff", textDecoration: "underline" }}>Poulet fermier</Link>
              <span style={{ opacity: 0.5 }}>•</span>
              <Link href="/catalogue?q=mais" style={{ color: "#fff", textDecoration: "underline" }}>Maïs sec</Link>
              <span style={{ opacity: 0.5 }}>•</span>
              <Link href="/catalogue?q=npk" style={{ color: "#fff", textDecoration: "underline" }}>Engrais NPK</Link>
              <span style={{ opacity: 0.5 }}>•</span>
              <Link href="/catalogue?q=motopompe" style={{ color: "#fff", textDecoration: "underline" }}>Motopompe</Link>
            </div>
          </div>

          {/* Colonne Droite : Carte Promo Rectangulaire Vert Forêt & Orange type Maquette */}
          <div className="agri-hero-right">
            <div className="agri-promo-card-mockup">
              <div className="agri-promo-card-media">
                <img src={currentPromoSlide.image} alt={currentPromoSlide.title} />
                <span className="agri-promo-badge">{currentPromoSlide.tag}</span>
              </div>

              <div className="agri-promo-card-body">
                <h3>{currentPromoSlide.title}</h3>
                <p>{currentPromoSlide.description}</p>
                <Link href={currentPromoSlide.link} className="agri-promo-btn">
                  <span>Découvrir</span>
                  <ArrowRight width={15} height={15} />
                </Link>
              </div>

              {/* Slider Dots */}
              <div className="agri-promo-slider-dots">
                <button
                  type="button"
                  className="agri-slider-arrow"
                  onClick={() => setPromoSlideIndex((promoSlideIndex - 1 + heroPromoSlides.length) % heroPromoSlides.length)}
                  aria-label="Slide précédente"
                >
                  <ChevronLeft width={16} height={16} />
                </button>

                {heroPromoSlides.map((_, idx) => (
                  <button
                    key={idx}
                    type="button"
                    className={`agri-slider-dot ${promoSlideIndex === idx ? "active" : ""}`}
                    onClick={() => setPromoSlideIndex(idx)}
                    aria-label={`Slide ${idx + 1}`}
                  />
                ))}

                <button
                  type="button"
                  className="agri-slider-arrow"
                  onClick={() => setPromoSlideIndex((promoSlideIndex + 1) % heroPromoSlides.length)}
                  aria-label="Slide suivante"
                >
                  <ChevronRight width={16} height={16} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================================
          BANDEAU HORIZONTAL DES CATÉGORIES & ENCART PRODUCTEUR TYPE MAQUETTE
          ====================================================================== */}
      <section className="agri-cat-strip-section" aria-label="Catégories principales et adhésion vendeur">
        <div className="agri-cat-strip-container">
          {/* Grille de 5 tuiles rectangulaires */}
          <div className="agri-cat-tiles-grid">
            {horizontalCategories.map((cat) => (
              <Link key={cat.title} href={cat.link} className="agri-cat-tile">
                <img src={cat.image} alt={cat.title} className="agri-cat-thumb" />
                <div className="agri-cat-tile-info">
                  <strong>{cat.title}</strong>
                  <span>{cat.subtitle} →</span>
                </div>
              </Link>
            ))}
          </div>

          {/* Encart "Vous êtes producteur ?" */}
          <div className="agri-seller-banner-card">
            <div className="agri-seller-banner-text">
              <h4>🌱 Vous êtes producteur ?</h4>
              <p>Vendez vos récoltes, bétail et semences directement sans intermédiaire aux acheteurs de tout le pays.</p>
              <Link href="/demande-produit" className="agri-seller-btn">
                <span>Devenir vendeur</span>
                <ArrowRight width={12} height={12} />
              </Link>
            </div>
            <img
              src="/Images%20Agrimarket/pexels-nasiru-othman-447186959-36757340.jpg"
              alt="Agriculteur Camerounais"
              className="agri-seller-banner-photo"
            />
          </div>
        </div>
      </section>

      {/* ======================================================================
          BANDEAU DE RÉASSURANCE VERT FORÊT TYPE MAQUETTE (4 COLONNES)
          ====================================================================== */}
      <section className="agri-reassurance-bar" aria-label="Engagements de confiance AgriMarket">
        <div className="agri-reassurance-container">
          <div className="agri-reassurance-col">
            <div className="agri-reassurance-icon">
              <ShieldCheck width={22} height={22} />
            </div>
            <div className="agri-reassurance-text">
              <strong>Produits authentiques</strong>
              <p>Du champ ou de l’élevage certifié, traçabilité garantie</p>
            </div>
          </div>

          <div className="agri-reassurance-col">
            <div className="agri-reassurance-icon">
              <Truck width={22} height={22} />
            </div>
            <div className="agri-reassurance-text">
              <strong>Livraison au Cameroun</strong>
              <p>Acheminement sécurisé dans les 10 régions du pays</p>
            </div>
          </div>

          <div className="agri-reassurance-col">
            <div className="agri-reassurance-icon">
              <CheckCircle2 width={22} height={22} />
            </div>
            <div className="agri-reassurance-text">
              <strong>Vendeurs vérifiés</strong>
              <p>Coopératives et producteurs agréés par nos soins</p>
            </div>
          </div>

          <div className="agri-reassurance-col">
            <div className="agri-reassurance-icon">
              <Headphones width={22} height={22} />
            </div>
            <div className="agri-reassurance-text">
              <strong>Assistance dédiée</strong>
              <p>Support WhatsApp & appel 7j/7 pour vos commandes</p>
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================================
          PRODUITS PHARES & OFFRES DU MOMENT (RECTANGULAIRE, BOUTONS CARRÉS)
          ====================================================================== */}
      <section className="agri-products-section">
        <div className="container" style={{ maxWidth: "1540px", margin: "0 auto", padding: "0 24px" }}>
          <div className="agri-section-head">
            <div>
              <h2>Offres du Moment & Récoltes Fraîches</h2>
              <p>Directement disponibles auprès de nos coopératives partenaires et producteurs locaux certifiés.</p>
            </div>
            <Link href="/catalogue" className="agri-see-all-link">
              <span>Voir tout le catalogue ({products.length} offres)</span>
              <ArrowRight width={14} height={14} />
            </Link>
          </div>

          {/* Onglets Filtres Rectangulaires */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "26px" }}>
            {[
              { id: "all", label: "Toutes les offres" },
              { id: "vivriers", label: "🌾 Vivriers & Récoltes" },
              { id: "elevage", label: "🐔 Élevage & Nutrition" },
              { id: "semences", label: "🌱 Semences" },
              { id: "intrants", label: "🧪 Intrants & Engrais" },
              { id: "materiel", label: "🚜 Matériel Agricole" },
              { id: "transformes", label: "🥫 Transformés" },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveCategoryTab(tab.id)}
                style={{
                  background: activeCategoryTab === tab.id ? "var(--agri-green)" : "#ffffff",
                  color: activeCategoryTab === tab.id ? "#ffffff" : "#374151",
                  border: activeCategoryTab === tab.id ? "1.5px solid var(--agri-green)" : "1px solid #e5e7eb",
                  borderRadius: "0",
                  padding: "8px 16px",
                  fontSize: "13px",
                  fontWeight: 600,
                  cursor: "pointer",
                  transition: "all 0.15s"
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Grille Produits */}
          <div className="agri-product-grid">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* ======================================================================
          GRILLE DES FILIÈRES STRATÉGIQUES DU CAMEROUN
          ====================================================================== */}
      <section style={{ padding: "60px 0", background: "#ffffff", borderTop: "1px solid #e5e7eb", borderBottom: "1px solid #e5e7eb" }}>
        <div className="container" style={{ maxWidth: "1540px", margin: "0 auto", padding: "0 24px" }}>
          <div className="agri-section-head">
            <div>
              <h2>Filières Stratégiques du Bassin Agro-écologique</h2>
              <p>Des chaînes de valeur organisées pour fluidifier l’approvisionnement et valoriser les terroirs camerounais.</p>
            </div>
            <Link href="/catalogue" className="agri-see-all-link">
              <span>Explorer les filières</span>
              <ArrowRight width={14} height={14} />
            </Link>
          </div>

          <div className="agri-filieres-grid">
            {strategicFilieres.map((filiere) => (
              <Link key={filiere.title} href={filiere.link} className="agri-filiere-card">
                <img src={filiere.image} alt={filiere.title} />
                <div className="agri-filiere-overlay">
                  <span>{filiere.category}</span>
                  <h3>{filiere.title}</h3>
                  <p>{filiere.description}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ======================================================================
          COOPÉRATIVES & PRODUCTEURS VEDETTES DU CAMEROUN
          ====================================================================== */}
      <section style={{ padding: "60px 0", background: "#fbfbf9" }}>
        <div className="container" style={{ maxWidth: "1540px", margin: "0 auto", padding: "0 24px" }}>
          <div className="agri-section-head">
            <div>
              <h2>Coopératives & Vendeurs Vedettes</h2>
              <p>Achetez en toute confiance auprès de structures agricoles enregistrées et vérifiées sur le terrain.</p>
            </div>
            <Link href="/catalogue?filter=coops" className="agri-see-all-link">
              <span>Voir toutes les coopératives</span>
              <ArrowRight width={14} height={14} />
            </Link>
          </div>

          <div className="agri-coops-grid">
            {featuredCooperatives.map((coop) => (
              <Link key={coop.name} href={coop.link} className="agri-coop-card">
                <div className="agri-coop-head">
                  <div className="agri-coop-avatar">🏢</div>
                  <div className="agri-coop-title">
                    <strong>{coop.name}</strong>
                    <span>📍 {coop.region}</span>
                  </div>
                </div>
                <div style={{ marginBottom: "10px" }}>
                  <span style={{ background: "#f0f7f2", color: "var(--agri-green)", fontSize: "11px", fontWeight: 700, padding: "3px 8px" }}>
                    ✓ {coop.badge}
                  </span>
                </div>
                <p className="agri-coop-desc">{coop.speciality}</p>
                <div className="agri-coop-footer">
                  <span>{coop.productsCount} offres actives</span>
                  <span>Voir le catalogue →</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ======================================================================
          DOUBLE BANNIÈRE D'APPEL À L'ACTION : ACHETEUR PROFESSIONNEL & VENDEUR
          ====================================================================== */}
      <section style={{ padding: "50px 0", background: "#ffffff" }}>
        <div className="container" style={{ maxWidth: "1540px", margin: "0 auto", padding: "0 24px" }}>
          <div className="agri-cta-double-container">
            {/* Boîte Acheteur */}
            <div className="agri-cta-banner-box buyer">
              <span>ACHETEURS DE GROS & COMMERÇANTS</span>
              <h3>Vous approvisionnez un restaurant, hôtel ou usine ?</h3>
              <p>Bénéficiez de tarifs préférentiels, de volumes garantis et d'une logistique sécurisée depuis les bassins de production.</p>
              <Link href="/catalogue?mode=wholesale" className="agri-cta-btn-orange">
                <span>Accéder aux offres de gros</span>
                <ArrowRight width={15} height={15} />
              </Link>
            </div>

            {/* Boîte Vendeur */}
            <div className="agri-cta-banner-box seller">
              <span>PRODUCTEURS, ÉLEVEURS & DISTRIBUTEURS</span>
              <h3>Développez vos ventes avec AgriMarket Cameroun</h3>
              <p>Rejoignez plus de 12 000 acteurs de la filière et vendez vos récoltes, animaux et intrants aux meilleurs acheteurs sans intermédiaires abusifs.</p>
              <Link href="/demande-produit" className="agri-cta-btn-green">
                <span>Créer mon compte vendeur</span>
                <ArrowRight width={15} height={15} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================================
          CONSEILS PRATIQUES & GUIDES AGRONOMIQUES DU MONDE RURAL
          ====================================================================== */}
      <section style={{ padding: "60px 0 80px", background: "#f8fafc", borderTop: "1px solid #e5e7eb" }}>
        <div className="container" style={{ maxWidth: "1540px", margin: "0 auto", padding: "0 24px" }}>
          <div className="agri-section-head">
            <div>
              <h2>Conseils & Fiches Techniques pour Exploitants</h2>
              <p>Des fiches pratiques rédigées avec nos agronomes pour optimiser la conduite de vos cultures et de vos élevages.</p>
            </div>
            <Link href="/blog" className="agri-see-all-link">
              <span>Consulter tous les guides</span>
              <ArrowRight width={14} height={14} />
            </Link>
          </div>

          <div className="agri-blog-grid">
            {adviceArticles.map((article) => (
              <Link key={article.title} href={article.link} className="agri-blog-card">
                <div className="agri-blog-media">
                  <img src={article.image} alt={article.title} />
                </div>
                <div className="agri-blog-body">
                  <div className="agri-blog-meta">
                    {article.category} • {article.readTime} de lecture
                  </div>
                  <h3>{article.title}</h3>
                  <p>{article.excerpt}</p>
                  <span className="agri-blog-link">
                    <span>Lire la fiche technique</span>
                    <ArrowRight width={13} height={13} />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
