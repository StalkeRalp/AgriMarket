"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { 
  Search, 
  CheckCircle2, 
  Truck, 
  Package, 
  Clock, 
  ShieldCheck, 
  Download, 
  ArrowRight, 
  MapPin, 
  Sparkles, 
  Store, 
  MessageSquare, 
  AlertCircle,
  XCircle,
  HelpCircle
} from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useStore } from "@/lib/store";
import { dateFr, money } from "@/lib/format";
import { generateReceiptPDF } from "@/lib/pdfReceipt";

const DEFAULT_AGRI_ORDER = {
  id: "AGRI-2026-8942",
  createdAt: "2026-08-12T14:20:00.000Z",
  status: "En cours de livraison",
  statusCode: "in_transit",
  currentStepIndex: 5,
  total: 26000,
  subtotal: 24500,
  shipping: 1500,
  deliveryMode: "LIVRAISON_DOMICILE",
  name: "Lelica Ange",
  phone: "+237 677 88 99 00",
  whatsapp: "+237 677 88 99 00",
  email: "lelicaange@gmail.com",
  region: "Littoral",
  city: "Douala",
  district: "Bonapriso",
  address: "Avenue De Gaulle, Immeuble Horizon Vert",
  paymentMethod: "MTN Mobile Money",
  paymentStatus: "Payé via MTN Mobile Money",
  items: [
    {
      id: "p-vivrier-01",
      name: "Régime de plantain corne fort de première récolte",
      brand: "GIC Vivrier d’Obala",
      origin: "Obala (Centre)",
      unit: "régime",
      price: 4500,
      quantity: 3,
      image: "https://images.pexels.com/photos/2872755/pexels-photo-2872755.jpeg?auto=compress&w=900"
    },
    {
      id: "p-elevage-01",
      name: "Alvéole de 30 œufs frais calibre Gros",
      brand: "Ferme Avicole des Hauts Plateaux",
      origin: "Bafoussam (Ouest)",
      unit: "alvéole",
      price: 2200,
      quantity: 5,
      image: "https://images.pexels.com/photos/162712/egg-white-food-protein-162712.jpeg?auto=compress&w=900"
    }
  ]
};

// 6 chronological agropastoral stages
const TRACKING_STEPS = [
  { index: 1, key: "pending_payment", label: "En attente", desc: "Paiement / Virement" },
  { index: 2, key: "confirmed", label: "Confirmée", desc: "Commande validée" },
  { index: 3, key: "preparing", label: "En préparation", desc: "Récolte & Conditionnement" },
  { index: 4, key: "shipped", label: "Expédiée", desc: "Transit logistique" },
  { index: 5, key: "in_transit", label: "En livraison", desc: "Coursier en route" },
  { index: 6, key: "delivered", label: "Livrée", desc: "Colis réceptionné" }
];

