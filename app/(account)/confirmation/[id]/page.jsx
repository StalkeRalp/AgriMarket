"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { 
  Check, 
  PackageCheck, 
  Truck, 
  Download, 
  ArrowRight, 
  ShieldCheck, 
  MapPin, 
  Phone, 
  CreditCard, 
  Store, 
  MessageSquare, 
  Calendar, 
  AlertTriangle 
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useStore } from "@/lib/store";
import { money, dateFr } from "@/lib/format";
import { generateReceiptPDF } from "@/lib/pdfReceipt";

export default function ConfirmationPage() {
  const { id } = useParams();
  const router = useRouter();
  const { orders } = useStore();
  const [downloading, setDownloading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Search order in StoreContext or fallback to a realistic Cameroonian agropastoral order
  const order = useMemo(() => {
    const found = orders?.find(item => item.id === id);
    if (found) return found;

    return {
      id: id || "AGRI-2026-8942",
      createdAt: new Date().toISOString(),
      status: "Confirmée",
      statusCode: "confirmed",
      total: 26000,
      subtotal: 24500,
      shipping: 1500,
      name: "Client AgriMarket",
      phone: "+237 677 88 99 00",
      whatsapp: "+237 677 88 99 00",
      email: "client@agrimarket.cm",
      region: "Littoral",
      city: "Douala",
      district: "Bonapriso",
      address: "Avenue De Gaulle, Immeuble Horizon Vert",
      deliveryMode: "LIVRAISON_DOMICILE",
      paymentMethod: "MTN Mobile Money",
      paymentStatus: "Payé via MTN Mobile Money",
      items: [
        {
          id: "p-vivrier-01",
          name: "Régime de plantain corne fort de première récolte",
          brand: "GIC Vivrier d’Obala",
          price: 4500,
          quantity: 3,
          unit: "régime",
          origin: "Obala (Centre)",
          image: "https://images.pexels.com/photos/2872755/pexels-photo-2872755.jpeg?auto=compress&w=900"
        },
        {
          id: "p-elevage-01",
          name: "Alvéole de 30 œufs frais calibre Gros",
          brand: "Ferme Avicole des Hauts Plateaux",
          price: 2200,
          quantity: 5,
          unit: "alvéole",
          origin: "Bafoussam (Ouest)",
          image: "https://images.pexels.com/photos/162712/egg-white-food-protein-162712.jpeg?auto=compress&w=900"
        }
      ]
    };
  }, [orders, id]);

  const items = order.items || order.lines || [];
  const customerWhatsapp = order.whatsapp || order.customer?.whatsapp || order.phone || order.customer?.phone || "+237 699 000 000";
  const customerPhone = order.phone || order.customer?.phone || "+237 699 000 000";

  // PDF Generation with in-app error handling (no native alerts)
  const handleDownloadPDF = () => {
    try {
      setDownloading(true);
      setErrorMessage("");
      generateReceiptPDF(order);
    } catch (err) {
      console.error(err);
      setErrorMessage("Échec de la génération du reçu : " + (err.message || "Une erreur est survenue."));
    } finally {
      setTimeout(() => setDownloading(false), 800);
    }
  };

  // WhatsApp share link generator
  const whatsappShareUrl = useMemo(() => {
    const originUrl = typeof window !== "undefined" ? window.location.origin : "https://agrimarket.cm";
    const trackingLink = `${originUrl}/suivi-commande?code=${encodeURIComponent(order.id)}`;

    const text = [
      `*AGRIMARKET CAMEROUN — REÇU DE COMMANDE*`,
      `🌿 *Réf :* ${order.id}`,
      `📅 *Date :* ${new Date(order.createdAt || Date.now()).toLocaleDateString("fr-FR")}`,
      `👤 *Destinataire :* ${order.name || order.customer?.name || "Client"}`,
      `📦 *Articles :*`,
      ...items.map(i => `  • ${i.quantity || 1}x ${i.name || "Article"} (${((i.price || 0) * (i.quantity || 1)).toLocaleString("fr-FR")} FCFA)`),
      `🚚 *Frais d'acheminement :* ${order.shipping === 0 ? "Gratuit (0 FCFA)" : money(order.shipping || 0)}`,
      `💰 *Total Net :* ${money(order.total || 0)}`,
      `💳 *Paiement :* ${order.paymentMethod || order.payment || "Mobile Money"} (${order.paymentStatus || order.status || "Validé"})`,
      `📍 *Destination :* ${order.deliveryMode === "RETRAIT_RELAIS" ? "Retrait en point relais" : (order.city || "Cameroun")}`,
      `🔎 *Suivi en direct :* ${trackingLink}`,
      ``,
      `_Merci de faire confiance à la production agropastorale locale du Cameroun !_`
    ].join("\n");

    return `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
  }, [order, items]);

  return (
    <main className="agri-conf-page">
      {/* Breadcrumb */}
      <nav className="agri-checkout-breadcrumb">
        <Link href="/">Accueil</Link>
        <span className="sep">/</span>
        <Link href="/commandes">Mes Commandes</Link>
        <span className="sep">/</span>
        <strong>Confirmation de Commande</strong>
      </nav>

      <section className="agri-conf-card">
        {/* Top Header Banner */}
        <div className="agri-conf-banner">
          <div className="agri-conf-check-icon">
            <Check width={36} height={36} />
          </div>
          <h1>Votre commande est confirmée !</h1>
          <p>
            Merci pour votre achat. Retrouvez ci-dessous le récapitulatif de votre commande et les informations utiles pour son suivi.
          </p>
          <div className="agri-conf-ref-pill">
            RÉFÉRENCE OFFICIELLE : {order.id}
          </div>
        </div>

        {/* Key Info 3-Box Grid */}
        <div className="agri-conf-details-grid">
          <div className="agri-conf-detail-box">
            <div className="title">
              <Calendar width={16} /> Date & Référence
            </div>
            <strong>{order.id}</strong>
            <p>Enregistrée le {order.createdAt ? dateFr(order.createdAt) : "Aujourd'hui"}</p>
            <p style={{ marginTop: 4, color: "#0b5d33", fontWeight: 700 }}>
              Statut : {order.status || "Confirmée"}
            </p>
          </div>

          <div className="agri-conf-detail-box">
            <div className="title">
              {order.deliveryMode === "RETRAIT_RELAIS" ? <Store width={16} /> : <MapPin width={16} />}
              {order.deliveryMode === "RETRAIT_RELAIS" ? "Point de Retrait" : "Adresse de Livraison"}
            </div>
            <strong>{order.deliveryMode === "RETRAIT_RELAIS" ? "Retrait en point relais" : (order.city || "Douala / Yaoundé")}</strong>
            <p>{order.pickupPoint || `${order.district ? order.district + " - " : ""}${order.address || ""}`}</p>
            <p style={{ marginTop: 4, color: "#475569" }}>
              WhatsApp : <strong>{customerWhatsapp}</strong>
            </p>
          </div>

          <div className="agri-conf-detail-box">
            <div className="title">
              <CreditCard width={16} /> Règlement & Paiement
            </div>
            <strong>{order.paymentMethod || order.payment || "Mobile Money"}</strong>
            <p>Statut réel : <span style={{ color: order.status === "En attente de paiement" ? "#f37021" : "#0b5d33", fontWeight: 700 }}>{order.paymentStatus || "Confirmé & Validé"}</span></p>
            <p style={{ marginTop: 4, color: "#64748b" }}>
              Total : <strong>{money(order.total)}</strong>
            </p>
          </div>
        </div>

        {/* Detailed Items List */}
        <div className="agri-conf-items-wrap">
          <h3>Détail des Articles Commandés ({items.length})</h3>

          <div className="agri-conf-items-list">
            {items.map((item, idx) => {
              const name = item.name || (item.product && item.product.name) || "Produit agricole";
              const qty = item.quantity || 1;
              const unitPrice = item.price || (item.product && item.product.price) || 0;
              const unit = item.unit || "unité";
              const origin = item.origin || item.location || "Cameroun";
              const img = item.image || (item.product && item.product.image) || "https://images.pexels.com/photos/2872755/pexels-photo-2872755.jpeg?auto=compress&w=900";

              return (
                <div className="agri-conf-item-row" key={item.id || idx}>
                  <img src={img} alt={name} className="agri-conf-item-thumb" />
                  <div className="agri-conf-item-info">
                    <h4>{name}</h4>
                    <span>
                      Quantité : <strong>{qty} {unit}</strong> × {money(unitPrice)}
                    </span>
                    <span style={{ display: "block", color: "#0b5d33", marginTop: 2 }}>
                      📍 Terroir : {origin}
                    </span>
                  </div>
                  <div className="agri-conf-item-total">
                    {money(qty * unitPrice)}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Totals Breakdown */}
          <div className="agri-conf-totals-card">
            <div className="agri-conf-total-line">
              <span>Sous-total articles :</span>
              <strong>{money(order.subtotal || (order.total - (order.shipping || 0)))}</strong>
            </div>
            <div className="agri-conf-total-line">
              <span>Frais d'acheminement / livraison :</span>
              <strong>{order.shipping === 0 ? "Gratuit (0 FCFA)" : money(order.shipping || 0)}</strong>
            </div>
            <div className="agri-conf-total-line grand">
              <span>Montant Net Réglé :</span>
              <strong>{money(order.total)}</strong>
            </div>
          </div>
        </div>

        {/* Error notification banner if PDF fails */}
        {errorMessage && (
          <div style={{ margin: "0 30px 20px", padding: "12px 18px", background: "#fef2f2", border: "1px solid #fecaca", color: "#991b1b", fontSize: "13px", display: "flex", alignItems: "center", gap: "8px" }}>
            <AlertTriangle width={16} />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Actions Ribbon */}
        <div className="agri-conf-actions">
          <a 
            href={whatsappShareUrl} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="agri-btn-whatsapp-share"
          >
            <MessageSquare width={16} />
            Partager le reçu sur WhatsApp
          </a>

          <button 
            type="button" 
            className="agri-btn-pdf-download" 
            onClick={handleDownloadPDF} 
            disabled={downloading}
          >
            <Download width={16} />
            {downloading ? "Génération du PDF..." : "Télécharger le reçu (PDF)"}
          </button>

          <Link 
            href={`/suivi-commande?code=${encodeURIComponent(order.id)}`} 
            className="agri-btn-track-order"
          >
            <Truck width={16} />
            Suivre l'acheminement en direct
          </Link>

          <Link 
            href="/catalogue" 
            style={{ marginLeft: "auto", color: "#0b5d33", fontSize: "13px", fontWeight: 700, textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 6 }}
          >
            Continuer mes achats <ArrowRight width={14} />
          </Link>
        </div>
      </section>
    </main>
  );
}
