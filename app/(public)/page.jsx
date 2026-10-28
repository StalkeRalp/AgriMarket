"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect, useMemo, useRef } from "react";
import { 
  ArrowRight, 
  Bird,
  BookOpen,
  Boxes,
  Building2,
  Check,
  CheckCircle2, 
  Clock, 
  Compass, 
  FlaskConical,
  Flame, 
  Headphones, 
  MapPin, 
  Package, 
  Search, 
  ShieldCheck, 
  Sparkles, 
  Sprout,
  Tractor, 
  Truck, 
  Users,
  Wheat
} from "lucide-react";
import { ProductCard } from "@/composants/ProductCard";
import { ScrollReveal } from "@/composants/ScrollReveal";
import ScrollRevealEffects from "@/composants/ScrollRevealEffects";
import { useStore } from "@/lib/store";
import { getPublicShops } from "@/lib/shops";

const heroVideo = "/Videos%20Agrimarket/16464963_1920_1080_50fps.mp4";

// 4 Slides commerciales percutantes avec rotation automatique
const heroCommercialSlides = [
  {
    id: 1,
    kicker: "Le marché agropastoral du Cameroun",
    titleBefore: "Les produits agricoles du Cameroun, ",
    titleHighlight: "réunis",
    titleAfter: " au même endroit.",
    description: "Parcourez les offres de produits vivriers, d’élevage, d’intrants et d’équipements. Consultez les détails de chaque annonce et trouvez ce qui répond à votre besoin.",
    tagBadge: "Tout AgriMarket"
  },
  {
    id: 2,
    kicker: "Les récoltes et produits vivriers",
    titleBefore: "Retrouvez les saveurs ",
    titleHighlight: "du terroir",
    titleAfter: " camerounais.",
    description: "Explorez les annonces de fruits, légumes, céréales et autres récoltes, puis choisissez selon la quantité, la localité et les informations publiées par le vendeur.",
    tagBadge: "Produits vivriers"
  },
  {
    id: 3,
    kicker: "Élevage, volailles & nutrition animale",
    titleBefore: "Tout pour accompagner ",
    titleHighlight: "votre élevage",
    titleAfter: ".",
    description: "Découvrez les offres d’animaux, de produits d’élevage et d’aliments disponibles sur la plateforme. Les détails et conditions sont précisés dans chaque annonce.",
    tagBadge: "Élevage"
  },
  {
    id: 4,
    kicker: "Intrants, irrigation & équipements",
    titleBefore: "Les outils et ressources ",
    titleHighlight: "pour vos projets",
    titleAfter: ".",
    description: "Comparez les annonces de semences, d’intrants et de matériel agricole. Filtrez votre recherche par région et contactez le vendeur depuis la fiche produit.",
    tagBadge: "Intrants & matériel"
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
  const { users, products, hydrated } = useStore();
  const featuredCooperatives = useMemo(()=>getPublicShops(users,products)
    .map(shop=>{
      const owner=users.find(user=>String(user.id)===shop.id);
      const organizationLabels={cooperative:"Coopérative AgriMarket",association:"Association agricole",enterprise:"Entreprise agricole",merchant:"Commerçant professionnel"};
      const productNames=shop.products.slice(0,3).map(product=>product.name).filter(Boolean).join(", ");
      const description=owner?.sellerProfile?.description?.trim() || productNames || shop.description;
      return {id:shop.id,name:shop.name,region:[shop.city,shop.region].filter(Boolean).join(" · ") || "Localisation à préciser",badge:organizationLabels[owner?.sellerProfile?.organizationType] || "Vendeur AgriMarket",speciality:description,productsCount:shop.products.length,link:`/boutiques/${encodeURIComponent(shop.id)}`};
    })
    .sort((a,b)=>b.productsCount-a.productsCount || a.name.localeCompare(b.name,"fr"))
    .slice(0,4),[users,products]);
  const cooperativeCards=featuredCooperatives.length ? featuredCooperatives : !hydrated ? Array.from({length:4},(_,index)=>({id:`loading-${index}`,isLoading:true})) : [];
  const [heroSearch, setHeroSearch] = useState("");
  const [heroRegion, setHeroRegion] = useState("Tout le Cameroun");
  const [activeCategoryTab, setActiveCategoryTab] = useState("all");
  const [commercialIndex, setCommercialIndex] = useState(0);

  const filiereVideoRef = useRef(null);
  const filiereSectionRef = useRef(null);

  // Rotation automatique des 4 messages commerciaux toutes les 5.5s
  useEffect(() => {
    const timer = setInterval(() => {
      setCommercialIndex((prev) => (prev + 1) % heroCommercialSlides.length);
    }, 5500);
    return () => clearInterval(timer);
  }, []);

  // Effet Parallaxe fluide au scroll pour la vidéo de transition
  useEffect(() => {
    let ticking = false;
    const handleParallax = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const section = filiereSectionRef.current;
          const video = filiereVideoRef.current;
          if (section && video) {
            const rect = section.getBoundingClientRect();
            const windowHeight = window.innerHeight;
            if (rect.top < windowHeight && rect.bottom > 0) {
              const progress = (windowHeight - rect.top) / (windowHeight + rect.height);
              const yOffset = (progress - 0.5) * 80;
              video.style.transform = `translate3d(0, ${yOffset}px, 0) scale(1.12)`;
            }
          }
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", handleParallax, { passive: true });
    handleParallax();
    return () => window.removeEventListener("scroll", handleParallax);
  }, []);

  const currentCommercial = heroCommercialSlides[commercialIndex];
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
          HERO SECTION PREMIUM : VIDÉO LIMITÉE STRICTEMENT À CETTE ZONE
          ====================================================================== */}
      <section className="agri-hero-wrapper" aria-label="Bannière d'accueil AgriMarket">
        {/* Vidéo de fond limitée exclusivement à la zone Hero / Header */}
        <div className="agri-hero-video-wrap" aria-hidden="true">
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
          <div className="agri-hero-overlay" />
        </div>

        <div className="agri-hero-container">
          {/* Colonne Gauche : 4 Textes Commerciaux rotatifs + Recherche Rectangulaire */}
          <div className="agri-hero-left">
            
            {/* Barre de navigation des 4 messages commerciaux */}
            <div className="agri-commercial-ticker-bar">
              <div className="agri-commercial-slides-nav">
                {heroCommercialSlides.map((slide, idx) => (
                  <button
                    key={slide.id}
                    type="button"
                    className={`agri-commercial-nav-item ${commercialIndex === idx ? "active" : ""}`}
                    onClick={() => setCommercialIndex(idx)}
                    aria-label={`Afficher le message commercial ${idx + 1}`}
                  >
                    <span className="agri-nav-dot" />
                    <span>0{idx + 1}. {slide.tagBadge}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Badge embelli avec dégradé et typographie premium sans emoji */}
            <div className="agri-hero-pill" key={`pill-${commercialIndex}`}>
              <span className="agri-pill-icon-wrap">
                <Sprout width={18} height={18} />
              </span>
              <span className="agri-pill-text">{currentCommercial.kicker}</span>
            </div>

            {/* Titre commercial percutant avec mot clé mis en valeur */}
            <h1 className="agri-hero-title" key={`title-${commercialIndex}`}>
              {currentCommercial.titleBefore}
              <span className="highlight-lime">{currentCommercial.titleHighlight}</span>
              {currentCommercial.titleAfter}
            </h1>

            {/* Accroche commerciale terroir */}
            <p className="agri-hero-subtitle" key={`sub-${commercialIndex}`}>
              {currentCommercial.description}
            </p>

            {/* Barre de recherche principale */}
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
                  <option value="Tout le Cameroun">Tout le Cameroun</option>
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
            <div className="agri-hero-popular">
              <span className="agri-hero-popular-label">Recherches fréquentes</span>
              <Link href="/catalogue?q=tomate">Tomates</Link>
              <Link href="/catalogue?q=poulet">Poulet</Link>
              <Link href="/catalogue?q=mais">Maïs</Link>
              <Link href="/catalogue?q=npk">Engrais</Link>
              <Link href="/catalogue?q=motopompe">Motopompes</Link>
            </div>
          </div>

          {/* Colonne droite : accès directs et filières à explorer */}
          <aside className="agri-hero-right" aria-label="Accès rapides AgriMarket">
            <div className="agri-hero-action-cards">
              <Link href="/catalogue" className="agri-hero-action-card agri-hero-action-card--outline">
                <span className="agri-hero-action-copy">
                  <strong>Parcourir le catalogue</strong>
                  <span>Comparez les offres et trouvez les produits adaptés à vos besoins.</span>
                </span>
                <span className="agri-hero-action-arrow"><ArrowRight width={19} height={19} /></span>
              </Link>
              <Link href="/services" className="agri-hero-action-card agri-hero-action-card--accent">
                <span className="agri-hero-action-copy">
                  <strong>Découvrir nos services</strong>
                  <span>Explorez les solutions disponibles pour vos activités agricoles.</span>
                </span>
                <span className="agri-hero-action-arrow"><ArrowRight width={19} height={19} /></span>
              </Link>
            </div>

            <div className="agri-hero-categories">
              <div className="agri-hero-categories-heading">
                <span>À découvrir</span>
                <strong>Explorez les filières</strong>
              </div>
              <div className="agri-hero-category-bubbles">
                {horizontalCategories.map((category) => (
                  <Link href={category.link} className="agri-hero-category-bubble" key={category.title}>
                    <span className="agri-hero-category-image">
                      <img src={category.image} alt="" />
                    </span>
                    <span>{category.title}</span>
                  </Link>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </section>

      {/* ======================================================================
          BANDEAU HORIZONTAL DES CATÉGORIES & ENCART PRODUCTEUR TYPE MAQUETTE
          ====================================================================== */}
      <ScrollRevealEffects
        className="agri-home-category-motion"
        revealSelector="[data-home-reveal]"
        parallaxSelector="[data-home-parallax]"
      >
      <section className="agri-cat-strip-section" aria-label="Catégories principales et adhésion vendeur">
        <div className="agri-home-scene agri-home-scene--category-left" data-home-reveal>
          <img data-home-parallax data-scroll-speed="0.08" src="/Images%20Agrimarket/pexels-made-by-pixels-133605980-33364793.jpg" alt="" loading="lazy" />
        </div>
        <div className="agri-home-scene agri-home-scene--category-right" data-home-reveal>
          <img data-home-parallax data-scroll-speed="0.12" src="/Images%20Agrimarket/pexels-the-northern-lense-2148554063-31120516.jpg" alt="" loading="lazy" />
        </div>
        <ScrollReveal animation="fade-up" duration={650}>
          <div className="agri-cat-strip-container">
            {/* Bulles rondes pour accéder aux filières */}
            <div className="agri-cat-tiles-grid">
              {horizontalCategories.map((cat, idx) => (
                <Link
                  key={cat.title}
                  href={cat.link}
                  className="agri-cat-tile"
                  data-home-reveal
                  style={{ "--home-reveal-delay": `${idx * 80}ms` }}
                >
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
                <h4>
                  <Sprout width={17} height={17} style={{ color: "var(--agri-green)" }} />
                  <span>Vous êtes producteur ?</span>
                </h4>
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
        </ScrollReveal>
      </section>
      </ScrollRevealEffects>

      {/* ======================================================================
          BANDEAU DE RÉASSURANCE VERT FORÊT TYPE MAQUETTE (4 COLONNES)
          ====================================================================== */}
      <section className="agri-reassurance-bar" aria-label="Engagements de confiance AgriMarket">
        <ScrollReveal animation="fade-up" duration={650}>
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
        </ScrollReveal>
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

          {/* Onglets Filtres Rectangulaires avec vraies icônes Lucide sans emoji */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "26px" }}>
            {[
              { id: "all", label: "Toutes les offres", icon: null },
              { id: "vivriers", label: "Vivriers & Récoltes", icon: Wheat },
              { id: "elevage", label: "Élevage & Nutrition", icon: Bird },
              { id: "semences", label: "Semences", icon: Sprout },
              { id: "intrants", label: "Intrants & Engrais", icon: FlaskConical },
              { id: "materiel", label: "Matériel Agricole", icon: Tractor },
              { id: "transformes", label: "Transformés", icon: Boxes },
            ].map((tab) => {
              const TabIcon = tab.icon;
              const isActive = activeCategoryTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveCategoryTab(tab.id)}
                  style={{
                    background: isActive ? "var(--agri-green)" : "#ffffff",
                    color: isActive ? "#ffffff" : "#374151",
                    border: isActive ? "1.5px solid var(--agri-green)" : "1px solid #e5e7eb",
                    borderRadius: "0",
                    padding: "8px 16px",
                    fontSize: "13px",
                    fontWeight: 700,
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                    transition: "all 0.15s ease"
                  }}
                >
                  {TabIcon && <TabIcon width={14} height={14} style={{ color: isActive ? "var(--agri-lime)" : "var(--agri-green)" }} />}
                  <span>{tab.label}</span>
                </button>
              );
            })}
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
          GRILLE DES FILIÈRES STRATÉGIQUES DU CAMEROUN EN EFFET GLASS
          ====================================================================== */}
      <section className="agri-filieres-section">
        <div className="container" style={{ maxWidth: "1540px", margin: "0 auto", padding: "0 24px" }}>
          <ScrollReveal animation="fade-up" duration={600}>
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
          </ScrollReveal>

          <div className="agri-filieres-grid">
            {strategicFilieres.map((filiere, idx) => (
              <ScrollReveal 
                key={filiere.title} 
                animation="fade-up" 
                delay={idx * 120} 
                duration={600} 
                style={{ display: "flex", height: "100%" }}
              >
                <Link href={filiere.link} className="agri-filiere-card">
                  <img src={filiere.image} alt={filiere.title} />
                  <div className="agri-filiere-overlay">
                    <span>{filiere.category}</span>
                    <h3>{filiere.title}</h3>
                    <p>{filiere.description}</p>
                  </div>
                </Link>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ======================================================================
          COOPÉRATIVES & PRODUCTEURS VEDETTES DU CAMEROUN EN EFFET GLASS
          ====================================================================== */}
      <ScrollRevealEffects
        className="agri-home-coops-motion"
        revealSelector="[data-home-reveal]"
        parallaxSelector="[data-home-parallax]"
      >
      <section className="agri-coops-section">
        <div className="agri-home-scene agri-home-scene--coops-left" data-home-reveal>
          <img data-home-parallax data-scroll-speed="0.1" src="/Images%20Agrimarket/pexels-nasiru-othman-447186959-36757340.jpg" alt="" loading="lazy" />
        </div>
        <div className="agri-home-scene agri-home-scene--coops-right" data-home-reveal>
          <img data-home-parallax data-scroll-speed="0.14" src="/Images%20Agrimarket/pexels-the-northern-lense-2148554063-31120512.jpg" alt="" loading="lazy" />
        </div>
        <div className="container" style={{ maxWidth: "1540px", margin: "0 auto", padding: "0 24px" }}>
          <ScrollReveal animation="fade-up" duration={600}>
            <div className="agri-section-head">
              <div>
                <h2>Coopératives & Vendeurs Vedettes</h2>
                <p>Découvrez les coopératives et vendeurs agricoles qui proposent leurs offres sur AgriMarket.</p>
              </div>
              <Link href="/boutiques" className="agri-see-all-link">
                <span>Voir toutes les coopératives</span>
                <ArrowRight width={14} height={14} />
              </Link>
            </div>
          </ScrollReveal>

          <div className="agri-coops-grid">
            {cooperativeCards.map((coop, idx) => (
              <ScrollReveal key={coop.id} animation="fade-up" delay={idx * 140} duration={600} style={{ display: "flex", height: "100%" }}>
                {coop.isLoading ? <div className="agri-coop-skeleton" aria-hidden="true"><div className="agri-coop-skeleton-head"><i/><span><i/><i/></span></div><i/><i/><i/></div> : <Link href={coop.link} className="agri-coop-card">
                  <div className="agri-coop-head">
                    <div className="agri-coop-avatar"><Building2 width={22} height={22}/></div>
                    <div className="agri-coop-title"><strong>{coop.name}</strong><span><MapPin width={12} height={12}/>{coop.region}</span></div>
                  </div>
                  <div className="agri-coop-badge"><Check width={12} height={12}/>{coop.badge}</div>
                  <p className="agri-coop-desc">{coop.speciality}</p>
                  <div className="agri-coop-footer"><span>{coop.productsCount} offres actives</span><span>Voir le catalogue →</span></div>
                </Link>}
              </ScrollReveal>
            ))}
            {!cooperativeCards.length && <div className="agri-coops-empty"><Building2 size={22}/><p>Les coopératives et vendeurs partenaires apparaîtront ici dès que leurs boutiques seront publiées.</p><Link href="/boutique">Créer une boutique <ArrowRight size={14}/></Link></div>}
          </div>
        </div>
      </section>
      </ScrollRevealEffects>

      {/* ======================================================================
          DOUBLE BANNIÈRE D'APPEL À L'ACTION : ACHETEUR PROFESSIONNEL & VENDEUR
          ====================================================================== */}
      <ScrollRevealEffects
        className="agri-home-cta-motion"
        revealSelector="[data-home-reveal]"
        parallaxSelector="[data-home-parallax]"
      >
      <section className="agri-cta-double-section">
        <div className="agri-home-scene agri-home-scene--cta-left" data-home-reveal>
          <img data-home-parallax data-scroll-speed="0.08" src="/Images%20Agrimarket/pexels-arnaud-vigne-36746332-7164535.jpg" alt="" loading="lazy" />
        </div>
        <div className="agri-home-scene agri-home-scene--cta-right" data-home-reveal>
          <img data-home-parallax data-scroll-speed="0.13" src="/Images%20Agrimarket/pexels-jakubzerdzicki-28100001.jpg" alt="" loading="lazy" />
        </div>
        <div className="container" style={{ maxWidth: "1540px", margin: "0 auto", padding: "0 24px" }}>
          <div className="agri-cta-double-container">
            {/* Boîte Acheteur */}
            <ScrollReveal animation="fade-up" delay={0} duration={650} style={{ display: "flex", height: "100%" }}>
              <div className="agri-cta-banner-box buyer">
                <span>ACHETEURS DE GROS & COMMERÇANTS</span>
                <h3>Vous approvisionnez un restaurant, hôtel ou usine ?</h3>
                <p>Bénéficiez de tarifs préférentiels, de volumes garantis et d'une logistique sécurisée depuis les bassins de production.</p>
                <Link href="/catalogue?mode=wholesale" className="agri-cta-btn-orange">
                  <span>Accéder aux offres de gros</span>
                  <ArrowRight width={15} height={15} />
                </Link>
              </div>
            </ScrollReveal>

            {/* Boîte Vendeur */}
            <ScrollReveal animation="fade-up" delay={150} duration={650} style={{ display: "flex", height: "100%" }}>
              <div className="agri-cta-banner-box seller">
                <span>PRODUCTEURS, ÉLEVEURS & DISTRIBUTEURS</span>
                <h3>Développez vos ventes avec AgriMarket Cameroun</h3>
                <p>Rejoignez plus de 12 000 acteurs de la filière et vendez vos récoltes, animaux et intrants aux meilleurs acheteurs sans intermédiaires abusifs.</p>
                <Link href="/demande-produit" className="agri-cta-btn-green">
                  <span>Créer mon compte vendeur</span>
                  <ArrowRight width={15} height={15} />
                </Link>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>
      </ScrollRevealEffects>

      {/* ======================================================================
          CONSEILS PRATIQUES & GUIDES AGRONOMIQUES DU MONDE RURAL
          ====================================================================== */}
      <section className="agri-blog-section">
        <div className="container" style={{ maxWidth: "1540px", margin: "0 auto", padding: "0 24px" }}>
          <ScrollReveal animation="fade-up" duration={700}>
            <div className="agri-section-head">
              <div>
                <div className="agri-section-sub-kicker">
                  <BookOpen width={14} height={14} />
                  <span>EXPERTISE TECHNIQUE &amp; SAVOIR-FAIRE AGRICOLE</span>
                </div>
                <h2>Conseils &amp; Fiches Techniques pour Exploitants</h2>
                <p>Des fiches pratiques rédigées avec nos agronomes pour optimiser la conduite de vos cultures et de vos élevages au Cameroun.</p>
              </div>
              <Link href="/blog" className="agri-see-all-link">
                <span>Consulter tous les guides</span>
                <ArrowRight width={14} height={14} />
              </Link>
            </div>
          </ScrollReveal>

          <div className="agri-blog-grid">
            {adviceArticles.map((article, idx) => (
              <ScrollReveal 
                key={article.title} 
                animation="fade-up" 
                delay={idx * 140} 
                duration={700}
                style={{ display: "flex", height: "100%" }}
              >
                <Link href={article.link} className="agri-blog-card">
                  <div className="agri-blog-media">
                    <img src={article.image} alt={article.title} loading="lazy" />
                    <span className="agri-blog-tag-badge">{article.category}</span>
                  </div>
                  <div className="agri-blog-body">
                    <div className="agri-blog-meta">
                      <span className="agri-blog-time-badge">
                        <Clock width={12} height={12} />
                        {article.readTime} de lecture
                      </span>
                      <span className="agri-blog-date">{article.date}</span>
                    </div>
                    <h3>{article.title}</h3>
                    <p>{article.excerpt}</p>
                    <span className="agri-blog-link">
                      <span>Lire la fiche technique</span>
                      <ArrowRight width={14} height={14} className="agri-arrow-glide" />
                    </span>
                  </div>
                </Link>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ======================================================================
          SECTION IMMERSIVE FILIÈRES STRATÉGIQUES (PARALLAXE REVEAL + VIDÉO DE TRANSITION)
          ====================================================================== */}
      <section 
        ref={filiereSectionRef}
        className="agri-filiere-immersive-band" 
        aria-label="Filières stratégiques du bassin agro-écologique"
      >
        {/* Fond Vidéo avec Parallaxe GPU */}
        <div className="agri-immersive-bg-wrapper">
          <video
            ref={filiereVideoRef}
            autoPlay
            loop
            muted
            playsInline
            poster="/Images%20Agrimarket/pexels-made-by-pixels-133605980-33364793.jpg"
            className="agri-immersive-video"
          >
            <source src="/Videos%20Agrimarket/14764786_1920_1080_30fps.mp4" type="video/mp4" />
          </video>
          <div className="agri-immersive-gradient-mask" />
          <div className="agri-immersive-pattern-grid" />
        </div>

        <div className="container agri-immersive-content-container">
          <ScrollReveal animation="fade-up" duration={700}>
            <div className="agri-filiere-kicker-pill">
              <Compass width={14} height={14} className="agri-pulse-icon" />
              <span>BASSIN AGRO-ÉCOLOGIQUE &amp; AGRO-PÔLES DU CAMEROUN</span>
            </div>
            
            <h2 className="agri-immersive-title">
              Des chaînes de valeur locales, <span className="text-highlight">structurées pour nourrir le pays</span>.
            </h2>
            
            <p className="agri-immersive-lead">
              Chaque filière est pensée pour relier les zones de production aux marchés urbains, les transformateurs aux coopératives,
              et les acteurs de terrain aux solutions de financement, d’intrants et de logistique.
            </p>
          </ScrollReveal>

          {/* Grille de 4 Cartes Statistiques Glassmorphism avec ScrollReveal */}
          <div className="agri-filiere-stats-grid">
            <ScrollReveal animation="fade-up" delay={100} duration={650} style={{ display: "flex", height: "100%" }}>
              <div className="agri-filiere-stat-card">
                <div className="agri-stat-glow-icon">
                  <Users width={24} height={24} />
                </div>
                <strong className="agri-stat-number">12 000+</strong>
                <span className="agri-stat-label">Acteurs connectés</span>
                <p className="agri-stat-sub">Producteurs, acheteurs et coopératives actifs</p>
              </div>
            </ScrollReveal>

            <ScrollReveal animation="fade-up" delay={200} duration={650} style={{ display: "flex", height: "100%" }}>
              <div className="agri-filiere-stat-card">
                <div className="agri-stat-glow-icon">
                  <Boxes width={24} height={24} />
                </div>
                <strong className="agri-stat-number">18</strong>
                <span className="agri-stat-label">Filières couvertes</span>
                <p className="agri-stat-sub">Vivriers, élevage, maraîchage, rentes &amp; semences</p>
              </div>
            </ScrollReveal>

            <ScrollReveal animation="fade-up" delay={300} duration={650} style={{ display: "flex", height: "100%" }}>
              <div className="agri-filiere-stat-card">
                <div className="agri-stat-glow-icon">
                  <ShieldCheck width={24} height={24} />
                </div>
                <strong className="agri-stat-number">100%</strong>
                <span className="agri-stat-label">Traçabilité locale</span>
                <p className="agri-stat-sub">Origine bord champ certifiée et contrôlée</p>
              </div>
            </ScrollReveal>

            <ScrollReveal animation="fade-up" delay={400} duration={650} style={{ display: "flex", height: "100%" }}>
              <div className="agri-filiere-stat-card">
                <div className="agri-stat-glow-icon">
                  <MapPin width={24} height={24} />
                </div>
                <strong className="agri-stat-number">10</strong>
                <span className="agri-stat-label">Régions interconnectées</span>
                <p className="agri-stat-sub">Réseau logistique du Grand Nord au Littoral</p>
              </div>
            </ScrollReveal>
          </div>

          {/* Boutons d'Action Immersifs */}
          <ScrollReveal animation="fade-up" delay={480} duration={650}>
            <div className="agri-immersive-actions">
              <Link href="/catalogue" className="agri-immersive-cta-primary">
                <span>Explorer les filières du pays</span>
                <ArrowRight width={16} height={16} />
              </Link>
              <Link href="/demande-produit" className="agri-immersive-cta-secondary">
                <span>Rejoindre le réseau de producteurs</span>
                <Sparkles width={15} height={15} />
              </Link>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </div>
  );
}