export default function SuiviCommandePage() {
  const searchParams = useSearchParams();
  const initialCode = searchParams.get("code") || "";
  const { orders } = useStore();

  const [query, setQuery] = useState(initialCode);
  const [searchedOrder, setSearchedOrder] = useState(null);
  const [searched, setSearched] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSearchCode = (codeToSearch) => {
    const clean = codeToSearch.trim();
    if (!clean) return;
    setSearched(true);
    setErrorMessage("");

    const cleanLower = clean.toLowerCase();
    const found = orders?.find(o => 
      o.id.toLowerCase() === cleanLower ||
      (o.customer?.phone && o.customer.phone.includes(clean)) ||
      (o.phone && o.phone.includes(clean)) ||
      (o.customer?.email && o.customer.email.toLowerCase() === cleanLower)
    );

    if (found) {
      setSearchedOrder(found);
    } else if (clean.toUpperCase().startsWith("AGRI-") || clean.toUpperCase().startsWith("CMD-")) {
      setSearchedOrder({
        ...DEFAULT_AGRI_ORDER,
        id: clean.toUpperCase()
      });
    } else {
      setSearchedOrder(null);
    }
  };

  useEffect(() => {
    if (initialCode) {
      setQuery(initialCode);
      handleSearchCode(initialCode);
    } else if (orders && orders.length > 0) {
      setSearchedOrder(orders[0]);
    } else {
      setSearchedOrder(DEFAULT_AGRI_ORDER);
    }
  }, [initialCode, orders]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    handleSearchCode(query);
  };

  // Determine current active step index (1 to 6)
  const currentStepIndex = useMemo(() => {
    if (!searchedOrder) return 2;
    if (searchedOrder.currentStepIndex) return searchedOrder.currentStepIndex;

    const s = (searchedOrder.status || "").toLowerCase();
    if (s.includes("attente")) return 1;
    if (s.includes("confirm")) return 2;
    if (s.includes("préparation") || s.includes("preparation")) return 3;
    if (s.includes("expédi") || s.includes("expedi")) return 4;
    if (s.includes("cours") || s.includes("livraison")) return 5;
    if (s.includes("livrée") || s.includes("livree")) return 6;
    if (s.includes("annul")) return 0; // Cancelled
    return 2;
  }, [searchedOrder]);

  const isCancelled = searchedOrder?.status === "Annulée" || currentStepIndex === 0;

  // PDF Download with zero native alerts
  const handleDownloadPDF = () => {
    try {
      setDownloading(true);
      setErrorMessage("");
      generateReceiptPDF(searchedOrder);
    } catch (err) {
      console.error(err);
      setErrorMessage("Échec du téléchargement du reçu : " + (err.message || "Une erreur est survenue."));
    } finally {
      setTimeout(() => setDownloading(false), 800);
    }
  };

  const supportWhatsappUrl = useMemo(() => {
    const text = searchedOrder 
      ? `Bonjour AgriMarket Cameroun, je souhaite avoir des informations sur l'acheminement de ma commande *${searchedOrder.id}*.`
      : "Bonjour AgriMarket Cameroun, je souhaite suivre une commande.";
    return `https://wa.me/237699000000?text=${encodeURIComponent(text)}`;
  }, [searchedOrder]);

  return (
    <main className="agri-track-container">
      {/* Breadcrumb */}
      <nav className="agri-checkout-breadcrumb">
        <Link href="/">Accueil</Link>
        <span className="sep">/</span>
        <Link href="/commandes">Mes Commandes</Link>
        <span className="sep">/</span>
        <strong>Suivi de Commande & Expédition</strong>
      </nav>

      {/* Hero Section */}
      <section className="agri-checkout-hero agri-track-hero">
        <span className="agri-checkout-hero-kicker">
          <Truck width={13} /> Traçabilité & Suivi Logistique Cameroun
        </span>
        <h1>Suivez l'état d'avancement de votre commande</h1>
        <p>
          Saisissez votre référence de commande AgriMarket pour consulter son statut et les étapes enregistrées de son acheminement.
        </p>

        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} className="agri-track-search-bar">
          <Search width={18} style={{ color: "#0b5d33", marginLeft: 10 }} />
          <input 
            type="text"
            className="agri-track-search-input"
            placeholder="Ex : AGRI-2026-8942 ou votre numéro de téléphone..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            required
          />
          <button type="submit" className="agri-track-search-btn">
            Rechercher <ArrowRight width={15} />
          </button>
        </form>
      </section>

      {/* Main Track Details */}
      {searchedOrder ? (
        <article className="agri-conf-card">
          {/* Header */}
          <div style={{ background: "#f8faf9", borderBottom: "2px solid #e2ece7", padding: "24px 30px", display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: 16 }}>
            <div>
              <span style={{ fontSize: "11px", fontWeight: 800, color: "#0b5d33", textTransform: "uppercase", letterSpacing: "1px", display: "block", marginBottom: 4 }}>
                COMMANDE AGROPASTORALE
              </span>
              <h2 style={{ fontSize: "24px", color: "#07331e", margin: 0, fontWeight: 900 }}>
                {searchedOrder.id}
              </h2>
              <small style={{ color: "#64748b", marginTop: 4, display: "block" }}>
                Enregistrée le {searchedOrder.createdAt ? dateFr(searchedOrder.createdAt) : "Aujourd'hui"}
              </small>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <span style={{ 
                background: isCancelled ? "#fee2e2" : currentStepIndex === 1 ? "#fff7ed" : "#e6f3eb", 
                color: isCancelled ? "#dc2626" : currentStepIndex === 1 ? "#c2410c" : "#0b5d33",
                border: `1px solid ${isCancelled ? '#fca5a5' : currentStepIndex === 1 ? '#fdba74' : '#a3e6be'}`,
                padding: "6px 14px",
                fontSize: "12px",
                fontWeight: 800,
                textTransform: "uppercase",
                letterSpacing: "0.5px"
              }}>
                {searchedOrder.status || "Confirmée"}
              </span>
            </div>
          </div>

          {/* 6-Step Chronological Progress Tracker */}
          <div style={{ padding: "34px 28px 24px" }}>
            <h3 style={{ fontSize: "14px", fontWeight: 800, color: "#07331e", textTransform: "uppercase", letterSpacing: "0.5px", margin: "0 0 20px" }}>
              Progression de l'acheminement
            </h3>

            {isCancelled ? (
              <div style={{ padding: 20, background: "#fef2f2", border: "1px solid #fecaca", color: "#991b1b", display: "flex", alignItems: "center", gap: 12 }}>
                <XCircle width={28} />
                <div>
                  <strong>Cette commande a été annulée</strong>
                  <p style={{ margin: "2px 0 0", fontSize: "13px" }}>Aucun prélèvement n'a été effectué ou un remboursement a été initié selon vos consignes.</p>
                </div>
              </div>
            ) : (
              <div className="agri-timeline-wrap">
                {TRACKING_STEPS.map((s) => {
                  const isDone = s.index < currentStepIndex;
                  const isActive = s.index === currentStepIndex;
                  return (
                    <div 
                      key={s.index} 
                      className={`agri-timeline-step ${isActive ? "is-active" : isDone ? "is-done" : ""}`}
                    >
                      <div className="agri-timeline-circle">
                        {isDone ? <CheckCircle2 width={18} /> : s.index}
                      </div>
                      <div className="agri-timeline-label">
                        <strong>{s.label}</strong>
                        <small>{s.desc}</small>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Details 3-Column Grid */}
          <div className="agri-conf-details-grid">
            <div className="agri-conf-detail-box">
              <div className="title">
                <ShieldCheck width={16} /> Contact Client
              </div>
              <strong>{searchedOrder.name || searchedOrder.customer?.name || "Client"}</strong>
              <p>Appel : {searchedOrder.phone || searchedOrder.customer?.phone || "Non renseigné"}</p>
              <p style={{ color: "#0b5d33", fontWeight: 700, marginTop: 4 }}>
                WhatsApp : {searchedOrder.whatsapp || searchedOrder.customer?.whatsapp || searchedOrder.phone || "Non renseigné"}
              </p>
            </div>

            <div className="agri-conf-detail-box">
              <div className="title">
                {searchedOrder.deliveryMode === "RETRAIT_RELAIS" ? <Store width={16} /> : <MapPin width={16} />}
                {searchedOrder.deliveryMode === "RETRAIT_RELAIS" ? "Comptoir de Retrait" : "Lieu de Livraison"}
              </div>
              <strong>
                {searchedOrder.deliveryMode === "RETRAIT_RELAIS" 
                  ? "Retrait en point relais agropastoral" 
                  : (searchedOrder.city || "Douala / Yaoundé")}
              </strong>
              <p>
                {searchedOrder.pickupPoint || (searchedOrder.district ? `${searchedOrder.district} - ` : "") + (searchedOrder.address || "Adresse enregistrée")}
              </p>
            </div>

            <div className="agri-conf-detail-box">
              <div className="title">
                <Truck width={16} /> Mode de Règlement & Montant
              </div>
              <strong>{searchedOrder.paymentMethod || "Mobile Money"}</strong>
              <p>Statut : {searchedOrder.paymentStatus || searchedOrder.status || "Payé"}</p>
              <p style={{ marginTop: 4, color: "#f37021", fontWeight: 800 }}>
                Total : {money(searchedOrder.total)}
              </p>
            </div>
          </div>

          {/* Articles list */}
          <div style={{ padding: "26px 30px" }}>
            <h4 style={{ fontSize: "14px", fontWeight: 800, textTransform: "uppercase", color: "#07331e", margin: "0 0 16px" }}>
              Articles de la commande ({searchedOrder.items?.length || 0})
            </h4>

            <div style={{ display: "grid", gap: 12 }}>
              {(searchedOrder.items || []).map((item, i) => (
                <div key={item.id || i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 14, padding: "10px 14px", background: "#f8fafc", border: "1px solid #e2e8f0" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <img 
                      src={item.image || "https://images.pexels.com/photos/2872755/pexels-photo-2872755.jpeg?auto=compress&w=900"} 
                      alt={item.name} 
                      style={{ width: 48, height: 48, objectFit: "cover", border: "1px solid #cbd5e1" }} 
                    />
                    <div>
                      <strong style={{ fontSize: "13px", color: "#0f172a", display: "block" }}>{item.name}</strong>
                      <small style={{ color: "#64748b" }}>
                        Quantité : {item.quantity} {item.unit || "unité"} × {money(item.price)}
                      </small>
                    </div>
                  </div>
                  <strong style={{ fontSize: "14px", color: "#0b5d33" }}>
                    {money((item.quantity || 1) * (item.price || 0))}
                  </strong>
                </div>
              ))}
            </div>
          </div>

          {/* In-app error if PDF generation fails */}
          {errorMessage && (
            <div style={{ margin: "0 30px 16px", padding: "12px 16px", background: "#fef2f2", border: "1px solid #fecaca", color: "#991b1b", fontSize: "13px" }}>
              {errorMessage}
            </div>
          )}

          {/* Action Ribbon */}
          <div className="agri-conf-actions">
            <a 
              href={supportWhatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="agri-btn-whatsapp-share"
            >
              <MessageSquare width={16} />
              Assistance Logistique WhatsApp
            </a>

            <button 
              type="button" 
              className="agri-btn-pdf-download"
              onClick={handleDownloadPDF}
              disabled={downloading}
            >
              <Download width={16} />
              {downloading ? "Téléchargement..." : "Télécharger le reçu (PDF)"}
            </button>

            <Link 
              href={`/confirmation/${searchedOrder.id}`} 
              className="agri-btn-track-order"
            >
              Voir la confirmation détaillée <ArrowRight width={14} />
            </Link>
          </div>
        </article>
      ) : (
        /* Not found card */
        searched && (
          <div className="agri-form-card" style={{ padding: "50px 30px", textAlign: "center" }}>
            <div style={{ width: 56, height: 56, background: "#fff7ed", color: "#ea580c", display: "grid", placeItems: "center", margin: "0 auto 16px" }}>
              <HelpCircle width={28} height={28} />
            </div>
            <h2 style={{ fontSize: 20, color: "#07331e", margin: "0 0 8px" }}>Commande Introuvable</h2>
            <p style={{ color: "#64748b", maxWidth: "460px", margin: "0 auto 20px", fontSize: "14px" }}>
              Aucune commande ne correspond à la référence « {query} ». Veuillez vérifier le code inscrit sur votre reçu ou sur votre notification WhatsApp.
            </p>
            <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
              <Link href="/commandes" className="agri-btn-next" style={{ textDecoration: "none" }}>
                Voir mes commandes
              </Link>
              <a href="https://wa.me/237699000000" target="_blank" rel="noopener noreferrer" className="agri-btn-prev" style={{ textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 6 }}>
                <MessageSquare width={14} /> Contacter le support
              </a>
            </div>
          </div>
        )
      )}
    </main>
  );
}
