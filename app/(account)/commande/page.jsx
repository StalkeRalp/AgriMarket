"use client";

import Link from "next/link";
import { 
  ArrowRight, 
  Banknote, 
  Check, 
  LockKeyhole, 
  MapPin, 
  ShieldCheck, 
  Truck, 
  UserRound, 
  Navigation, 
  Smartphone, 
  AlertTriangle, 
  RefreshCw, 
  XCircle, 
  CheckCircle2, 
  Clock, 
  Building2, 
  PhoneCall, 
  MessageSquare, 
  Store,
  ChevronRight,
  Info
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useEffect, useRef, useMemo } from "react";
import { useStore } from "@/lib/store";
import { calculatePromoDiscount } from "@/lib/promo";
import { money } from "@/lib/format";
import { useRequireAuth } from "@/composants/RequireAuth";

// 10 Régions administratives du Cameroun
const CAMEROON_REGIONS = [
  { id: "Littoral", name: "Littoral (Douala, Edéa...)", defaultFee: 1500, freeThreshold: 25000 },
  { id: "Centre", name: "Centre (Yaoundé, Obala, Mbalmayo...)", defaultFee: 1500, freeThreshold: 25000 },
  { id: "Ouest", name: "Ouest (Bafoussam, Foumbot, Dschang...)", defaultFee: 2500, freeThreshold: 25000, discountFee: 1000 },
  { id: "Nord-Ouest", name: "Nord-Ouest (Bamenda, Kumbo...)", defaultFee: 3500, freeThreshold: 25000, discountFee: 2000 },
  { id: "Sud-Ouest", name: "Sud-Ouest (Buea, Limbe, Kumba...)", defaultFee: 3000, freeThreshold: 25000, discountFee: 1500 },
  { id: "Sud", name: "Sud (Ebolowa, Kribi, Sangmélima...)", defaultFee: 3000, freeThreshold: 25000, discountFee: 1500 },
  { id: "Adamaoua", name: "Adamaoua (Ngaoundéré, Meiganga...)", defaultFee: 3500, freeThreshold: 25000, discountFee: 2000 },
  { id: "Nord", name: "Nord (Garoua, Guider...)", defaultFee: 3500, freeThreshold: 25000, discountFee: 2000 },
  { id: "Extrême-Nord", name: "Extrême-Nord (Maroua, Kousséri...)", defaultFee: 4000, freeThreshold: 25000, discountFee: 2500 },
  { id: "Est", name: "Est (Bertoua, Batouri...)", defaultFee: 3500, freeThreshold: 25000, discountFee: 2000 }
];

// Points de retrait partenaires certifiés AgriMarket
const PICKUP_POINTS = [
  {
    id: "relay-dla-akwa",
    city: "Douala",
    name: "Point Relais AgriMarket Akwa",
    address: "Boulevard de la Liberté, face Direction Générale MTN",
    hours: "Lun - Sam : 07h30 - 18h30"
  },
  {
    id: "relay-dla-bassa",
    city: "Douala",
    name: "Comptoir Logistique Bassa - Zone Portuaire",
    address: "Carrefour Ndokoti, Entrepôt AgriMarket Cameroun",
    hours: "Lun - Sam : 07h00 - 19h00"
  },
  {
    id: "relay-yde-mvan",
    city: "Yaoundé",
    name: "Point Relais Yaoundé Mvan",
    address: "Avenue des Transports, à 100m de la gare routière Mvan",
    hours: "Lun - Sam : 07h30 - 18h30"
  },
  {
    id: "relay-yde-bastos",
    city: "Yaoundé",
    name: "Comptoir Bastos - Hall Agropastoral",
    address: "Carrefour Bastos, Immeuble Terre Fertile",
    hours: "Lun - Sam : 08h00 - 19h00"
  },
  {
    id: "relay-foumbot-coop",
    city: "Foumbot",
    name: "Magasin Central - Coopérative Maraîchère de Foumbot",
    address: "Grand Marché Vivrier, Hangar 4",
    hours: "Tous les jours : 06h30 - 17h00"
  },
  {
    id: "relay-bfm-ferme",
    city: "Bafoussam",
    name: "Dépôt Bafoussam - Ferme Avicole des Hauts Plateaux",
    address: "Sortie Bamougoum, Route Principale",
    hours: "Lun - Sam : 07h30 - 18h00"
  },
  {
    id: "relay-garoua-centre",
    city: "Garoua",
    name: "Comptoir Agropastoral du Grand Nord - Garoua",
    address: "Quartier Commercial, Boulevard Ahmadou Ahidjo",
    hours: "Lun - Sam : 07h30 - 17h30"
  }
];

