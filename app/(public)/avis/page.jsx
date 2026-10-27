"use client";

import Link from "next/link";
import {
  Star,
  Check,
  Quote,
  ArrowRight,
  Search,
  Filter,
  Sparkles,
  ShieldCheck,
  MapPin,
  Sprout,
  Truck,
  MessageSquare,
  Plus,
  X,
  Award,
  CheckCircle2,
  ThumbsUp,
  RefreshCw,
  ShoppingBag,
  ExternalLink,
  Heart,
  Share2,
  Bookmark,
  Send,
  User,
  Wheat,
  Bird,
  Tractor,
  Layers,
  Package,
  TrendingUp,
  Hash,
  Clock,
  ChevronRight,
  Info,
  FileText,
  Radio
} from "lucide-react";
import { useMemo, useState, useEffect, useRef } from "react";
import { useStore } from "@/lib/store";
import { money } from "@/lib/format";

// Bassins agricoles camerounais pour les stories avec véritables icônes vectorielles
const CAMEROON_STORIES = [
  { id: "all", name: "Tous", hub: "Tout le Cameroun", icon: MapPin },
  { id: "foumbot", name: "Foumbot", hub: "Maraîchage & Tomates (Ouest)", icon: Sprout },
  { id: "obala", name: "Obala", hub: "Bananier Plantain (Centre)", icon: Package },
  { id: "bafoussam", name: "Bafoussam", hub: "Élevage & Provendes (Ouest)", icon: Bird },
  { id: "garoua", name: "Garoua", hub: "Céréales & Oignons (Nord)", icon: Wheat },
  { id: "douala", name: "Douala", hub: "Hub Intrants & Port (Littoral)", icon: Truck },
  { id: "yaounde", name: "Yaoundé", hub: "Grand Marché Vivrier (Centre)", icon: ShoppingBag },
  { id: "bertoua", name: "Bertoua", hub: "Huiles & Tubercules (Est)", icon: Layers }
];

// Tendances hashtag du monde agricole
const HASHTAG_TRENDS = [
  { tag: "#TomatesFoumbot", count: 29, query: "tomate" },
  { tag: "#PlantainObala", count: 35, query: "plantain" },
  { tag: "#CampagneMaïs2026", count: 42, query: "maïs" },
  { tag: "#EngraisNPK", count: 51, query: "engrais" },
  { tag: "#AvicultureBafoussam", count: 38, query: "poulet" },
  { tag: "#MotopompesIrrigation", count: 19, query: "motopompe" }
];

// Top producteurs et coopératives recommandés
const TOP_COOPERATIVES = [
  { name: "GIC Maraîchers de Foumbot", location: "Ouest", rating: "5.0", badge: "Coopérative Certifiée", avatar: "MF" },
  { name: "Ferme Avicole des Hauts-Plateaux", location: "Bafoussam", rating: "4.9", badge: "Éleveur Leader", avatar: "FA" },
  { name: "Union Vivrière de la Lékié", location: "Obala", rating: "4.9", badge: "Groupement Vivrier", avatar: "UV" },
  { name: "Comptoir Agronomique Littoral", location: "Douala", rating: "4.8", badge: "Distributeur Intrants", avatar: "CA" }
];

// Réponses communautaires authentiques par défaut
const DEFAULT_COMMUNITY_REPLIES = {
  "rv-agri-01": [
    {
      id: "rep-1-1",
      author: "Coopérative Maraîchère du Noun",
      role: "Producteur Partenaire Vérifié",
      time: "Il y a 3 jours",
      text: "Merci beaucoup Michel ! Pour la prochaine livraison, nous ajouterons les cageots renforcés pour une protection encore supérieure pendant le trajet Foumbot-Douala.",
      isProducer: true
    },
    {
      id: "rep-1-2",
      author: "Jean-Paul N.",
      role: "Grossiste Marché Sandaga",
      time: "Il y a 2 jours",
      text: "Je confirme, les cageots de cette coopérative tiennent très bien la route, aucune pourriture après 3 jours en étalage.",
      isProducer: false
    }
  ],
  "rv-agri-02": [
    {
      id: "rep-2-1",
      author: "GIC Planteurs de la Lékié",
      role: "Producteur Partenaire Vérifié",
      time: "Il y a 5 jours",
      text: "Ravi que la pesée et la maturité vous conviennent Célestin ! Deux nouveaux camions partent ce vendredi pour Yaoundé.",
      isProducer: true
    }
  ],
  "rv-agri-04": [
    {
      id: "rep-4-1",
      author: "AgriMarket Conseil Agronomique",
      role: "Équipe Technique AgriMarket",
      time: "Il y a 6 jours",
      text: "Conseil pratique pour votre seconde application : enfouissez légèrement les granulés à 5 cm du pied avant la pluie du soir pour maximiser l'absorption racinaire sans évaporation.",
      isProducer: true
    }
  ],
  "rv-agri-05": [
    {
      id: "rep-5-1",
      author: "Moussa Daouda",
      role: "Maraîcher Rives de la Bénoué",
      time: "Il y a 1 semaine",
      text: "Docteur, quelle longueur de tuyau de refoulement utilisez-vous avec cette motopompe ?",
      isProducer: false
    },
    {
      id: "rep-5-2",
      author: "Dr. Hamidou Ndam",
      role: "Auteur du retour",
      time: "Il y a 6 jours",
      text: "J'utilise 50 mètres de tuyau annelé 3 pouces, la pression reste constante sans aucune baisse de régime !",
      isProducer: false
    }
  ]
};

