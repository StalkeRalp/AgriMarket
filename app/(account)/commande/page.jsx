"use client";

import Link from "next/link";
import { ArrowRight, Banknote, Check, LockKeyhole, MapPin, ShieldCheck, Truck, UserRound, Navigation, Smartphone, AlertTriangle, RefreshCw, XCircle, CheckCircle2, Clock } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { useStore } from "@/lib/store";
import { money } from "@/lib/format";
import { useRequireAuth } from "@/composants/RequireAuth";

export default function CheckoutPage() {
  const router = useRouter();
  const { user, hydrated } = useRequireAuth("/connexion?redirect=/commande");
  const { lines, subtotal, shipping, total, checkout } = useStore();
  const [step, setStep] = useState(1);
  const [processing, setProcessing] = useState(false);
  const [phase, setPhase] = useState(0);
  const [geolocating, setGeolocating] = useState(false);
  const [geoError, setGeoError] = useState("");

  const [data, setData] = useState({
    name: "",
    phone: "",
    email: "",
    city: "Douala",
    district: "",
    address: "",
    payment: "MTN Mobile Money"
  });

  // Auto-fill logged in user info
  useEffect(() => {
    if (user) {
      setData(prev => ({
        ...prev,
        name: prev.name || user.name || `${user.firstName || ""} ${user.lastName || ""}`.trim() || "",
        email: prev.email || user.email || "",
        phone: prev.phone || user.phone || ""
      }));
    }
  }, [user]);

  const [paymentPhone, setPaymentPhone] = useState("");
  const [momoModalOpen, setMomoModalOpen] = useState(false);
  const [momoStatus, setMomoStatus] = useState("IDLE"); // IDLE, INITIATING, WAITING_PIN, SUCCESS, FAILED_TIMEOUT, FAILED_CANCELLED
  const [timeLeft, setTimeLeft] = useState(15);
  const timerRef = useRef(null);

  useEffect(() => {
    if (data.phone && !paymentPhone) {
      setPaymentPhone(data.phone);
    }
  }, [data.phone, paymentPhone]);

  useEffect(() => {
    if (momoStatus === "WAITING_PIN") {
      setTimeLeft(15);
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
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

  const update = (event) => setData((current) => ({ ...current, [event.target.name]: event.target.value }));

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
          // Reverse geocoding via OpenStreetMap Nominatim API
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
            { headers: { "Accept-Language": "fr" } }
          );
          if (response.ok) {
            const resData = await response.json();
            const addr = resData.address || {};
            const road = addr.road || addr.pedestrian || addr.suburb || addr.neighbourhood || "";
            const suburb = addr.suburb || addr.district || addr.neighbourhood || addr.city_district || "";
            const city = addr.city || addr.town || addr.village || "";
            const displayAddr = resData.display_name || "";

            setData((prev) => ({
              ...prev,
              city: city.toLowerCase().includes("yaound") ? "Yaoundé" : city.toLowerCase().includes("douala") ? "Douala" : prev.city,
              district: suburb || prev.district || road || "Quartier géolocalisé",
              address: `[GPS] ${road ? road + ", " : ""}${displayAddr} (Lat: ${latitude.toFixed(4)}, Lon: ${longitude.toFixed(4)})`
            }));
          } else {
            setData((prev) => ({
              ...prev,
              address: `Position GPS : Lat ${latitude.toFixed(5)}, Lon ${longitude.toFixed(5)}`
            }));
          }
        } catch (err) {
          console.error("Geocoding error:", err);
          setData((prev) => ({
            ...prev,
            address: `Position GPS : Lat ${latitude.toFixed(5)}, Lon ${longitude.toFixed(5)}`
          }));
        } finally {
          setGeolocating(false);
        }
      },
      (error) => {
        setGeolocating(false);
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setGeoError("Permission de géolocalisation refusée. Veuillez autoriser l'accès GPS ou saisir votre adresse manuellement.");
            break;
          case error.POSITION_UNAVAILABLE:
            setGeoError("Position GPS indisponible. Assurez-vous que le GPS est activé sur votre appareil.");
            break;
          case error.TIMEOUT:
            setGeoError("Délai d'attente de la géolocalisation dépassé. Veuillez réessayer.");
            break;
          default:
            setGeoError("Erreur lors de la récupération de la position GPS.");
        }
      },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 0 }
    );
  };

  const valid = (target) =>
    target === 1
      ? data.name && data.phone && /.+@.+\..+/.test(data.email)
      : target === 2
      ? data.district && data.address
      : true;

  const next = (target) => {
    if (!valid(step)) {
      return document
        .querySelector(`[data-checkout-step="${step}"] input:invalid, [data-checkout-step="${step}"] textarea:invalid`)
        ?.reportValidity();
    }
    setStep(target);
  };

  const startMobileMoneyPayment = () => {
    setMomoModalOpen(true);
    setMomoStatus("INITIATING");
    setTimeout(() => {
      setMomoStatus("WAITING_PIN");
    }, 1500);
  };

  const confirmMomoPayment = async () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setMomoStatus("SUCCESS");
    setTimeout(() => {
      const finalData = { ...data, phone: paymentPhone || data.phone };
      const order = checkout(finalData);
      setMomoModalOpen(false);
      router.push(`/confirmation/${order.id}`);
    }, 1500);
  };

  const cancelMomoPayment = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setMomoStatus("FAILED_CANCELLED");
  };

  const submit = async (event) => {
    event.preventDefault();
    if (!valid(1) || !valid(2)) return setStep(!valid(1) ? 1 : 2);

    const isMobileMoney = data.payment === "Orange Money" || data.payment === "MTN Mobile Money";
    if (isMobileMoney) {
      if (!paymentPhone || paymentPhone.trim().length < 8) {
        alert("Veuillez saisir un numéro de téléphone valide pour le paiement Mobile Money.");
        return;
      }
      startMobileMoneyPayment();
      return;
    }

    setProcessing(true);
    for (let i = 0; i < 3; i += 1) {
      setPhase(i);
      await new Promise((resolve) => setTimeout(resolve, 600));
    }
    const order = checkout(data);
    router.push(`/confirmation/${order.id}`);
  };

  if (!lines.length && !processing) {
    return (
      <main className="section container">
        <div className="empty-state-card">
          <h1>Votre panier est vide</h1>
          <p>Vous devez ajouter des articles à votre panier avant de passer commande.</p>
          <Link className="btn-pill-primary" href="/catalogue">
            Retour à la boutique
          </Link>
        </div>
      </main>
    );
  }

  const phases = [
    ["Sécurisation du paiement", "Connexion à la passerelle sécurisée Mobile Money…"],
    ["Validation de la commande", "Vérification des stocks et réservation du coursier…"],
    ["Commande enregistrée avec succès !", "Génération de votre bordereau de commande…"]
  ];

  return (
    <main className="checkout-page">
      <div className="container">
        {/* Breadcrumb */}
        <nav className="product-breadcrumb">
          <Link href="/">Accueil</Link>
          <span>/</span>
          <Link href="/panier">Panier</Link>
          <span>/</span>
          <strong>Commande Sécurisée</strong>
        </nav>

        {/* Checkout Hero Header */}
        <section className="checkout-hero-header">
          <span className="hero-kicker-pill">
            <LockKeyhole width={14} /> TRANSACTION 100% SÉCURISÉE
          </span>
          <h1>Finaliser votre commande</h1>
          <p>Renseignez vos coordonnées pour la livraison à domicile ou au bureau.</p>

          <div className="checkout-trust-pills">
            <span>
              <LockKeyhole width={15} /> Cryptage SSL 256 bits
            </span>
            <span>
              <Truck width={15} /> Livraison sous 24h-48h
            </span>
            <span>
              <ShieldCheck width={15} /> Service Client 7j/7
            </span>
          </div>
        </section>

        {/* Multi-Step Progress Tracker Bar */}
        <div className="checkout-steps-tracker">
          <div className="steps-line-bg">
            <div className="steps-line-fill" style={{ width: `${(step - 1) * 50}%` }} />
          </div>

          {[
            { num: 1, label: "Vos Coordonnées", desc: "Identité & Contact" },
            { num: 2, label: "Adresse de Livraison", desc: "Ville & Repère" },
            { num: 3, label: "Moyen de Paiement", desc: "MoMo, OM & Cash" }
          ].map((item) => (
            <button
              key={item.num}
              type="button"
              className={`step-node ${step === item.num ? "is-current" : step > item.num ? "is-completed" : ""}`}
              onClick={() => step > item.num && setStep(item.num)}
            >
              <div className="step-circle">{step > item.num ? <Check width={14} /> : item.num}</div>
              <div className="step-label-group">
                <strong>{item.label}</strong>
                <small>{item.desc}</small>
              </div>
            </button>
          ))}
        </div>

        {/* Main 2-Column Form Layout */}
        <form onSubmit={submit} className="checkout-main-grid">
          {/* Left Column: Interactive Form Steps */}
          <div className="checkout-form-column">
            {[
              [
                1,
                UserRound,
                "Vos informations personnelles",
                <div className="form-grid-2cols" key="one">
                  <div className="form-group-field full-width">
                    <label>Nom complet *</label>
                    <input required name="name" value={data.name} onChange={update} placeholder="Prénom et Nom" />
                  </div>
                  <div className="form-group-field">
                    <label>Numéro de Téléphone *</label>
                    <input required name="phone" value={data.phone} onChange={update} placeholder="Ex: 699 00 11 22" />
                  </div>
                  <div className="form-group-field">
                    <label>Adresse e-mail (pour le reçu) *</label>
                    <input required type="email" name="email" value={data.email} onChange={update} placeholder="votre.email@exemple.cm" />
                  </div>
                </div>
              ],
              [
                2,
                MapPin,
                "Adresse et consignes de livraison",
                <div className="form-grid-2cols" key="two">
                  <div className="form-group-field">
                    <label>Ville de livraison *</label>
                    <select name="city" value={data.city} onChange={update}>
                      <option value="Douala">Douala</option>
                      <option value="Yaoundé">Yaoundé</option>
                      <option value="Bafoussam">Bafoussam</option>
                      <option value="Garoua">Garoua</option>
                      <option value="Autre">Autre ville du Cameroun</option>
                    </select>
                  </div>
                  <div className="form-group-field">
                    <label>Quartier *</label>
                    <input required name="district" value={data.district} onChange={update} placeholder="Ex: Bonapriso, Akwa, Bastos..." />
                  </div>
                  <div className="form-group-field full-width">
                    <div className="label-with-action">
                      <label>Adresse exacte ou repère précis *</label>
                      <button 
                        type="button" 
                        className="btn-locate-me" 
                        onClick={handleLocateMe}
                        disabled={geolocating}
                      >
                        <Navigation width={13} className={geolocating ? "spin-geo" : ""} />
                        {geolocating ? "Détection GPS..." : "📍 Me géolocaliser"}
                      </button>
                    </div>
                    <textarea
                      required
                      name="address"
                      value={data.address}
                      onChange={update}
                      placeholder="Ex: Face boulangerie Z, portail vert..."
                    />
                    {geoError && <span className="geo-error-msg">{geoError}</span>}
                  </div>
                </div>
              ],
              [
                3,
                ShieldCheck,
                "Moyen de paiement sécurisé",
                <fieldset className="payment-methods-picker" key="three">
                  <legend className="visually-hidden">Choisissez votre moyen de paiement</legend>
                  {[
                    ["MTN Mobile Money", "/logo/logo-mtn.jpg", "Paiement Mobile Money instantané"],
                    ["Orange Money", "/logo/logo-orangemoney.jpg", "Paiement Orange Money rapide"],
                    ["Carte VISA", "/logo/logo-visa.png", "Carte bancaire VISA internationale"],
                    ["Carte MasterCard", "/logo/logo-mastercard.png", "Carte bancaire MasterCard sécurisée"],
                    ["Paiement à la livraison", null, "Règlement en espèces à la livraison"]
                  ].map(([name, logoPath, subtitle]) => (
                    <label
                      className={`payment-option-card ${data.payment === name ? "is-selected" : ""}`}
                      key={name}
                    >
                      <input
                        type="radio"
                        name="payment"
                        value={name}
                        checked={data.payment === name}
                        onChange={update}
                      />
                      <div className="payment-logo-badge">
                        {logoPath ? (
                          <img src={logoPath} alt={name} className="payment-img-logo" />
                        ) : (
                          <Banknote width={20} />
                        )}
                      </div>
                      <div className="payment-text-info">
                        <strong>{name}</strong>
                        <small>{subtitle}</small>
                      </div>
                      <Check className="check-select-icon" />
                    </label>
                  ))}
                </fieldset>,

                (data.payment === "Orange Money" || data.payment === "MTN Mobile Money") && (
                  <div className="momo-phone-box" key="momo-input">
                    <label>
                      <Smartphone width={16} /> Numéro de téléphone {data.payment} pour le débit *
                    </label>
                    <div className="momo-phone-input-wrap">
                      <span className="country-prefix">+237</span>
                      <input 
                        type="tel" 
                        required
                        value={paymentPhone} 
                        onChange={(e) => setPaymentPhone(e.target.value)}
                        placeholder="Ex: 699 00 11 22 ou 677 88 99 00"
                      />
                    </div>
                    <small className="momo-help-text">
                      Une notification USSD vous sera envoyée pour saisir votre code secret et autoriser le montant de {money(total)}.
                    </small>
                  </div>
                )
              ]
            ].map(([num, Icon, title, content]) => (
              <section
                key={num}
                className={`checkout-step-card ${step === num ? "is-active" : step > num ? "is-completed" : "is-disabled"}`}
                data-checkout-step={num}
              >
                <div className="card-step-header" onClick={() => step > num && setStep(num)}>
                  <div className="card-icon-wrap">
                    <Icon width={18} />
                  </div>
                  <h3>
                    Étape {num} : {title}
                  </h3>
                  {step > num && <span className="completed-tag">Modifiable</span>}
                </div>

                {step === num && (
                  <div className="card-step-body">
                    {content}

                    <div className="step-actions-bar">
                      {num > 1 && (
                        <button type="button" className="dior-btn-outline" onClick={() => setStep(num - 1)}>
                          ← Étape précédente
                        </button>
                      )}
                      {num < 3 ? (
                        <button type="button" className="dior-btn-primary" onClick={() => next(num + 1)}>
                          Continuer l'étape {num + 1} <ArrowRight width={15} />
                        </button>
                      ) : (
                        <button type="submit" className="dior-btn-primary btn-submit-order" disabled={processing}>
                          {processing ? "Traitement en cours..." : "Confirmer ma commande"} <LockKeyhole width={16} />
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </section>
            ))}
          </div>

          {/* Right Column: Order Summary Sidebar */}
          <aside className="checkout-summary-column">
            <div className="summary-sticky-card">
              <h2>Récapitulatif de Commande</h2>

              <div className="summary-items-list">
                {lines.map(({ product, quantity }) => (
                  <div className="summary-item-row" key={product.id}>
                    <img src={product.image} alt={product.name} className="summary-thumb" />
                    <div className="summary-item-text">
                      <strong>{product.name}</strong>
                      <small>
                        Qté : {quantity} × {money(product.price)}
                      </small>
                    </div>
                    <span className="summary-item-total">{money(product.price * quantity)}</span>
                  </div>
                ))}
              </div>

              <div className="summary-totals-breakdown">
                <div className="totals-row">
                  <span>Sous-total articles</span>
                  <strong>{money(subtotal)}</strong>
                </div>
                <div className="totals-row">
                  <span>Frais de livraison</span>
                  <strong>{money(shipping)}</strong>
                </div>
                <div className="totals-row grand-total">
                  <span>Total à payer</span>
                  <strong>{money(total)}</strong>
                </div>
              </div>

              <div className="summary-reassurance-box">
                <ShieldCheck width={18} />
                <span>Satisfaction ou Remboursement garanti. Produits 100% originaux.</span>
              </div>
            </div>
          </aside>
        </form>

        {/* Processing Modal Animation */}
        {processing && (
          <div className="processing-overlay">
            <div className="processing-card">
              <div className="spinner-lux" />
              <h3>{phases[phase][0]}</h3>
              <p>{phases[phase][1]}</p>
            </div>
          </div>
        )}

        {/* Mobile Money Interactive Gateway Modal */}
        {momoModalOpen && (
          <div className="processing-overlay momo-gateway-overlay">
            <div className="momo-gateway-card">
              {/* Header with Operator Logo */}
              <header className="momo-card-header">
                <div className="momo-operator-badge">
                  <img 
                    src={data.payment === "Orange Money" ? "/logo/logo-orangemoney.jpg" : "/logo/logo-mtn.jpg"} 
                    alt={data.payment} 
                  />
                  <div>
                    <h4>{data.payment} Gateway</h4>
                    <span>Paiement sécurisé instantané</span>
                  </div>
                </div>
                {momoStatus === "WAITING_PIN" && (
                  <div className="momo-timer-badge">
                    <Clock width={15} /> 00:{timeLeft < 10 ? `0${timeLeft}` : timeLeft}
                  </div>
                )}
              </header>

              {/* Status State Views */}
              {momoStatus === "INITIATING" && (
                <div className="momo-status-body">
                  <div className="spinner-lux" />
                  <h3>Initiation de la demande...</h3>
                  <p>Connexion sécurisée aux serveurs de {data.payment} pour le numéro <strong>+237 {paymentPhone}</strong>...</p>
                </div>
              )}

              {momoStatus === "WAITING_PIN" && (
                <div className="momo-status-body">
                  <div className="ussd-prompt-screen">
                    <div className="ussd-screen-header">
                      <Smartphone width={18} /> Notification USSD envoyée au +237 {paymentPhone}
                    </div>
                    <div className="ussd-screen-content">
                      <strong>ITEXAL BEAUTÉ</strong>
                      <p>Voulez-vous autoriser le paiement de <span>{money(total)}</span> ?</p>
                      <small>Saisissez votre code secret sur votre téléphone pour valider.</small>
                    </div>
                  </div>

                  <p className="momo-instruction">
                    Une demande d'autorisation est affichée sur votre téléphone. Veuillez saisir votre code PIN secret.
                  </p>

                  <div className="momo-actions-stack">
                    <button type="button" className="dior-btn-primary" onClick={confirmMomoPayment}>
                      <CheckCircle2 width={16} /> J'ai saisi mon code (Valider)
                    </button>
                    <button type="button" className="dior-btn-outline" onClick={cancelMomoPayment}>
                      <XCircle width={16} /> Annuler la transaction
                    </button>
                  </div>
                </div>
              )}

              {momoStatus === "SUCCESS" && (
                <div className="momo-status-body success">
                  <CheckCircle2 width={48} className="momo-success-icon" />
                  <h3>Paiement Confirmé !</h3>
                  <p>La transaction de {money(total)} via {data.payment} a été validée avec succès.</p>
                  <small>Redirection vers le reçu de commande...</small>
                </div>
              )}

              {(momoStatus === "FAILED_TIMEOUT" || momoStatus === "FAILED_CANCELLED") && (
                <div className="momo-status-body failed">
                  <XCircle width={48} className="momo-failed-icon" />
                  <h3>Échec de validation de paiement</h3>
                  <p className="momo-error-desc">
                    {momoStatus === "FAILED_TIMEOUT" 
                      ? "Délai d'attente (15s) dépassé sans confirmation de l'opérateur. La transaction a expiré."
                      : "La transaction a été annulée ou refusée depuis votre téléphone."}
                  </p>
                  <div className="momo-actions-stack">
                    <button type="button" className="dior-btn-primary" onClick={startMobileMoneyPayment}>
                      <RefreshCw width={15} /> Réessayer le paiement
                    </button>
                    <button type="button" className="dior-btn-outline" onClick={() => setMomoModalOpen(false)}>
                      Changer de moyen de paiement
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