export default function CheckoutPage() {
  const router = useRouter();
  const { user } = useRequireAuth("/connexion?redirect=/commande");
  const { lines, subtotal, checkout } = useStore();

  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [geolocating, setGeolocating] = useState(false);
  const [geoError, setGeoError] = useState("");
  const [appliedPromo, setAppliedPromo] = useState(null);

  useEffect(() => {
    try {
      const savedPromo = JSON.parse(sessionStorage.getItem("agrimarket.checkoutPromo") || "null");
      if (savedPromo?.code) setAppliedPromo(savedPromo);
    } catch {
      sessionStorage.removeItem("agrimarket.checkoutPromo");
    }
  }, []);

  const promoResult = appliedPromo ? calculatePromoDiscount(appliedPromo.code, lines) : { valid: false, discount: 0 };
  const promoDiscount = promoResult.valid ? promoResult.discount : 0;

  // In-App Alert Modal State (replaces native alert)
  const [alertModal, setAlertModal] = useState({ open: false, title: "", message: "" });

  const showAlert = (title, message) => {
    setAlertModal({ open: true, title, message });
  };

  const closeAlert = () => {
    setAlertModal({ open: false, title: "", message: "" });
  };

  // Form state
  const [data, setData] = useState({
    name: "",
    phone: "",
    whatsapp: "",
    email: "",
    deliveryMode: "LIVRAISON_DOMICILE", // "LIVRAISON_DOMICILE" or "RETRAIT_RELAIS"
    region: "Littoral",
    city: "Douala",
    district: "",
    address: "",
    pickupPointId: "relay-dla-akwa",
    paymentMethod: "MTN Mobile Money",
    notes: ""
  });

  // Pre-fill user data
  useEffect(() => {
    if (user) {
      const defaultName = user.name || `${user.firstName || ""} ${user.lastName || ""}`.trim() || "";
      const defaultPhone = user.phone || "";
      setData(prev => ({
        ...prev,
        name: prev.name || defaultName,
        email: prev.email || user.email || "",
        phone: prev.phone || defaultPhone,
        whatsapp: prev.whatsapp || defaultPhone
      }));
    }
  }, [user]);

  // Mobile Money gateway state
  const [paymentPhone, setPaymentPhone] = useState("");
  const [momoModalOpen, setMomoModalOpen] = useState(false);
  const [momoStatus, setMomoStatus] = useState("IDLE"); // IDLE, INITIATING, WAITING_PIN, SUCCESS, FAILED_TIMEOUT, FAILED_CANCELLED
  const [timeLeft, setTimeLeft] = useState(20);
  const timerRef = useRef(null);

  // Sync phone for MoMo / OM
  useEffect(() => {
    if (data.phone && !paymentPhone) {
      setPaymentPhone(data.phone);
    }
  }, [data.phone, paymentPhone]);

  // Countdown timer for USSD PIN confirmation
  useEffect(() => {
    if (momoStatus === "WAITING_PIN") {
      setTimeLeft(20);
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            setMomoStatus("FAILED_TIMEOUT");
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [momoStatus]);

  // Handle generic input changes
  const update = (e) => {
    const { name, value } = e.target;
    setData(prev => {
      const next = { ...prev, [name]: value };
      // Auto-sync WhatsApp if user hasn't modified it independently
      if (name === "phone" && !prev.whatsapp) {
        next.whatsapp = value;
      }
      return next;
    });
  };

  // Dynamic shipping calculation
  const calculatedShipping = useMemo(() => {
    if (data.deliveryMode === "RETRAIT_RELAIS") {
      return 0; // Always free for pickup
    }

    const reg = CAMEROON_REGIONS.find(r => r.id === data.region) || CAMEROON_REGIONS[0];
    
    // Free shipping threshold
    if (reg.freeThreshold && subtotal >= reg.freeThreshold) {
      if (reg.id === "Littoral" || reg.id === "Centre") {
        return 0; // Offerte
      }
      return reg.discountFee !== undefined ? reg.discountFee : 1000;
    }

    return reg.defaultFee;
  }, [data.deliveryMode, data.region, subtotal]);

  const finalTotal = Math.max(0, subtotal + calculatedShipping - promoDiscount);

  // Selected pickup point details
  const selectedPickup = useMemo(() => {
    return PICKUP_POINTS.find(p => p.id === data.pickupPointId) || PICKUP_POINTS[0];
  }, [data.pickupPointId]);

  // Geolocation handler
  const handleLocateMe = () => {
    if (!navigator || !navigator.geolocation) {
      setGeoError("La géolocalisation n'est pas supportée par votre navigateur.");
      return;
    }

    setGeolocating(true);
    setGeoError("");

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
            { headers: { "Accept-Language": "fr" } }
          );
          if (response.ok) {
            const resData = await response.json();
            const addr = resData.address || {};
            const road = addr.road || addr.pedestrian || addr.suburb || addr.neighbourhood || "";
            const suburb = addr.suburb || addr.district || addr.neighbourhood || addr.city_district || "";
            const cityName = addr.city || addr.town || addr.village || "";
            const displayAddr = resData.display_name || "";

            setData(prev => ({
              ...prev,
              city: cityName || prev.city,
              district: suburb || prev.district || road || "Quartier géolocalisé",
              address: `[GPS] ${road ? road + ", " : ""}${displayAddr} (Lat: ${latitude.toFixed(4)}, Lon: ${longitude.toFixed(4)})`
            }));
          } else {
            setData(prev => ({
              ...prev,
              address: `Position GPS détectée : Lat ${latitude.toFixed(5)}, Lon ${longitude.toFixed(5)}`
            }));
          }
        } catch (err) {
          console.error("Geocoding error:", err);
          setData(prev => ({
            ...prev,
            address: `Position GPS détectée : Lat ${latitude.toFixed(5)}, Lon ${longitude.toFixed(5)}`
          }));
        } finally {
          setGeolocating(false);
        }
      },
      (error) => {
        setGeolocating(false);
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setGeoError("Permission GPS refusée. Veuillez autoriser la localisation ou saisir votre repère manuellement.");
            break;
          case error.POSITION_UNAVAILABLE:
            setGeoError("Signal GPS indisponible.");
            break;
          case error.TIMEOUT:
            setGeoError("Délai de localisation dépassé.");
            break;
          default:
            setGeoError("Erreur lors de la détection GPS.");
        }
      },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 0 }
    );
  };

  // Step Validation
  const validateStep = (stepNumber) => {
    if (stepNumber === 1) {
      if (!data.name.trim()) {
        showAlert("Nom requis", "Veuillez renseigner votre nom complet pour la commande.");
        return false;
      }
      if (!data.phone.trim() || data.phone.trim().length < 8) {
        showAlert("Téléphone requis", "Veuillez renseigner un numéro de téléphone joignable au Cameroun.");
        return false;
      }
      if (!data.whatsapp.trim() || data.whatsapp.trim().length < 8) {
        showAlert("WhatsApp requis", "Veuillez renseigner votre numéro WhatsApp pour la réception de votre reçu numérique et le suivi.");
        return false;
      }
      if (!data.email.trim() || !/.+@.+\..+/.test(data.email)) {
        showAlert("Email invalide", "Veuillez renseigner une adresse email valide pour la facture.");
        return false;
      }
      return true;
    }

    if (stepNumber === 2) {
      if (data.deliveryMode === "LIVRAISON_DOMICILE") {
        if (!data.city.trim()) {
          showAlert("Ville requise", "Veuillez préciser la ville de destination au Cameroun.");
          return false;
        }
        if (!data.district.trim()) {
          showAlert("Quartier requis", "Veuillez indiquer le quartier ou la localité de livraison.");
          return false;
        }
        if (!data.address.trim()) {
          showAlert("Adresse / Repère requis", "Veuillez indiquer une adresse ou un repère précis (ex: Face Pharmacie X, portail vert).");
          return false;
        }
      } else {
        if (!data.pickupPointId) {
          showAlert("Point de retrait", "Veuillez sélectionner un point relais ou une coopérative pour le retrait.");
          return false;
        }
      }
      return true;
    }

    return true;
  };

  const handleNextStep = (targetStep) => {
    if (validateStep(step)) {
      setStep(targetStep);
      window.scrollTo({ top: 120, behavior: "smooth" });
    }
  };

  // Mobile Money payment initiation
  const startMobileMoneyFlow = () => {
    const cleanNumber = (paymentPhone || data.phone || "").trim().replace(/\s+/g, "");
    if (cleanNumber.length < 8) {
      showAlert("Numéro Mobile Money", "Veuillez renseigner un numéro valide (ex: 699 00 11 22 ou 677 88 99 00).");
      return;
    }

    setMomoModalOpen(true);
    setMomoStatus("INITIATING");

    setTimeout(() => {
      setMomoStatus("WAITING_PIN");
    }, 1400);
  };

  // Confirm Mobile Money after user validates PIN
  const confirmMomoPayment = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setMomoStatus("SUCCESS");

    setTimeout(() => {
      executeOrderCreation({
        method: data.paymentMethod === "Orange Money" ? "ORANGE_MONEY" : "MTN_MOMO",
        methodLabel: data.paymentMethod,
        accountPhone: paymentPhone || data.phone,
        status: "Confirmée",
        paymentStatus: `Payé via ${data.paymentMethod}`
      });
      setMomoModalOpen(false);
    }, 1500);
  };

  // Cancel Mobile Money
  const cancelMomoPayment = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setMomoStatus("FAILED_CANCELLED");
  };

  // Master Order Execution
  const executeOrderCreation = (paymentDetails) => {
    if (submitting) return; // Prevent double submission
    setSubmitting(true);

    try {
      const orderCustomer = {
        name: data.name,
        phone: data.phone,
        whatsapp: data.whatsapp,
        email: data.email,
        region: data.region,
        city: data.deliveryMode === "RETRAIT_RELAIS" ? selectedPickup.city : data.city,
        district: data.deliveryMode === "RETRAIT_RELAIS" ? selectedPickup.name : data.district,
        address: data.deliveryMode === "RETRAIT_RELAIS" ? `${selectedPickup.name} (${selectedPickup.address})` : data.address,
        deliveryMode: data.deliveryMode,
        pickupPoint: data.deliveryMode === "RETRAIT_RELAIS" ? `${selectedPickup.name} - ${selectedPickup.address}` : null
      };

      const order = checkout(orderCustomer, calculatedShipping, { ...paymentDetails, promoCode: promoResult.valid ? appliedPromo.code : "", discountAmount: promoDiscount });
      sessionStorage.removeItem("agrimarket.checkoutPromo");
      router.push(`/confirmation/${order.id}`);
    } catch (err) {
      console.error("Order creation error:", err);
      showAlert("Erreur lors de la validation", err.message || "Une erreur est survenue lors de la commande.");
      setSubmitting(false);
    }
  };

  // Form Submit Handler
  const handleSubmitOrder = (e) => {
    e.preventDefault();

    if (!validateStep(1)) {
      setStep(1);
      return;
    }
    if (!validateStep(2)) {
      setStep(2);
      return;
    }

    // MTN MoMo or Orange Money
    if (data.paymentMethod === "MTN Mobile Money" || data.paymentMethod === "Orange Money") {
      startMobileMoneyFlow();
      return;
    }

    // Bank Transfer
    if (data.paymentMethod === "Virement bancaire / Dépôt guichet") {
      executeOrderCreation({
        method: "BANK_TRANSFER",
        methodLabel: "Virement Bancaire / Dépôt Guichet (Afriland First Bank)",
        status: "En attente de paiement",
        paymentStatus: "En attente de virement bancaire"
      });
      return;
    }

    // Cash on Delivery / Pickup
    executeOrderCreation({
      method: "CASH_ON_DELIVERY",
      methodLabel: data.deliveryMode === "RETRAIT_RELAIS" ? "Paiement en espèces au retrait" : "Paiement en espèces à la livraison",
      status: "Confirmée",
      paymentStatus: "À régler à la réception (Espèces)"
    });
  };

  // Empty cart guard
  if (!lines.length && !submitting) {
    return (
      <main className="agri-checkout-container agri-checkout-container--empty">
        <div className="agri-form-card" style={{ padding: "60px 30px", textAlign: "center" }}>
          <div style={{ width: 64, height: 64, background: "#f2f8f4", color: "#0b5d33", display: "grid", placeItems: "center", margin: "0 auto 20px" }}>
            <Store width={32} height={32} />
          </div>
          <h1 style={{ fontSize: "24px", color: "#07331e", margin: "0 0 10px", fontWeight: 800 }}>Votre panier est vide</h1>
          <p style={{ color: "#64748b", maxWidth: "460px", margin: "0 auto 24px", fontSize: "14px" }}>
            Vous n'avez pas encore d'articles agricoles dans votre panier pour passer commande.
          </p>
          <Link href="/catalogue" className="agri-btn-next" style={{ display: "inline-flex", textDecoration: "none" }}>
            Découvrir le catalogue agropastoral <ArrowRight width={16} />
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="agri-checkout-container">
      {/* Breadcrumb */}
      <nav className="agri-checkout-breadcrumb">
        <Link href="/">Accueil</Link>
        <span className="sep">/</span>
        <Link href="/panier">Panier</Link>
        <span className="sep">/</span>
        <strong>Finalisation de Commande Sécurisée</strong>
      </nav>

      {/* Hero Header */}
      <section className="agri-checkout-hero">
        <span className="agri-checkout-hero-kicker">
          <LockKeyhole width={13} /> Votre commande AgriMarket
        </span>
        <h1>Finaliser votre commande agropastorale</h1>
        <p>
          Indiquez vos coordonnées, choisissez votre mode de réception et vérifiez les modalités affichées avant de confirmer votre commande.
        </p>

        <div className="agri-checkout-trust-badges">
          <div className="agri-checkout-trust-badge">
            <ShieldCheck width={15} /> Informations produit et vendeur
          </div>
          <div className="agri-checkout-trust-badge">
            <Truck width={15} /> Livraison selon la zone desservie
          </div>
          <div className="agri-checkout-trust-badge">
            <MessageSquare width={15} /> Suivi depuis votre compte
          </div>
          <div className="agri-checkout-trust-badge">
            <LockKeyhole width={15} /> Options de paiement disponibles
          </div>
        </div>
      </section>

      {/* 3-Step Interactive Tracker */}
      <nav className="agri-stepper-bar" aria-label="Étapes de la commande">
        {[
          { num: 1, title: "1. Coordonnées Client", desc: "Contact, Téléphone & WhatsApp" },
          { num: 2, title: "2. Réception & Destination", desc: "Livraison à domicile ou Retrait" },
          { num: 3, title: "3. Règlement Sécurisé", desc: "MoMo, Orange Money ou Virement" }
        ].map(item => (
          <button
            key={item.num}
            type="button"
            className={`agri-stepper-node ${step === item.num ? "is-active" : step > item.num ? "is-done" : ""}`}
            onClick={() => step > item.num && setStep(item.num)}
          >
            <div className="agri-stepper-num">
              {step > item.num ? <Check width={18} /> : item.num}
            </div>
            <div className="agri-stepper-info">
              <strong>{item.title}</strong>
              <small>{item.desc}</small>
            </div>
          </button>
        ))}
      </nav>

      {/* Main Form + Sidebar Layout */}
      <form onSubmit={handleSubmitOrder} className="agri-checkout-grid">
        {/* Left Column: Multi-step interactive sections */}
        <div className="agri-form-sections-column">
          
          {/* Étape 1 : Coordonnées */}
          <section className="agri-form-card" data-checkout-step="1">
            <div className="agri-form-card-header" onClick={() => step > 1 && setStep(1)}>
              <div className="agri-form-card-title">
                <div className="icon-wrap">
                  <UserRound width={18} />
                </div>
                <h3>Étape 1 : Vos Coordonnées Personnelles & Contact</h3>
              </div>
              {step > 1 && <span className="agri-card-step-badge">Modifier</span>}
            </div>

            {step === 1 && (
              <div className="agri-form-card-body">
                <div className="agri-fields-grid">
                  <div className="agri-field-group full-width">
                    <label>Nom et Prénom du Destinataire <span className="required">*</span></label>
                    <input 
                      type="text" 
                      required 
                      name="name" 
                      value={data.name} 
                      onChange={update} 
                      placeholder="Ex: Jean Paul Mbarga" 
                    />
                  </div>

                  <div className="agri-field-group">
                    <label>Téléphone d'Appel Direct <span className="required">*</span></label>
                    <div className="agri-phone-input-wrap">
                      <span className="agri-phone-prefix">🇨🇲 +237</span>
                      <input 
                        type="tel" 
                        required 
                        name="phone" 
                        value={data.phone} 
                        onChange={update} 
                        placeholder="699 00 11 22" 
                      />
                    </div>
                    <span className="agri-field-help">Pour que le transporteur puisse vous joindre lors de la remise.</span>
                  </div>

                  <div className="agri-field-group">
                    <label>Numéro WhatsApp Dédié <span className="required">*</span></label>
                    <div className="agri-phone-input-wrap">
                      <span className="agri-phone-prefix">💬 +237</span>
                      <input 
                        type="tel" 
                        required 
                        name="whatsapp" 
                        value={data.whatsapp} 
                        onChange={update} 
                        placeholder="677 88 99 00" 
                      />
                    </div>
                    <div className="agri-whatsapp-pill-badge">
                      <Check width={12} /> Réception instantanée du reçu et du lien de suivi
                    </div>
                  </div>

                  <div className="agri-field-group full-width">
                    <label>Adresse E-mail (Facturation & Reçu) <span className="required">*</span></label>
                    <input 
                      type="email" 
                      required 
                      name="email" 
                      value={data.email} 
                      onChange={update} 
                      placeholder="client@domaine.cm" 
                    />
                  </div>
                </div>

                <div className="agri-step-actions-bar" style={{ justifyContent: "flex-end" }}>
                  <button type="button" className="agri-btn-next" onClick={() => handleNextStep(2)}>
                    Continuer vers la réception <ArrowRight width={16} />
                  </button>
                </div>
              </div>
            )}
          </section>

          {/* Étape 2 : Livraison vs Retrait */}
          <section className="agri-form-card" data-checkout-step="2">
            <div className="agri-form-card-header" onClick={() => step > 2 && setStep(2)}>
              <div className="agri-form-card-title">
                <div className="icon-wrap">
                  <MapPin width={18} />
                </div>
                <h3>Étape 2 : Mode de Réception & Destination</h3>
              </div>
              {step > 2 && <span className="agri-card-step-badge">Modifier</span>}
            </div>

            {step === 2 && (
              <div className="agri-form-card-body">
                {/* Mode Selector Toggle */}
                <div className="agri-delivery-mode-selector">
                  <label className={`agri-mode-option-card ${data.deliveryMode === "LIVRAISON_DOMICILE" ? "is-selected" : ""}`}>
                    <input 
                      type="radio" 
                      name="deliveryMode" 
                      value="LIVRAISON_DOMICILE" 
                      checked={data.deliveryMode === "LIVRAISON_DOMICILE"} 
                      onChange={update} 
                    />
                    <div className="agri-mode-content">
                      <strong>Livraison à domicile / exploitation</strong>
                      <p>Expédition directe à votre adresse ou ferme agricole via nos partenaires logistiques certifiés.</p>
                      <span className="agri-mode-tag tag-calculated">
                        Dès {money(calculatedShipping)}
                      </span>
                    </div>
                  </label>

                  <label className={`agri-mode-option-card ${data.deliveryMode === "RETRAIT_RELAIS" ? "is-selected" : ""}`}>
                    <input 
                      type="radio" 
                      name="deliveryMode" 
                      value="RETRAIT_RELAIS" 
                      checked={data.deliveryMode === "RETRAIT_RELAIS"} 
                      onChange={update} 
                    />
                    <div className="agri-mode-content">
                      <strong>Retrait en point relais agropastoral</strong>
                      <p>Récupérez votre commande sans frais dans nos comptoirs et coopératives partenaires.</p>
                      <span className="agri-mode-tag tag-free">
                        0 FCFA (Gratuit)
                      </span>
                    </div>
                  </label>
                </div>

                {/* Sub-form A : Home / Farm Delivery */}
                {data.deliveryMode === "LIVRAISON_DOMICILE" && (
                  <div className="agri-fields-grid">
                    <div className="agri-field-group">
                      <label>Région du Cameroun <span className="required">*</span></label>
                      <select name="region" value={data.region} onChange={update}>
                        {CAMEROON_REGIONS.map(reg => (
                          <option key={reg.id} value={reg.id}>{reg.name}</option>
                        ))}
                      </select>
                      <span className="agri-field-help">
                        Frais adaptés : {money(calculatedShipping)}
                        {calculatedShipping === 0 && " (Offerte pour votre panier !)"}
                      </span>
                    </div>

                    <div className="agri-field-group">
                      <label>Ville de Destination <span className="required">*</span></label>
                      <input 
                        type="text" 
                        required 
                        name="city" 
                        value={data.city} 
                        onChange={update} 
                        placeholder="Ex: Douala, Yaoundé, Bafoussam..." 
                      />
                    </div>

                    <div className="agri-field-group full-width">
                      <label>Quartier / Localité / Zone Rurale <span className="required">*</span></label>
                      <input 
                        type="text" 
                        required 
                        name="district" 
                        value={data.district} 
                        onChange={update} 
                        placeholder="Ex: Bonapriso, Bastos, Carrefour Total, Zone Agricole..." 
                      />
                    </div>

                    <div className="agri-field-group full-width">
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                        <label style={{ margin: 0 }}>Adresse Exacte ou Repère Précis <span className="required">*</span></label>
                        <button 
                          type="button" 
                          className="agri-btn-locate" 
                          onClick={handleLocateMe}
                          disabled={geolocating}
                        >
                          <Navigation width={13} className={geolocating ? "spin-geo" : ""} />
                          {geolocating ? "Localisation GPS..." : "📍 Utiliser ma position GPS"}
                        </button>
                      </div>
                      <textarea 
                        required 
                        rows={3} 
                        name="address" 
                        value={data.address} 
                        onChange={update} 
                        placeholder="Ex: Face Boulangerie Z, portail vert à côté de la pharmacie, ou coordonnées GPS..." 
                      />
                      {geoError && (
                        <span style={{ color: "#dc2626", fontSize: "12px", marginTop: "4px", display: "block" }}>
                          {geoError}
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Sub-form B : Relay Point / Cooperative Pickup */}
                {data.deliveryMode === "RETRAIT_RELAIS" && (
                  <div>
                    <p style={{ fontSize: "13px", color: "#475569", margin: "0 0 12px" }}>
                      Sélectionnez le comptoir ou la coopérative où vous souhaitez retirer vos colis :
                    </p>
                    <div className="agri-pickup-points-grid">
                      {PICKUP_POINTS.map(point => (
                        <label 
                          key={point.id} 
                          className={`agri-pickup-point-card ${data.pickupPointId === point.id ? "is-selected" : ""}`}
                        >
                          <input 
                            type="radio" 
                            name="pickupPointId" 
                            value={point.id} 
                            checked={data.pickupPointId === point.id} 
                            onChange={update} 
                            style={{ accentColor: "#0b5d33", marginTop: 3 }}
                          />
                          <div className="agri-pickup-point-info">
                            <strong>{point.name} — {point.city}</strong>
                            <small>📍 {point.address}</small>
                            <small style={{ color: "#0b5d33", fontWeight: 700 }}>🕒 {point.hours}</small>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                <div className="agri-step-actions-bar">
                  <button type="button" className="agri-btn-prev" onClick={() => setStep(1)}>
                    ← Étape précédente
                  </button>
                  <button type="button" className="agri-btn-next" onClick={() => handleNextStep(3)}>
                    Continuer vers le paiement <ArrowRight width={16} />
                  </button>
                </div>
              </div>
            )}
          </section>

          {/* Étape 3 : Moyen de Paiement */}
          <section className="agri-form-card" data-checkout-step="3">
            <div className="agri-form-card-header">
              <div className="agri-form-card-title">
                <div className="icon-wrap">
                  <ShieldCheck width={18} />
                </div>
                <h3>Étape 3 : Moyen de Paiement Sécurisé au Cameroun</h3>
              </div>
            </div>

            {step === 3 && (
              <div className="agri-form-card-body">
                <div className="agri-payment-methods-stack">
                  {[
                    {
                      id: "MTN Mobile Money",
                      logo: "/logo/logo-mtn.jpg",
                      name: "MTN Mobile Money (MoMo)",
                      desc: "Débit push USSD direct (*126#). Confirmation immédiate sur votre téléphone.",
                      tag: "Instantané"
                    },
                    {
                      id: "Orange Money",
                      logo: "/logo/logo-orangemoney.jpg",
                      name: "Orange Money (OM)",
                      desc: "Débit push USSD direct (#150#). Validation instantanée par code PIN.",
                      tag: "Instantané"
                    },
                    {
                      id: "Virement bancaire / Dépôt guichet",
                      logo: null,
                      icon: Building2,
                      name: "Virement Bancaire / Dépôt Guichet",
                      desc: "Afriland First Bank, Ecobank, UBA. Commande réservée en attente de validation.",
                      tag: "Sur Bordereau"
                    },
                    {
                      id: "Paiement à la livraison",
                      logo: null,
                      icon: Banknote,
                      name: data.deliveryMode === "RETRAIT_RELAIS" ? "Paiement en espèces au retrait" : "Paiement en espèces à la livraison",
                      desc: "Règlement en mains propres à la réception après vérification de vos colis.",
                      tag: "Cash à réception"
                    }
                  ].map(m => (
                    <label 
                      key={m.id} 
                      className={`agri-payment-method-card ${data.paymentMethod === m.id ? "is-selected" : ""}`}
                    >
                      <input 
                        type="radio" 
                        name="paymentMethod" 
                        value={m.id} 
                        checked={data.paymentMethod === m.id} 
                        onChange={update} 
                      />
                      <div className="agri-payment-logo-box">
                        {m.logo ? (
                          <img src={m.logo} alt={m.name} />
                        ) : (
                          <m.icon width={22} style={{ color: "#0b5d33" }} />
                        )}
                      </div>
                      <div className="agri-payment-details">
                        <strong>{m.name}</strong>
                        <small>{m.desc}</small>
                      </div>
                      <span className="agri-payment-badge-pill">{m.tag}</span>
                    </label>
                  ))}
                </div>

                {/* Sub-view: Mobile Money Phone Input Box */}
                {(data.paymentMethod === "MTN Mobile Money" || data.paymentMethod === "Orange Money") && (
                  <div style={{ marginTop: 20, padding: 18, background: "#f8faf9", border: "1px solid #d1dcd5" }}>
                    <label style={{ display: "block", fontSize: "12px", fontWeight: 800, color: "#07331e", textTransform: "uppercase", marginBottom: 6 }}>
                      <Smartphone width={14} style={{ verticalAlign: "middle", marginRight: 6 }} />
                      Numéro {data.paymentMethod} à débiter pour {money(finalTotal)} <span className="required">*</span>
                    </label>
                    <div className="agri-phone-input-wrap">
                      <span className="agri-phone-prefix">🇨🇲 +237</span>
                      <input 
                        type="tel" 
                        value={paymentPhone} 
                        onChange={(e) => setPaymentPhone(e.target.value)} 
                        placeholder="Ex: 699 00 11 22 ou 677 88 99 00" 
                        style={{ background: "#ffffff" }}
                      />
                    </div>
                    <small style={{ color: "#64748b", fontSize: "12px", marginTop: 4, display: "block" }}>
                      Une invite USSD sécurisée vous sera transmise pour autoriser le montant exact de {money(finalTotal)}.
                    </small>
                  </div>
                )}

                {/* Sub-view: Bank Transfer Information Box */}
                {data.paymentMethod === "Virement bancaire / Dépôt guichet" && (
                  <div className="agri-bank-transfer-box">
                    <h4>Coordonnées Bancaires Officielles AgriMarket Cameroun</h4>
                    <p>
                      Votre commande sera immédiatement enregistrée avec le statut <strong>« En attente de paiement »</strong>. Veuillez effectuer le virement ou dépôt sous 48h :
                    </p>
                    <ul>
                      <li><strong>Banque :</strong> Afriland First Bank Cameroun</li>
                      <li><strong>Titulaire :</strong> AGRIMARKET SARL — COOPÉRATIVE AGROPASTORALE</li>
                      <li><strong>RIB / Compte :</strong> 10005 00012 01234567890 45</li>
                      <li><strong>Motif obligatoire :</strong> Référence de votre commande (générée après validation)</li>
                    </ul>
                  </div>
                )}

                {/* Notes additionnelles */}
                <div style={{ marginTop: 20 }}>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 800, color: "#1e293b", textTransform: "uppercase", marginBottom: 6 }}>
                    Instructions particulières pour le transporteur (Optionnel)
                  </label>
                  <textarea 
                    name="notes" 
                    rows={2} 
                    value={data.notes} 
                    onChange={update} 
                    placeholder="Ex: Précision sur les horaires de livraison, personne à contacter en cas d'absence..." 
                  />
                </div>

                <div className="agri-step-actions-bar">
                  <button type="button" className="agri-btn-prev" onClick={() => setStep(2)}>
                    ← Étape précédente
                  </button>
                  <button 
                    type="submit" 
                    className="agri-btn-submit-order" 
                    disabled={submitting}
                  >
                    {submitting ? "Traitement sécurisé en cours..." : "Confirmer et Régler ma Commande"}
                    <LockKeyhole width={16} />
                  </button>
                </div>
              </div>
            )}
          </section>

        </div>

        {/* Right Column: Order Summary Sidebar */}
        <aside className="agri-checkout-sidebar">
          <div className="agri-summary-sticky">
            <h2>Récapitulatif de Commande</h2>

            <div className="agri-summary-items-scroll">
              {lines.map(({ product, quantity }) => (
                <div className="agri-summary-item-card" key={product.id}>
                  <img src={product.image} alt={product.name} className="agri-summary-item-thumb" />
                  <div className="agri-summary-item-meta">
                    <strong>{product.name}</strong>
                    <small>
                      {quantity} {product.unit || "unité"} × {money(product.price)}
                    </small>
                    <small style={{ color: "#0b5d33" }}>📍 {product.location || "Cameroun"}</small>
                  </div>
                  <span className="agri-summary-item-price">{money(product.price * quantity)}</span>
                </div>
              ))}
            </div>

            {/* Threshold Notice */}
            {calculatedShipping === 0 && data.deliveryMode === "LIVRAISON_DOMICILE" ? (
              <div className="agri-free-shipping-notice">
                <CheckCircle2 width={16} />
                <span>Félicitations ! Livraison offerte pour votre commande dès 25 000 FCFA.</span>
              </div>
            ) : data.deliveryMode === "RETRAIT_RELAIS" ? (
              <div className="agri-free-shipping-notice">
                <Store width={16} />
                <span>Retrait gratuit en comptoir / coopérative partenaire.</span>
              </div>
            ) : (
              <div className="agri-free-shipping-notice" style={{ background: "#fff7ed", borderColor: "#fed7aa", color: "#c2410c" }}>
                <Info width={16} />
                <span>Livraison offerte dès 25 000 FCFA d'achats à Douala et Yaoundé.</span>
              </div>
            )}

            <div className="agri-summary-totals-breakdown">
              <div className="agri-summary-total-row">
                <span>Sous-total articles</span>
                <strong>{money(subtotal)}</strong>
              </div>
              <div className={`agri-summary-total-row ${calculatedShipping === 0 ? "free-badge" : ""}`}>
                <span>Frais d'acheminement</span>
                <strong>{calculatedShipping === 0 ? "Gratuit (0 FCFA)" : money(calculatedShipping)}</strong>
              </div>
              {promoDiscount > 0 && <div className="agri-summary-total-row agri-discount-line"><span>Code promo ({appliedPromo.code})</span><strong>-{money(promoDiscount)}</strong></div>}
              <div className="agri-summary-total-row grand-total">
                <span>Total Net à Payer</span>
                <strong>{money(finalTotal)}</strong>
              </div>
            </div>

            <div className="agri-summary-reassurance">
              <ShieldCheck width={20} />
              <span>
                Circuit court garanti. Vos achats rémunèrent équitablement les producteurs et coopératives agricoles du Cameroun.
              </span>
            </div>
          </div>
        </aside>
      </form>

      {/* Interactive Mobile Money Push USSD Simulation Modal */}
      {momoModalOpen && (
        <div className="agri-ussd-overlay">
          <div className="agri-ussd-card">
            <header className="agri-ussd-card-header">
              <div className="agri-ussd-operator">
                <img 
                  src={data.paymentMethod === "Orange Money" ? "/logo/logo-orangemoney.jpg" : "/logo/logo-mtn.jpg"} 
                  alt={data.paymentMethod} 
                />
                <div>
                  <h4>{data.paymentMethod}</h4>
                  <span>Paiement USSD Sécurisé Cameroun</span>
                </div>
              </div>
              {momoStatus === "WAITING_PIN" && (
                <div className="agri-ussd-timer">
                  <Clock width={13} /> 00:{timeLeft < 10 ? `0${timeLeft}` : timeLeft}
                </div>
              )}
            </header>

            <div className="agri-ussd-card-body">
              {momoStatus === "INITIATING" && (
                <div className="agri-ussd-loading-state">
                  <div className="spin-geo" style={{ width: 44, height: 44, border: "3px solid #0b5d33", borderTopColor: "transparent", margin: "16px auto" }} />
                  <h3 style={{ fontSize: 17, color: "#07331e", margin: "12px 0 6px" }}>Connexion sécurisée à l'opérateur...</h3>
                  <p style={{ fontSize: 13, color: "#64748b", margin: 0 }}>
                    Envoi de la demande de prélèvement de <strong>{money(finalTotal)}</strong> vers le numéro <strong>+237 {paymentPhone}</strong>.
                  </p>
                </div>
              )}

              {momoStatus === "WAITING_PIN" && (
                <div>
                  {/* Clean mobile notification & USSD prompt card (No navy terminal/hacker palette!) */}
                  <div className="agri-ussd-phone-dialog">
                    <div className="ussd-phone-header">
                      <div className="ussd-phone-header-left">
                        <Smartphone width={15} />
                        <span>Invite Opérateur {data.paymentMethod === "Orange Money" ? "#150#" : "*126#"}</span>
                      </div>
                      <span className="ussd-phone-badge">En attente PIN</span>
                    </div>

                    <div className="ussd-phone-content">
                      <span className="ussd-phone-label">Montant de la commande</span>
                      <div className="ussd-phone-amount">{money(finalTotal)}</div>
                      
                      <div className="ussd-phone-breakdown">
                        <div className="breakdown-row">
                          <span>Marchand agréé</span>
                          <strong>AGRIMARKET CAMEROUN</strong>
                        </div>
                        <div className="breakdown-row">
                          <span>Compte débité</span>
                          <strong>+237 {paymentPhone}</strong>
                        </div>
                        <div className="breakdown-row">
                          <span>Objet</span>
                          <span>Paiement Commande Agropastorale</span>
                        </div>
                      </div>

                      <div className="ussd-phone-instruction-box">
                        <LockKeyhole width={14} />
                        <span>Saisissez votre code PIN secret sur le clavier de votre téléphone</span>
                      </div>
                    </div>
                  </div>

                  <p className="agri-ussd-instruction">
                    Une notification USSD s'est affichée sur votre téléphone. Veuillez valider avec votre code secret, puis cliquez sur le bouton ci-dessous.
                  </p>

                  <div className="agri-ussd-actions-stack">
                    <button type="button" className="agri-ussd-btn-confirm" onClick={confirmMomoPayment}>
                      <CheckCircle2 width={17} /> J'ai validé mon code secret
                    </button>
                    <button type="button" className="agri-ussd-btn-cancel" onClick={cancelMomoPayment}>
                      <XCircle width={15} /> Annuler la transaction
                    </button>
                  </div>
                </div>
              )}

              {momoStatus === "SUCCESS" && (
                <div className="agri-ussd-status-block">
                  <div className="ussd-status-icon-wrap is-success">
                    <CheckCircle2 width={44} height={44} />
                  </div>
                  <h3 style={{ fontSize: 18, color: "#07331e", margin: "14px 0 6px" }}>Paiement Confirmé avec Succès !</h3>
                  <p style={{ fontSize: 13, color: "#475569", margin: "0 0 10px" }}>
                    La transaction de <strong>{money(finalTotal)}</strong> a été validée par {data.paymentMethod}.
                  </p>
                  <small style={{ color: "#64748b" }}>Finalisation et génération de votre reçu...</small>
                </div>
              )}

              {(momoStatus === "FAILED_TIMEOUT" || momoStatus === "FAILED_CANCELLED") && (
                <div className="agri-ussd-status-block">
                  <div className="ussd-status-icon-wrap is-failed">
                    <XCircle width={44} height={44} />
                  </div>
                  <h3 style={{ fontSize: 18, color: "#991b1b", margin: "14px 0 8px" }}>Transaction Non Validée</h3>
                  <p style={{ fontSize: 13, color: "#64748b", margin: "0 0 20px", lineHeight: 1.5 }}>
                    {momoStatus === "FAILED_TIMEOUT" 
                      ? "Le délai d'attente de saisie du code PIN a expiré. Aucun montant n'a été débité de votre compte."
                      : "La transaction a été annulée. Votre compte n'a pas été débité."}
                  </p>
                  <div className="agri-ussd-actions-stack">
                    <button type="button" className="agri-ussd-btn-confirm" onClick={startMobileMoneyFlow}>
                      <RefreshCw width={15} /> Réessayer le débit
                    </button>
                    <button type="button" className="agri-ussd-btn-cancel" onClick={() => setMomoModalOpen(false)}>
                      Changer de moyen de paiement
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Custom In-App Alert / Warning Modal (Zero Native Alerts) */}
      {alertModal.open && (
        <div className="agri-modal-alert-overlay" onClick={closeAlert}>
          <div className="agri-modal-alert-card" onClick={(e) => e.stopPropagation()}>
            <h3>
              <AlertTriangle width={20} style={{ color: "#f37021" }} />
              {alertModal.title}
            </h3>
            <p>{alertModal.message}</p>
            <button type="button" className="agri-modal-alert-btn" onClick={closeAlert}>
              Compris
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