export default function ReviewsPage() {
  const { reviews, products, addReview, user, notify } = useStore();

  // Filtres sociaux
  const [filterRating, setFilterRating] = useState("Tous");
  const [filterCategory, setFilterCategory] = useState("Tous");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedHub, setSelectedHub] = useState("all");
  const [filterTab, setFilterTab] = useState("feed");

  // Interactions sociales
  const [likesMap, setLikesMap] = useState({
    "rv-agri-01": 24,
    "rv-agri-02": 18,
    "rv-agri-03": 31,
    "rv-agri-04": 15,
    "rv-agri-05": 27,
    "rv-agri-06": 12,
    "rv-agri-07": 9,
    "rv-agri-08": 22
  });
  const [userLikedMap, setUserLikedMap] = useState({});
  const [savedPostsMap, setSavedPostsMap] = useState({});
  const [expandedCommentsMap, setExpandedCommentsMap] = useState({
    "rv-agri-01": true,
    "rv-agri-05": true
  });
  const [repliesState, setRepliesState] = useState(DEFAULT_COMMUNITY_REPLIES);
  const [replyInputMap, setReplyInputMap] = useState({});

  // Formulaire de publication
  const [showPublisherForm, setShowPublisherForm] = useState(false);
  const [ratingHover, setRatingHover] = useState(0);
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const publisherRef = useRef(null);

  const [reviewForm, setReviewForm] = useState({
    productId: products[0]?.id || "p-vivrier-01",
    rating: 5,
    name: user?.name || user?.firstName || "",
    role: "Maraîcher / Agriculteur",
    location: "Foumbot (Ouest)",
    title: "",
    comment: "",
    recommends: true
  });

  useEffect(() => {
    if (user && !reviewForm.name) {
      setReviewForm((prev) => ({
        ...prev,
        name: user.name || user.firstName || ""
      }));
    }
  }, [user]);

  // Avis approuvés
  const approvedReviews = useMemo(() => {
    return reviews.filter((r) => r.approved !== false);
  }, [reviews]);

  // Statistiques du réseau
  const average = useMemo(() => {
    if (!approvedReviews.length) return "4.9";
    const sum = approvedReviews.reduce((acc, r) => acc + Number(r.rating || 5), 0);
    return (sum / approvedReviews.length).toFixed(1);
  }, [approvedReviews]);

  const recommendedCount = useMemo(() => {
    return approvedReviews.filter((r) => r.recommends !== false).length;
  }, [approvedReviews]);

  const recommendedPercent = useMemo(() => {
    if (!approvedReviews.length) return 98;
    return Math.round((recommendedCount / approvedReviews.length) * 100);
  }, [approvedReviews, recommendedCount]);

  const distribution = useMemo(() => {
    return [5, 4, 3, 2, 1].map((rating) => {
      const count = approvedReviews.filter((r) => Math.round(Number(r.rating || 5)) === rating).length;
      const percentage = approvedReviews.length ? Math.round((count / approvedReviews.length) * 100) : 0;
      return { rating, count, percentage };
    });
  }, [approvedReviews]);

  // Filières disponibles avec icônes Lucide
  const categories = useMemo(() => {
    return [
      { id: "Tous", label: "Toutes les filières", icon: Sprout },
      { id: "Produits vivriers et agricoles", label: "Produits vivriers & maraîchers", icon: Wheat },
      { id: "Élevage et produits animaux", label: "Élevage & aviculture", icon: Bird },
      { id: "Semences, plants et pépinières", label: "Semences & plants certifiés", icon: Sprout },
      { id: "Intrants agricoles", label: "Intrants & fertilisants", icon: Layers },
      { id: "Matériel et équipements", label: "Matériel & irrigation", icon: Tractor },
      { id: "Produits transformés", label: "Produits transformés locaux", icon: Package }
    ];
  }, []);

  // Filtrage du fil d'actualités
  const filteredReviews = useMemo(() => {
    return approvedReviews.filter((review) => {
      if (selectedHub !== "all") {
        const hubConfig = CAMEROON_STORIES.find((h) => h.id === selectedHub);
        if (hubConfig) {
          const matchLoc = (review.location || "").toLowerCase().includes(hubConfig.name.toLowerCase());
          if (!matchLoc) return false;
        }
      }

      if (filterTab === "top") {
        if (Number(review.rating || 5) < 5) return false;
      } else if (filterTab === "recommended") {
        if (review.recommends === false) return false;
      }

      if (filterRating !== "Tous") {
        if (Math.round(Number(review.rating || 5)) !== Number(filterRating)) {
          return false;
        }
      }

      const product = products.find((p) => p.id === review.productId);

      if (filterCategory !== "Tous") {
        if (!product || product.category !== filterCategory) {
          return false;
        }
      }

      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchName = (review.name || "").toLowerCase().includes(query);
        const matchTitle = (review.title || "").toLowerCase().includes(query);
        const matchComment = (review.comment || "").toLowerCase().includes(query);
        const matchLocation = (review.location || "").toLowerCase().includes(query);
        const matchRole = (review.role || "").toLowerCase().includes(query);
        const matchProduct = (product?.name || "").toLowerCase().includes(query);

        if (!matchName && !matchTitle && !matchComment && !matchLocation && !matchRole && !matchProduct) {
          return false;
        }
      }

      return true;
    });
  }, [approvedReviews, selectedHub, filterTab, filterRating, filterCategory, searchQuery, products]);

  // Actions sociales interactives
  const handleToggleLike = (reviewId) => {
    const isLiked = !!userLikedMap[reviewId];
    setUserLikedMap((prev) => ({ ...prev, [reviewId]: !isLiked }));
    setLikesMap((prev) => ({
      ...prev,
      [reviewId]: (prev[reviewId] || 0) + (isLiked ? -1 : 1)
    }));
    notify(isLiked ? "Avis retiré de vos mentions Utile" : "Vous avez marqué cet avis comme Utile");
  };

  const handleToggleBookmark = (reviewId) => {
    const isSaved = !!savedPostsMap[reviewId];
    setSavedPostsMap((prev) => ({ ...prev, [reviewId]: !isSaved }));
    notify(isSaved ? "Publication retirée des favoris" : "Publication enregistrée dans vos favoris");
  };

  const handleSharePost = (review) => {
    const product = products.find((p) => p.id === review.productId);
    const text = `Retour d'expérience de ${review.name} sur ${product?.name || "AgriMarket"} : "${review.title}"`;
    const url = typeof window !== "undefined" ? window.location.href : "https://agrimarket.cm/avis";

    if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(`${text}\n${url}`).then(() => {
        notify("Lien de la publication copié dans le presse-papier !");
      }).catch(() => {
        notify("Lien copié : " + url);
      });
    } else {
      notify("Lien copié : " + url);
    }
  };

  const toggleCommentsSection = (reviewId) => {
    setExpandedCommentsMap((prev) => ({
      ...prev,
      [reviewId]: !prev[reviewId]
    }));
  };

  // Envoi d'une réponse
  const handleSendReply = (reviewId, e) => {
    e.preventDefault();
    const commentText = (replyInputMap[reviewId] || "").trim();
    if (!commentText) {
      notify("Veuillez écrire un commentaire avant d'envoyer.");
      return;
    }

    const authorName = user?.name || user?.firstName || "Exploitant Partenaire";
    const authorRole = user?.role === "SELLER" ? "Vendeur / Coopérative" : "Membre Réseau Terroir";

    const newReply = {
      id: `rep-${Date.now()}`,
      author: authorName,
      role: authorRole,
      time: "À l'instant",
      text: commentText,
      isProducer: user?.role === "SELLER"
    };

    setRepliesState((prev) => ({
      ...prev,
      [reviewId]: [...(prev[reviewId] || []), newReply]
    }));

    setReplyInputMap((prev) => ({ ...prev, [reviewId]: "" }));
    setExpandedCommentsMap((prev) => ({ ...prev, [reviewId]: true }));
    notify("Votre commentaire a été publié dans la discussion !");
  };

  // Soumission d'un avis
  const handleSubmitPublisher = (e) => {
    e.preventDefault();
    if (!reviewForm.productId) {
      notify("Veuillez choisir le produit concerné.");
      return;
    }
    if (!reviewForm.name.trim()) {
      notify("Veuillez renseigner votre nom ou raison sociale.");
      return;
    }
    if (!reviewForm.title.trim()) {
      notify("Veuillez donner un titre à votre retour d'expérience.");
      return;
    }
    if (!reviewForm.comment.trim()) {
      notify("Veuillez rédiger quelques lignes sur votre avis.");
      return;
    }

    setReviewSubmitting(true);
    setTimeout(() => {
      const created = addReview({
        productId: reviewForm.productId,
        name: reviewForm.name.trim(),
        role: reviewForm.role,
        location: reviewForm.location,
        rating: reviewForm.rating,
        title: reviewForm.title.trim(),
        comment: reviewForm.comment.trim(),
        recommends: reviewForm.recommends
      });

      if (created?.id) {
        setLikesMap((prev) => ({ ...prev, [created.id]: 1 }));
        setUserLikedMap((prev) => ({ ...prev, [created.id]: true }));
      }

      setReviewSubmitting(false);
      setShowPublisherForm(false);
      setReviewForm({
        productId: products[0]?.id || "p-vivrier-01",
        rating: 5,
        name: user?.name || user?.firstName || "",
        role: "Maraîcher / Agriculteur",
        location: "Foumbot (Ouest)",
        title: "",
        comment: "",
        recommends: true
      });
      notify("Votre avis d'acheteur a été publié en tête du fil social !");
    }, 250);
  };

  const resetAllFilters = () => {
    setFilterRating("Tous");
    setFilterCategory("Tous");
    setSearchQuery("");
    setSelectedHub("all");
    setFilterTab("feed");
  };

  return (
    <div className="agri-social-page-wrapper">
      {/* Fil d'Ariane Terroir Pleine Largeur */}
      <nav
        aria-label="Fil d'Ariane"
        style={{
          padding: "16px 0 14px",
          fontSize: "13px",
          color: "#64748b",
          display: "flex",
          alignItems: "center",
          gap: "8px"
        }}
      >
        <Link href="/" style={{ color: "#0b5d33", fontWeight: 700, textDecoration: "none" }}>
          Accueil
        </Link>
        <span style={{ color: "#94a3b8" }}>/</span>
        <Link href="/catalogue" style={{ color: "#0b5d33", fontWeight: 700, textDecoration: "none" }}>
          Catalogue Agropastoral
        </Link>
        <span style={{ color: "#94a3b8" }}>/</span>
        <strong style={{ color: "#07331e" }}>Fil Social & Avis Communautaires du Cameroun</strong>
      </nav>

      {/* BANNIÈRE HÉROÏQUE PLEINE LARGEUR AVEC BORDS ARRONDIS ADOUCIS */}
      <section
        className="agri-reviews-banner"
        style={{
          marginBottom: "24px",
          padding: "44px 36px",
          borderRadius: "16px"
        }}
      >
        <div style={{ maxWidth: "100%" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "16px" }}>
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                background: "rgba(243, 112, 33, 0.25)",
                color: "#ffc107",
                border: "1px solid rgba(243, 112, 33, 0.5)",
                padding: "6px 14px",
                fontSize: "12px",
                fontWeight: 900,
                textTransform: "uppercase",
                letterSpacing: "1px",
                borderRadius: "20px"
              }}
            >
              <Sprout width={15} height={15} />
              Fil Social Agropastoral • Communauté Camerounaise
            </span>

            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  fontSize: "13px",
                  color: "#e2ece7",
                  fontWeight: 700,
                  background: "rgba(0, 0, 0, 0.2)",
                  padding: "6px 12px",
                  borderRadius: "20px"
                }}
              >
                <span className="agri-online-indicator" />
                {approvedReviews.length + 42} Membres & Acheteurs actifs aujourd'hui
              </span>
            </div>
          </div>

          <h1 style={{ margin: "14px 0 10px", fontSize: "clamp(26px, 3.4vw, 42px)", fontWeight: 900 }}>
            Le Réseau Social des Acteurs du Terroir : <br />
            <span style={{ color: "#8ec72c" }}>Avis, Récoltes & Retours d'Expérience en Direct</span>
          </h1>

          <p style={{ margin: "0 0 24px", maxWidth: "920px", fontSize: "15.5px", lineHeight: 1.6, color: "#dce8e1" }}>
            Échangez entre coopératives, éleveurs, maraîchers et grossistes. Lisez les retours d'acheteurs vérifiés
            sur la conformité des cageots, sacs de semences, régimes et engrais, posez vos questions en direct
            et notez vos approvisionnements bord-champ.
          </p>

          {/* Ruban rapide de réassurance */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", alignItems: "center" }}>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                background: "rgba(255, 255, 255, 0.12)",
                padding: "8px 16px",
                fontSize: "12.5px",
                fontWeight: 700,
                color: "#ffffff",
                borderRadius: "8px"
              }}
            >
              <ShieldCheck width={16} height={16} style={{ color: "#8ec72c" }} />
              <span>100% Achats Vérifiés Bord-Champ</span>
            </div>

            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                background: "rgba(255, 255, 255, 0.12)",
                padding: "8px 16px",
                fontSize: "12.5px",
                fontWeight: 700,
                color: "#ffffff",
                borderRadius: "8px"
              }}
            >
              <MapPin width={16} height={16} style={{ color: "#f37021" }} />
              <span>10 Régions Connectées (Ouest, Centre, Nord, Littoral...)</span>
            </div>

            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                background: "rgba(255, 255, 255, 0.12)",
                padding: "8px 16px",
                fontSize: "12.5px",
                fontWeight: 700,
                color: "#ffffff",
                borderRadius: "8px"
              }}
            >
              <MessageSquare width={16} height={16} style={{ color: "#8ec72c" }} />
              <span>Commentaires & Réponses Ouvertes aux Producteurs</span>
            </div>
          </div>
        </div>
      </section>

      {/* STORY BAR HORIZONTALE DES BASSINS AGROPASTORAUX AVEC VRAIES ICÔNES */}
      <div className="agri-social-stories-bar">
        <div style={{ fontSize: "11px", fontWeight: 900, textTransform: "uppercase", color: "#64748b", paddingRight: "8px", display: "flex", alignItems: "center", gap: "4px" }}>
          <Radio width={13} height={13} style={{ color: "#0b5d33" }} />
          Bassins :
        </div>
        {CAMEROON_STORIES.map((story) => {
          const StoryIcon = story.icon;
          const isActive = selectedHub === story.id;
          return (
            <button
              key={story.id}
              type="button"
              className="agri-social-story-item"
              onClick={() => setSelectedHub(story.id)}
              title={story.hub}
            >
              <div
                className="agri-social-story-avatar"
                style={{
                  background: isActive
                    ? "linear-gradient(135deg, #0b5d33 0%, #8ec72c 100%)"
                    : "linear-gradient(135deg, #d8e2dc 0%, #cbd5e1 100%)"
                }}
              >
                <div
                  className="agri-social-story-avatar-inner"
                  style={{
                    background: isActive ? "#0b5d33" : "#ffffff",
                    color: isActive ? "#ffffff" : "#07331e"
                  }}
                >
                  <StoryIcon width={20} height={20} />
                </div>
              </div>
              <span
                className="agri-social-story-label"
                style={{
                  color: isActive ? "#0b5d33" : "#475569",
                  fontWeight: isActive ? 900 : 700
                }}
              >
                {story.name}
              </span>
            </button>
          );
        })}
      </div>

      {/* ARCHITECTURE 3 COLONNES RÉSEAU SOCIAL PLEINE LARGEUR */}
      <div className="agri-social-layout">
        
        {/* ============================================================== */}
        {/* COLONNE GAUCHE : PROFIL, FILIÈRES ET BASSINS DU TERROIR        */}
        {/* ============================================================== */}
        <aside>
          {/* Carte 1 : Espace Mon Profil Terroir */}
          <div className="agri-social-card" style={{ padding: "20px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "14px" }}>
              <div
                style={{
                  width: "50px",
                  height: "50px",
                  background: "#0b5d33",
                  color: "#ffffff",
                  fontSize: "19px",
                  fontWeight: 900,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: "12px",
                  position: "relative"
                }}
              >
                {(user?.firstName || user?.name || "A").slice(0, 1).toUpperCase()}
                <span
                  style={{
                    width: "12px",
                    height: "12px",
                    background: "#8ec72c",
                    border: "2px solid #ffffff",
                    borderRadius: "50%",
                    position: "absolute",
                    bottom: "-2px",
                    right: "-2px"
                  }}
                  title="En ligne"
                />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: "15px", fontWeight: 800, color: "#07331e" }}>
                  {user?.firstName ? `${user.firstName} ${user.lastName || ""}` : "Exploitant Agricole"}
                </h3>
                <span style={{ fontSize: "12px", color: "#64748b", fontWeight: 600 }}>
                  {user?.role === "SELLER" ? "Coopérative / Vendeur" : "Acheteur Vérifié AgriMarket"}
                </span>
              </div>
            </div>

            <div
              style={{
                background: "#f8faf9",
                border: "1px solid #e2ece7",
                borderRadius: "10px",
                padding: "10px 14px",
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "8px",
                textAlign: "center",
                marginBottom: "14px"
              }}
            >
              <div>
                <div style={{ fontSize: "16px", fontWeight: 900, color: "#07331e" }}>
                  {approvedReviews.length}
                </div>
                <div style={{ fontSize: "11px", color: "#64748b", fontWeight: 700 }}>Avis Terroir</div>
              </div>
              <div style={{ borderLeft: "1px solid #d8e2dc" }}>
                <div style={{ fontSize: "16px", fontWeight: 900, color: "#f37021" }}>
                  98%
                </div>
                <div style={{ fontSize: "11px", color: "#64748b", fontWeight: 700 }}>Confiance</div>
              </div>
            </div>

            <Link
              href="/compte"
              style={{
                display: "block",
                textAlign: "center",
                background: "#f1f5f9",
                color: "#07331e",
                padding: "9px 12px",
                fontSize: "12.5px",
                fontWeight: 800,
                textDecoration: "none",
                borderRadius: "8px",
                transition: "background 0.2s"
              }}
            >
              Gérer mon profil & mes commandes
            </Link>
          </div>

          {/* Carte 2 : Navigation par Filières & Canaux */}
          <div className="agri-social-card" style={{ padding: "18px" }}>
            <div
              style={{
                fontSize: "12px",
                fontWeight: 900,
                textTransform: "uppercase",
                letterSpacing: "0.5px",
                color: "#07331e",
                marginBottom: "12px",
                display: "flex",
                alignItems: "center",
                gap: "6px"
              }}
            >
              <Sprout width={16} height={16} style={{ color: "#0b5d33" }} />
              Canaux par Filière
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              {categories.map((cat) => {
                const IconComponent = cat.icon;
                const isActive = filterCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setFilterCategory(cat.id)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: "10px",
                      padding: "8px 12px",
                      background: isActive ? "#e6f3eb" : "transparent",
                      border: "none",
                      color: isActive ? "#0b5d33" : "#334155",
                      fontWeight: isActive ? 800 : 600,
                      fontSize: "13px",
                      cursor: "pointer",
                      textAlign: "left",
                      borderRadius: "8px",
                      transition: "all 0.15s"
                    }}
                  >
                    <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <IconComponent width={15} height={15} style={{ color: isActive ? "#0b5d33" : "#64748b" }} />
                      {cat.label}
                    </span>
                    {isActive && <ChevronRight width={14} height={14} />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Carte 3 : Bassins Populaires (Régions du Cameroun) */}
          <div className="agri-social-card" style={{ padding: "18px" }}>
            <div
              style={{
                fontSize: "12px",
                fontWeight: 900,
                textTransform: "uppercase",
                letterSpacing: "0.5px",
                color: "#07331e",
                marginBottom: "12px",
                display: "flex",
                alignItems: "center",
                gap: "6px"
              }}
            >
              <MapPin width={16} height={16} style={{ color: "#f37021" }} />
              Filtre par Bassin Agricole
            </div>

            <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
              {CAMEROON_STORIES.map((hub) => (
                <button
                  key={hub.id}
                  type="button"
                  onClick={() => setSelectedHub(hub.id)}
                  style={{
                    background: selectedHub === hub.id ? "#0b5d33" : "#f1f5f9",
                    color: selectedHub === hub.id ? "#ffffff" : "#334155",
                    border: "none",
                    padding: "6px 12px",
                    fontSize: "12px",
                    fontWeight: 700,
                    cursor: "pointer",
                    borderRadius: "20px",
                    transition: "all 0.15s"
                  }}
                >
                  {hub.name}
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* ============================================================== */}
        {/* COLONNE CENTRALE : COMPOSITEUR DE POST, RECHERCHE ET FIL D'AVIS */}
        {/* ============================================================== */}
        <main>
          {/* BOÎTE DE PUBLICATION DE RETOUR D'EXPÉRIENCE */}
          <section className="agri-social-publisher" ref={publisherRef}>
            {!showPublisherForm ? (
              <div>
                <div
                  className="agri-social-publisher-trigger"
                  onClick={() => setShowPublisherForm(true)}
                >
                  <div
                    style={{
                      width: "36px",
                      height: "36px",
                      background: "#0b5d33",
                      color: "#ffffff",
                      fontSize: "14px",
                      fontWeight: 800,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      borderRadius: "8px",
                      flexShrink: 0
                    }}
                  >
                    {(user?.firstName || user?.name || "A").slice(0, 1).toUpperCase()}
                  </div>
                  <span>
                    Partagez votre avis d'acheteur, état de récolte, conditionnement ou transport...
                  </span>
                </div>

                <div className="agri-social-publisher-actions">
                  <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                    <button
                      type="button"
                      className="agri-social-pill-action"
                      onClick={() => setShowPublisherForm(true)}
                    >
                      <Star width={14} height={14} style={{ color: "#f59e0b" }} />
                      Noter un produit commandé
                    </button>
                    <button
                      type="button"
                      className="agri-social-pill-action"
                      onClick={() => setShowPublisherForm(true)}
                    >
                      <MapPin width={14} height={14} style={{ color: "#f37021" }} />
                      Retour de mon bassin agricole
                    </button>
                    <button
                      type="button"
                      className="agri-social-pill-action"
                      onClick={() => setShowPublisherForm(true)}
                    >
                      <Truck width={14} height={14} style={{ color: "#0b5d33" }} />
                      Délais de livraison & pesée
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowPublisherForm(true)}
                    style={{
                      background: "#f37021",
                      color: "#ffffff",
                      border: "none",
                      padding: "8px 18px",
                      fontSize: "12.5px",
                      fontWeight: 800,
                      cursor: "pointer",
                      borderRadius: "8px",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "6px"
                    }}
                  >
                    <Plus width={15} height={15} />
                    Rédiger un avis
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmitPublisher} style={{ animation: "agriPopIn 0.25s ease-out" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
                  <h3 style={{ margin: 0, fontSize: "16px", fontWeight: 900, color: "#07331e", display: "flex", alignItems: "center", gap: "8px" }}>
                    <MessageSquare width={18} height={18} style={{ color: "#0b5d33" }} />
                    Créer une publication de retour d'expérience
                  </h3>
                  <button
                    type="button"
                    onClick={() => setShowPublisherForm(false)}
                    style={{ background: "none", border: "none", color: "#94a3b8", cursor: "pointer", padding: "4px" }}
                    aria-label="Fermer"
                  >
                    <X width={20} height={20} />
                  </button>
                </div>

                {/* Sélecteur de produit à noter */}
                <div style={{ marginBottom: "14px" }}>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 800, color: "#07331e", textTransform: "uppercase", marginBottom: "4px" }}>
                    Produit évalué <span style={{ color: "#f37021" }}>*</span>
                  </label>
                  <select
                    required
                    value={reviewForm.productId}
                    onChange={(e) => setReviewForm((prev) => ({ ...prev, productId: e.target.value }))}
                    style={{
                      width: "100%",
                      padding: "9px 12px",
                      fontSize: "13.5px",
                      border: "1px solid #cbd5e1",
                      background: "#ffffff",
                      color: "#07331e",
                      fontWeight: 700,
                      borderRadius: "8px"
                    }}
                  >
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} — {p.location || "Cameroun"} ({money(p.price)}/{p.unit || "unité"})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Étoiles interactives */}
                <div style={{ marginBottom: "14px" }}>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 800, color: "#07331e", textTransform: "uppercase", marginBottom: "4px" }}>
                    Note globale <span style={{ color: "#f37021" }}>*</span>
                  </label>
                  <div className="agri-stars-interactive">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        className={`agri-star-btn ${star <= (ratingHover || reviewForm.rating) ? "is-active" : ""}`}
                        onMouseEnter={() => setRatingHover(star)}
                        onMouseLeave={() => setRatingHover(0)}
                        onClick={() => setReviewForm((prev) => ({ ...prev, rating: star }))}
                        aria-label={`Attribuer ${star} étoiles`}
                      >
                        <Star width={22} height={22} fill={star <= (ratingHover || reviewForm.rating) ? "currentColor" : "none"} />
                      </button>
                    ))}
                    <span className="agri-stars-rating-label">
                      {(ratingHover || reviewForm.rating) === 5 && "5/5 — Excellent / Recommandé bord-champ"}
                      {(ratingHover || reviewForm.rating) === 4 && "4/5 — Très satisfaisant"}
                      {(ratingHover || reviewForm.rating) === 3 && "3/5 — Conforme aux attentes"}
                      {(ratingHover || reviewForm.rating) === 2 && "2/5 — Passable"}
                      {(ratingHover || reviewForm.rating) === 1 && "1/5 — Insatisfaisant"}
                    </span>
                  </div>
                </div>

                {/* Champs Auteur, Rôle, Bassin */}
                <div className="agri-fields-grid" style={{ marginBottom: "12px" }}>
                  <div className="agri-field-group">
                    <label>Nom ou Raison Sociale <span style={{ color: "#f37021" }}>*</span></label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Paul Mbarga, Coopérative Maraîchère..."
                      value={reviewForm.name}
                      onChange={(e) => setReviewForm((prev) => ({ ...prev, name: e.target.value }))}
                      style={{ borderRadius: "8px" }}
                    />
                  </div>

                  <div className="agri-field-group">
                    <label>Votre Profil</label>
                    <select
                      value={reviewForm.role}
                      onChange={(e) => setReviewForm((prev) => ({ ...prev, role: e.target.value }))}
                      style={{ borderRadius: "8px" }}
                    >
                      <option value="Maraîcher / Agriculteur">Maraîcher / Agriculteur</option>
                      <option value="Éleveur / Aviculteur">Éleveur / Aviculteur</option>
                      <option value="Grossiste / Commerçant vivrier">Grossiste / Commerçant vivrier</option>
                      <option value="Restaurateur / Traiteur">Restaurateur / Traiteur</option>
                      <option value="Responsable de Coopérative / GIC">Responsable de Coopérative / GIC</option>
                      <option value="Ingénieur Agronome / Conseil">Ingénieur Agronome / Conseil</option>
                      <option value="Consommateur particulier">Consommateur particulier</option>
                    </select>
                  </div>

                  <div className="agri-field-group">
                    <label>Bassin / Ville (Cameroun) <span style={{ color: "#f37021" }}>*</span></label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Foumbot (Ouest), Obala (Centre)..."
                      value={reviewForm.location}
                      onChange={(e) => setReviewForm((prev) => ({ ...prev, location: e.target.value }))}
                      style={{ borderRadius: "8px" }}
                    />
                  </div>

                  <div className="agri-field-group">
                    <label>Titre de votre post <span style={{ color: "#f37021" }}>*</span></label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Récolte magnifique et livraison rapide à Douala"
                      value={reviewForm.title}
                      onChange={(e) => setReviewForm((prev) => ({ ...prev, title: e.target.value }))}
                      style={{ borderRadius: "8px" }}
                    />
                  </div>

                  <div className="agri-field-group full-width">
                    <label>Votre retour d'expérience complet <span style={{ color: "#f37021" }}>*</span></label>
                    <textarea
                      rows={3}
                      required
                      placeholder="Partagez des détails précis : état des sacs ou cageots, pesée, conformité des semences, contact avec le producteur..."
                      value={reviewForm.comment}
                      onChange={(e) => setReviewForm((prev) => ({ ...prev, comment: e.target.value }))}
                      style={{ borderRadius: "8px" }}
                    />
                  </div>
                </div>

                <div style={{ marginBottom: "16px" }}>
                  <label style={{ display: "inline-flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>
                    <input
                      type="checkbox"
                      checked={reviewForm.recommends}
                      onChange={(e) => setReviewForm((prev) => ({ ...prev, recommends: e.target.checked }))}
                      style={{ width: "17px", height: "17px", accentColor: "#0b5d33" }}
                    />
                    <span style={{ fontSize: "13px", fontWeight: 700, color: "#07331e" }}>
                      Je recommande ce produit aux autres membres du réseau
                    </span>
                  </label>
                </div>

                <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                  <button
                    type="submit"
                    disabled={reviewSubmitting}
                    style={{
                      background: "#0b5d33",
                      color: "#ffffff",
                      border: "none",
                      padding: "10px 22px",
                      fontSize: "13px",
                      fontWeight: 800,
                      textTransform: "uppercase",
                      cursor: reviewSubmitting ? "not-allowed" : "pointer",
                      borderRadius: "8px",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "6px"
                    }}
                  >
                    <Send width={15} height={15} />
                    {reviewSubmitting ? "Publication en cours..." : "Publier sur le fil"}
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowPublisherForm(false)}
                    style={{
                      background: "#f1f5f9",
                      color: "#475569",
                      border: "1px solid #cbd5e1",
                      padding: "10px 16px",
                      fontSize: "13px",
                      fontWeight: 700,
                      cursor: "pointer",
                      borderRadius: "8px"
                    }}
                  >
                    Annuler
                  </button>
                </div>
              </form>
            )}
          </section>

          {/* BARRE DE FILTRES ET ONGLETS DU FIL SOCIAL */}
          <div
            style={{
              background: "#ffffff",
              border: "1px solid #d8e2dc",
              borderRadius: "12px",
              padding: "14px 18px",
              marginBottom: "20px",
              display: "flex",
              flexDirection: "column",
              gap: "12px"
            }}
          >
            {/* Ligne 1 : Onglets d'actualité sociale sans émojis */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: "10px",
                borderBottom: "1px solid #eef2f0",
                paddingBottom: "10px"
              }}
            >
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                <button
                  type="button"
                  onClick={() => setFilterTab("feed")}
                  style={{
                    background: filterTab === "feed" ? "#0b5d33" : "#f1f5f9",
                    color: filterTab === "feed" ? "#ffffff" : "#475569",
                    border: "none",
                    padding: "7px 14px",
                    fontSize: "12.5px",
                    fontWeight: 800,
                    cursor: "pointer",
                    borderRadius: "8px",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px"
                  }}
                >
                  <FileText width={14} height={14} />
                  Fil Général ({approvedReviews.length})
                </button>

                <button
                  type="button"
                  onClick={() => setFilterTab("top")}
                  style={{
                    background: filterTab === "top" ? "#0b5d33" : "#f1f5f9",
                    color: filterTab === "top" ? "#ffffff" : "#475569",
                    border: "none",
                    padding: "7px 14px",
                    fontSize: "12.5px",
                    fontWeight: 800,
                    cursor: "pointer",
                    borderRadius: "8px",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px"
                  }}
                >
                  <Star width={14} height={14} fill={filterTab === "top" ? "#ffffff" : "#f59e0b"} color={filterTab === "top" ? "#ffffff" : "#f59e0b"} />
                  Mieux Notés (5/5)
                </button>

                <button
                  type="button"
                  onClick={() => setFilterTab("recommended")}
                  style={{
                    background: filterTab === "recommended" ? "#0b5d33" : "#f1f5f9",
                    color: filterTab === "recommended" ? "#ffffff" : "#475569",
                    border: "none",
                    padding: "7px 14px",
                    fontSize: "12.5px",
                    fontWeight: 800,
                    cursor: "pointer",
                    borderRadius: "8px",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px"
                  }}
                >
                  <ThumbsUp width={14} height={14} />
                  Les Plus Recommandés
                </button>
              </div>

              {(searchQuery || filterRating !== "Tous" || filterCategory !== "Tous" || selectedHub !== "all" || filterTab !== "feed") && (
                <button
                  type="button"
                  onClick={resetAllFilters}
                  style={{
                    background: "#fee2e2",
                    border: "1px solid #fca5a5",
                    color: "#991b1b",
                    padding: "6px 12px",
                    fontSize: "11.5px",
                    fontWeight: 800,
                    cursor: "pointer",
                    borderRadius: "8px",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "4px"
                  }}
                >
                  <RefreshCw width={12} height={12} />
                  Réinitialiser les filtres
                </button>
              )}
            </div>

            {/* Ligne 2 : Recherche en direct et filtres par note */}
            <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  background: "#f8faf9",
                  border: "1px solid #cbd5e1",
                  borderRadius: "8px",
                  padding: "8px 14px",
                  flex: 1,
                  minWidth: "220px"
                }}
              >
                <Search width={15} height={15} style={{ color: "#64748b" }} />
                <input
                  type="text"
                  placeholder="Rechercher dans les avis (ex: Foumbot, plantain, engrais NPK, Dr. Hamidou...)"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    background: "transparent",
                    border: "none",
                    outline: "none",
                    width: "100%",
                    fontSize: "13px",
                    color: "#0f172a"
                  }}
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    style={{ background: "none", border: "none", color: "#94a3b8", cursor: "pointer", padding: 0 }}
                  >
                    <X width={15} height={15} />
                  </button>
                )}
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap" }}>
                <span style={{ fontSize: "11.5px", fontWeight: 800, color: "#64748b", textTransform: "uppercase" }}>
                  Note :
                </span>
                {["Tous", "5", "4", "3"].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setFilterRating(star)}
                    className={`agri-filter-pill-btn ${filterRating === star ? "is-active" : ""}`}
                    style={{ padding: "5px 12px", fontSize: "11.5px", borderRadius: "20px" }}
                  >
                    {star === "Tous" ? (
                      "Toutes"
                    ) : (
                      <span style={{ display: "inline-flex", alignItems: "center", gap: "3px" }}>
                        {star} <Star width={12} height={12} fill="#f59e0b" color="#f59e0b" />
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* LISTE DES PUBLICATIONS ET AVIS (FIL D'ACTUALITÉS) */}
          {filteredReviews.length > 0 ? (
            <div>
              {filteredReviews.map((review) => {
                const product = products.find((p) => p.id === review.productId);
                const isLiked = !!userLikedMap[review.id];
                const likeCount = likesMap[review.id] || 0;
                const isSaved = !!savedPostsMap[review.id];
                const comments = repliesState[review.id] || [];
                const isCommentsOpen = !!expandedCommentsMap[review.id];

                return (
                  <article key={review.id} className="agri-social-post">
                    {/* Header de la publication */}
                    <div className="agri-social-post-header">
                      <div className="agri-social-post-author-box">
                        <div className="agri-social-author-avatar">
                          {(review.name || "A").slice(0, 1).toUpperCase()}
                        </div>
                        <div className="agri-social-post-meta">
                          <div className="author-name">
                            {review.name}
                            <span
                              style={{
                                color: "#0b5d33",
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "2px"
                              }}
                              title="Acheteur certifié"
                            >
                              <CheckCircle2 width={14} height={14} fill="#0b5d33" color="#ffffff" />
                            </span>
                          </div>
                          <div className="author-sub">
                            <span>{review.role || "Exploitant Agricole"}</span>
                            <span>•</span>
                            <span style={{ display: "inline-flex", alignItems: "center", gap: "3px", color: "#f37021", fontWeight: 700 }}>
                              <MapPin width={12} height={12} />
                              {review.location || "Cameroun"}
                            </span>
                            <span>•</span>
                            <span>{review.date || "Octobre 2026"}</span>
                          </div>
                        </div>
                      </div>

                      {/* Étoiles & Badge Achat vérifié */}
                      <div style={{ textAlign: "right", flexShrink: 0 }}>
                        <div style={{ color: "#f59e0b", fontSize: "14px", display: "flex", gap: "2px", justifyContent: "flex-end" }}>
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              width={15}
                              height={15}
                              fill={star <= Math.round(Number(review.rating || 5)) ? "#f59e0b" : "none"}
                              color="#f59e0b"
                            />
                          ))}
                        </div>
                        <span
                          style={{
                            fontSize: "11px",
                            fontWeight: 800,
                            color: "#0b5d33",
                            background: "#e6f3eb",
                            padding: "3px 8px",
                            display: "inline-block",
                            marginTop: "4px",
                            borderRadius: "6px"
                          }}
                        >
                          Achat Vérifié Bord-Champ
                        </span>
                      </div>
                    </div>

                    {/* Contenu de la publication */}
                    <div className="agri-social-post-body">
                      <h4 className="agri-social-post-title">{review.title}</h4>
                      <p className="agri-social-post-text">{review.comment}</p>

                      {/* Badge Recommandation Terroir */}
                      {review.recommends !== false && (
                        <div
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "6px",
                            fontSize: "12px",
                            fontWeight: 700,
                            color: "#0b5d33",
                            background: "#f0fdf4",
                            padding: "4px 10px",
                            border: "1px solid #bbf7d0",
                            borderRadius: "20px",
                            marginBottom: "12px"
                          }}
                        >
                          <ThumbsUp width={13} height={13} />
                          Recommande ce produit aux autres exploitants
                        </div>
                      )}

                      {/* Fiche Produit Associée intégrée au post */}
                      {product && (
                        <Link
                          href={`/produit/${product.id}`}
                          className="agri-social-product-card"
                          title={`Voir la fiche détaillée de ${product.name}`}
                        >
                          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                            {product.image ? (
                              <img
                                src={product.image}
                                alt={product.name}
                                className="agri-social-product-img"
                              />
                            ) : (
                              <div
                                style={{
                                  width: "58px",
                                  height: "58px",
                                  background: "#e6f3eb",
                                  borderRadius: "8px",
                                  display: "grid",
                                  placeItems: "center",
                                  color: "#0b5d33"
                                }}
                              >
                                <Sprout width={24} height={24} />
                              </div>
                            )}
                            <div>
                              <div style={{ fontSize: "13.5px", fontWeight: 800, color: "#07331e" }}>
                                {product.name}
                              </div>
                              <div style={{ fontSize: "12px", color: "#64748b", marginTop: "2px" }}>
                                Origine : <strong>{product.location || "Cameroun"}</strong> • {product.category}
                              </div>
                              <div style={{ fontSize: "13px", fontWeight: 900, color: "#f37021", marginTop: "3px" }}>
                                {money(product.price)} <span style={{ fontSize: "11px", color: "#64748b", fontWeight: 600 }}>/ {product.unit || "unité"}</span>
                              </div>
                            </div>
                          </div>

                          <span
                            style={{
                              background: "#0b5d33",
                              color: "#ffffff",
                              padding: "7px 14px",
                              fontSize: "12px",
                              fontWeight: 800,
                              borderRadius: "6px",
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "4px",
                              flexShrink: 0
                            }}
                          >
                            Consulter <ExternalLink width={12} height={12} />
                          </span>
                        </Link>
                      )}
                    </div>

                    {/* Barre d'actions sociales (J'aime, Commenter, Partager, Sauvegarder) */}
                    <div className="agri-social-actions-bar">
                      <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                        <button
                          type="button"
                          onClick={() => handleToggleLike(review.id)}
                          className={`agri-social-action-btn ${isLiked ? "is-active" : ""}`}
                        >
                          <ThumbsUp width={15} height={15} fill={isLiked ? "currentColor" : "none"} />
                          <span>{likeCount} Utile</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => toggleCommentsSection(review.id)}
                          className={`agri-social-action-btn ${isCommentsOpen ? "is-active" : ""}`}
                        >
                          <MessageSquare width={15} height={15} />
                          <span>{comments.length} Discussion{comments.length > 1 ? "s" : ""}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleSharePost(review)}
                          className="agri-social-action-btn"
                          title="Partager cette expérience"
                        >
                          <Share2 width={15} height={15} />
                          <span>Partager</span>
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleToggleBookmark(review.id)}
                        className={`agri-social-action-btn ${isSaved ? "is-active" : ""}`}
                        title="Sauvegarder pour plus tard"
                      >
                        <Bookmark width={15} height={15} fill={isSaved ? "currentColor" : "none"} />
                        <span>{isSaved ? "Enregistré" : "Sauvegarder"}</span>
                      </button>
                    </div>

                    {/* Section des commentaires et réponses de la communauté */}
                    {isCommentsOpen && (
                      <div className="agri-social-replies-section">
                        {comments.length > 0 ? (
                          <div style={{ marginBottom: "12px" }}>
                            {comments.map((rep) => (
                              <div key={rep.id} className="agri-social-reply-item">
                                <div
                                  className="agri-social-reply-avatar"
                                  style={{
                                    background: rep.isProducer ? "#f37021" : "#0b5d33"
                                  }}
                                >
                                  {rep.author.slice(0, 1).toUpperCase()}
                                </div>
                                <div className="agri-social-reply-bubble">
                                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "4px", gap: "8px" }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                                      <strong style={{ fontSize: "12.5px", color: "#07331e" }}>{rep.author}</strong>
                                      {rep.isProducer && (
                                        <span
                                          style={{
                                            background: "#fee2e2",
                                            color: "#991b1b",
                                            fontSize: "10.5px",
                                            fontWeight: 800,
                                            padding: "2px 6px",
                                            borderRadius: "4px"
                                          }}
                                        >
                                          Partenaire Officiel
                                        </span>
                                      )}
                                      <span style={{ fontSize: "11px", color: "#64748b" }}>• {rep.role}</span>
                                    </div>
                                    <span style={{ fontSize: "11px", color: "#94a3b8" }}>{rep.time}</span>
                                  </div>
                                  <div>{rep.text}</div>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div style={{ fontSize: "12.5px", color: "#64748b", marginBottom: "12px", fontStyle: "italic" }}>
                            Aucun commentaire pour le moment. Soyez le premier à poser une question ou remercier cet acheteur !
                          </div>
                        )}

                        {/* Champ d'ajout rapide d'un commentaire / question */}
                        <form
                          onSubmit={(e) => handleSendReply(review.id, e)}
                          className="agri-social-reply-input-row"
                        >
                          <div
                            style={{
                              width: "32px",
                              height: "32px",
                              background: "#07331e",
                              color: "#ffffff",
                              fontSize: "12px",
                              fontWeight: 800,
                              display: "grid",
                              placeItems: "center",
                              borderRadius: "8px",
                              flexShrink: 0
                            }}
                          >
                            {(user?.firstName || user?.name || "A").slice(0, 1).toUpperCase()}
                          </div>
                          <input
                            type="text"
                            placeholder="Répondre, demander un conseil sur la pesée ou la récolte..."
                            className="agri-social-reply-input"
                            value={replyInputMap[review.id] || ""}
                            onChange={(e) =>
                              setReplyInputMap((prev) => ({
                                ...prev,
                                [review.id]: e.target.value
                              }))
                            }
                          />
                          <button type="submit" className="agri-social-reply-submit">
                            <Send width={13} height={13} />
                            Commenter
                          </button>
                        </form>
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          ) : (
            <div
              style={{
                background: "#ffffff",
                border: "1px solid #d8e2dc",
                borderRadius: "14px",
                padding: "60px 24px",
                textAlign: "center"
              }}
            >
              <div
                style={{
                  width: "56px",
                  height: "56px",
                  background: "#f1f5f9",
                  color: "#64748b",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: "12px",
                  margin: "0 auto 16px"
                }}
              >
                <Search width={26} height={26} />
              </div>
              <h3 style={{ fontSize: "18px", fontWeight: 900, color: "#07331e", margin: "0 0 8px" }}>
                Aucune publication ne correspond à ces critères
              </h3>
              <p style={{ fontSize: "14px", color: "#64748b", maxWidth: "460px", margin: "0 auto 20px" }}>
                Aucun avis ne correspond actuellement à vos filtres. Vous pouvez réinitialiser la recherche
                ou publier le premier témoignage pour ce bassin !
              </p>
              <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
                <button
                  type="button"
                  onClick={resetAllFilters}
                  style={{
                    background: "#0b5d33",
                    color: "#ffffff",
                    border: "none",
                    padding: "10px 20px",
                    fontSize: "13px",
                    fontWeight: 800,
                    cursor: "pointer",
                    borderRadius: "8px"
                  }}
                >
                  Afficher tout le fil
                </button>
                <button
                  type="button"
                  onClick={() => setShowPublisherForm(true)}
                  style={{
                    background: "#f37021",
                    color: "#ffffff",
                    border: "none",
                    padding: "10px 20px",
                    fontSize: "13px",
                    fontWeight: 800,
                    cursor: "pointer",
                    borderRadius: "8px"
                  }}
                >
                  Publier un avis
                </button>
              </div>
            </div>
          )}
        </main>

        {/* ============================================================== */}
        {/* COLONNE DROITE : TENDANCES, TOP COOPÉRATIVES ET BAROMÈTRE      */}
        {/* ============================================================== */}
        <aside className="agri-social-right-sidebar">
          {/* Carte 1 : Baromètre de Satisfaction Terroir */}
          <div className="agri-social-card" style={{ padding: "20px" }}>
            <div
              style={{
                fontSize: "12px",
                fontWeight: 900,
                textTransform: "uppercase",
                letterSpacing: "0.5px",
                color: "#07331e",
                marginBottom: "14px",
                display: "flex",
                alignItems: "center",
                gap: "6px"
              }}
            >
              <Award width={16} height={16} style={{ color: "#f37021" }} />
              Baromètre Satisfaction Terroir
            </div>

            <div style={{ display: "flex", alignItems: "baseline", gap: "10px", marginBottom: "10px" }}>
              <span style={{ fontSize: "44px", fontWeight: 900, color: "#07331e", lineHeight: 1 }}>
                {average}
              </span>
              <div>
                <span style={{ fontSize: "16px", fontWeight: 800, color: "#94a3b8" }}>/ 5</span>
                <div style={{ color: "#f59e0b", display: "flex", gap: "2px", marginTop: "2px" }}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      width={15}
                      height={15}
                      fill={star <= Math.round(Number(average)) ? "#f59e0b" : "none"}
                      color="#f59e0b"
                    />
                  ))}
                </div>
              </div>
            </div>

            <p style={{ margin: "0 0 12px", fontSize: "13px", fontWeight: 700, color: "#07331e" }}>
              Basé sur {approvedReviews.length} avis certifiés bord-champ
            </p>

            <div
              style={{
                background: "#e6f3eb",
                color: "#0b5d33",
                padding: "8px 12px",
                fontSize: "12px",
                fontWeight: 800,
                display: "flex",
                alignItems: "center",
                gap: "6px",
                borderRadius: "8px",
                marginBottom: "16px"
              }}
            >
              <ThumbsUp width={14} height={14} />
              <span>{recommendedPercent}% recommandent nos filières</span>
            </div>

            {/* Distribution des notes cliquable */}
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              {distribution.map(({ rating, count, percentage }) => (
                <button
                  key={rating}
                  type="button"
                  onClick={() => setFilterRating(filterRating === String(rating) ? "Tous" : String(rating))}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    background: filterRating === String(rating) ? "#e6f3eb" : "transparent",
                    border: "none",
                    padding: "4px 8px",
                    cursor: "pointer",
                    textAlign: "left",
                    borderRadius: "6px",
                    transition: "background 0.15s"
                  }}
                >
                  <span style={{ width: "42px", fontSize: "11.5px", fontWeight: 800, color: "#07331e", display: "inline-flex", alignItems: "center", gap: "3px" }}>
                    {rating} <Star width={11} height={11} fill="#f59e0b" color="#f59e0b" />
                  </span>
                  <div style={{ flex: 1, height: "7px", background: "#f1f5f9", borderRadius: "10px", overflow: "hidden" }}>
                    <div
                      style={{
                        width: `${percentage}%`,
                        height: "100%",
                        background: "#0b5d33",
                        borderRadius: "10px"
                      }}
                    />
                  </div>
                  <span style={{ width: "24px", fontSize: "11px", fontWeight: 700, color: "#64748b", textAlign: "right" }}>
                    {count}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Carte 2 : Tendances du Terroir & Hashtags */}
          <div className="agri-social-card" style={{ padding: "20px" }}>
            <div
              style={{
                fontSize: "12px",
                fontWeight: 900,
                textTransform: "uppercase",
                letterSpacing: "0.5px",
                color: "#07331e",
                marginBottom: "14px",
                display: "flex",
                alignItems: "center",
                gap: "6px"
              }}
            >
              <TrendingUp width={16} height={16} style={{ color: "#0b5d33" }} />
              Tendances & Sujets Chauds
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {HASHTAG_TRENDS.map((item) => (
                <button
                  key={item.tag}
                  type="button"
                  onClick={() => setSearchQuery(item.query)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    background: "none",
                    border: "none",
                    padding: "4px 0",
                    cursor: "pointer",
                    textAlign: "left"
                  }}
                >
                  <div>
                    <span style={{ fontSize: "13px", fontWeight: 800, color: "#0b5d33" }}>
                      {item.tag}
                    </span>
                    <div style={{ fontSize: "11px", color: "#64748b" }}>
                      {item.count} avis & discussions
                    </div>
                  </div>
                  <ChevronRight width={14} height={14} style={{ color: "#94a3b8" }} />
                </button>
              ))}
            </div>
          </div>

          {/* Carte 3 : Top Coopératives & Producteurs */}
          <div className="agri-social-card" style={{ padding: "20px" }}>
            <div
              style={{
                fontSize: "12px",
                fontWeight: 900,
                textTransform: "uppercase",
                letterSpacing: "0.5px",
                color: "#07331e",
                marginBottom: "14px",
                display: "flex",
                alignItems: "center",
                gap: "6px"
              }}
            >
              <Award width={16} height={16} style={{ color: "#f37021" }} />
              Producteurs Recommandés
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {TOP_COOPERATIVES.map((coop) => (
                <div key={coop.name} style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <div
                    style={{
                      width: "38px",
                      height: "38px",
                      background: "#07331e",
                      color: "#ffffff",
                      fontSize: "13px",
                      fontWeight: 900,
                      display: "grid",
                      placeItems: "center",
                      borderRadius: "8px",
                      flexShrink: 0
                    }}
                  >
                    {coop.avatar}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        fontSize: "13px",
                        fontWeight: 800,
                        color: "#07331e",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis"
                      }}
                    >
                      {coop.name}
                    </div>
                    <div style={{ fontSize: "11px", color: "#64748b" }}>
                      {coop.location} • <strong style={{ color: "#0b5d33" }}>{coop.badge}</strong>
                    </div>
                  </div>
                  <span style={{ fontSize: "12px", fontWeight: 900, color: "#f59e0b", flexShrink: 0, display: "inline-flex", alignItems: "center", gap: "3px" }}>
                    <Star width={12} height={12} fill="#f59e0b" color="#f59e0b" /> {coop.rating}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Carte 4 : Charte Communautaire AgriMarket */}
          <div
            className="agri-social-card"
            style={{
              padding: "20px",
              background: "#07331e",
              color: "#ffffff",
              borderLeft: "4px solid #8ec72c",
              borderRadius: "12px"
            }}
          >
            <h4 style={{ margin: "0 0 8px", fontSize: "14px", fontWeight: 900, color: "#ffffff", display: "flex", alignItems: "center", gap: "6px" }}>
              <ShieldCheck width={16} height={16} style={{ color: "#8ec72c" }} />
              Charte de Transparence
            </h4>
            <p style={{ margin: 0, fontSize: "12.5px", lineHeight: 1.55, color: "#d1dcd5" }}>
              Tous les retours sont issus d'acteurs de terrain réels. Pas de faux avis, pas d'intermédiaires
              occultes : une communauté solidaire pour valoriser la production camerounaise.
            </p>
          </div>
        </aside>

      </div>
    </div>
  );
}
