"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { AccountShell } from "@/composants/AccountShell";
import { useStore } from "@/lib/store";
import { money, dateFr } from "@/lib/format";
import { generateReceiptPDF } from "@/lib/pdfReceipt";
import { Truck, Download, MessageSquare, ArrowLeft, Store, MapPin, ShieldCheck, CheckCircle2 } from "lucide-react";

export default function OrderDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { orders } = useStore();
  const [downloading, setDownloading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const order = orders?.find(item => item.id === id);

  const handleDownloadPDF = () => {
    if (!order) return;
    try {
      setDownloading(true);
      setErrorMessage("");
      generateReceiptPDF(order);
    } catch (err) {
      console.error(err);
      setErrorMessage("Échec du téléchargement du reçu : " + (err.message || "Une erreur est survenue."));
    } finally {
      setTimeout(() => setDownloading(false), 800);
    }
  };

  if (!order) {
    return (
      <AccountShell title="Détail de la commande">
        <div className="agri-form-card" style={{ padding: "50px 30px", textAlign: "center" }}>
          <h2 style={{ fontSize: 20, color: "#07331e", margin: "0 0 10px" }}>Commande introuvable</h2>
          <p style={{ color: "#64748b", maxWidth: 440, margin: "0 auto 20px", fontSize: 14 }}>
            La commande « {id} » n'a pas été trouvée dans votre historique.
          </p>
          <Link href="/commandes" className="agri-btn-next" style={{ display: "inline-flex", textDecoration: "none" }}>
            <ArrowLeft width={16} /> Retour à mes commandes
          </Link>
        </div>
      </AccountShell>
    );
  }

  const items = order.items || order.lines || [];
  const customerName = order.name || order.customer?.name || "Client";
  const customerPhone = order.phone || order.customer?.phone || "Non renseigné";
  const customerWhatsapp = order.whatsapp || order.customer?.whatsapp || customerPhone;

  const originUrl = typeof window !== "undefined" ? window.location.origin : "https://agrimarket.cm";
  const trackingLink = `${originUrl}/suivi-commande?code=${encodeURIComponent(order.id)}`;
  const whatsappText = `Bonjour, voici le reçu de ma commande *${order.id}* d'un montant de ${money(order.total)} sur AgriMarket : ${trackingLink}`;
  const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(whatsappText)}`;

  return (
    <AccountShell title={`Commande ${order.id}`}>
      <div className="agri-conf-card">
        {/* Header bar */}
        <div style={{ background: "#f8faf9", borderBottom: "2px solid #e2ece7", padding: "20px 24px", display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: 14 }}>
          <div>
            <span style={{ fontSize: "11px", fontWeight: 800, color: "#0b5d33", textTransform: "uppercase", letterSpacing: "1px", display: "block" }}>
              BORDEREAU DE COMMANDE
            </span>
            <h2 style={{ fontSize: "22px", color: "#07331e", margin: "2px 0 0", fontWeight: 900 }}>{order.id}</h2>
            <small style={{ color: "#64748b" }}>
              Passée le {order.createdAt ? dateFr(order.createdAt) : "Récemment"}
            </small>
          </div>

          <span style={{
            background: "#e6f3eb",
            color: "#0b5d33",
            border: "1px solid #a3e6be",
            padding: "5px 14px",
            fontSize: "12px",
            fontWeight: 800,
            textTransform: "uppercase"
          }}>
            {order.status || "Confirmée"}
          </span>
        </div>

        {/* 3-Column Info Grid */}
        <div className="agri-conf-details-grid">
          <div className="agri-conf-detail-box">
            <div className="title">Contact Client</div>
            <strong>{customerName}</strong>
            <p>Téléphone : {customerPhone}</p>
            <p style={{ color: "#0b5d33", fontWeight: 700, marginTop: 4 }}>
              WhatsApp : {customerWhatsapp}
            </p>
          </div>

          <div className="agri-conf-detail-box">
            <div className="title">
              {order.deliveryMode === "RETRAIT_RELAIS" ? "Point de Retrait" : "Adresse de Livraison"}
            </div>
            <strong>{order.deliveryMode === "RETRAIT_RELAIS" ? "Retrait en point relais agropastoral" : (order.city || "Cameroun")}</strong>
            <p>{order.pickupPoint || (order.district ? `${order.district} - ` : "") + (order.address || "")}</p>
          </div>

          <div className="agri-conf-detail-box">
            <div className="title">Règlement & Frais</div>
            <strong>{order.paymentMethod || "Mobile Money"}</strong>
            <p>Statut : {order.paymentStatus || order.status || "Validé"}</p>
            <p style={{ marginTop: 4, color: "#f37021", fontWeight: 800 }}>
              Total Net : {money(order.total)}
            </p>
          </div>
        </div>

        {/* Items List */}
        <div style={{ padding: "24px 28px" }}>
          <h3 style={{ fontSize: "15px", fontWeight: 800, textTransform: "uppercase", color: "#07331e", margin: "0 0 16px" }}>
            Articles inclus ({items.length})
          </h3>

          <div style={{ display: "grid", gap: 12 }}>
            {items.map((item, idx) => (
              <div key={item.id || idx} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 14, padding: "12px 14px", background: "#f8fafc", border: "1px solid #e2e8f0" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  <img 
                    src={item.image || "https://images.pexels.com/photos/2872755/pexels-photo-2872755.jpeg?auto=compress&w=900"} 
                    alt={item.name} 
                    style={{ width: 50, height: 50, objectFit: "cover", border: "1px solid #cbd5e1" }} 
                  />
                  <div>
                    <strong style={{ fontSize: "13px", color: "#0f172a", display: "block" }}>{item.name}</strong>
                    <small style={{ color: "#64748b" }}>
                      Quantité : {item.quantity} {item.unit || "unité"} × {money(item.price || 0)}
                    </small>
                    {item.origin && (
                      <small style={{ display: "block", color: "#0b5d33" }}>📍 Terroir : {item.origin}</small>
                    )}
                  </div>
                </div>
                <strong style={{ fontSize: "14px", color: "#0b5d33" }}>
                  {money((item.quantity || 1) * (item.price || 0))}
                </strong>
              </div>
            ))}
          </div>

          {/* Totals Table */}
          <div className="agri-conf-totals-card" style={{ marginTop: 20 }}>
            <div className="agri-conf-total-line">
              <span>Sous-total articles :</span>
              <strong>{money(order.subtotal || (order.total - (order.shipping || 0)))}</strong>
            </div>
            <div className="agri-conf-total-line">
              <span>Frais d'acheminement :</span>
              <strong>{order.shipping === 0 ? "Gratuit (0 FCFA)" : money(order.shipping || 0)}</strong>
            </div>
            <div className="agri-conf-total-line grand">
              <span>Total Réglé :</span>
              <strong>{money(order.total)}</strong>
            </div>
          </div>
        </div>

        {errorMessage && (
          <div style={{ margin: "0 28px 16px", padding: "10px 14px", background: "#fef2f2", color: "#991b1b", fontSize: "13px" }}>
            {errorMessage}
          </div>
        )}

        {/* Action Ribbon */}
        <div className="agri-conf-actions" style={{ padding: "18px 28px" }}>
          <Link 
            href={`/suivi-commande?code=${encodeURIComponent(order.id)}`} 
            className="agri-btn-track-order"
          >
            <Truck width={15} /> Suivre l'acheminement en direct
          </Link>

          <a 
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="agri-btn-whatsapp-share"
          >
            <MessageSquare width={15} /> Partager sur WhatsApp
          </a>

          <button 
            type="button" 
            className="agri-btn-pdf-download"
            onClick={handleDownloadPDF}
            disabled={downloading}
          >
            <Download width={15} />
            {downloading ? "Téléchargement..." : "Télécharger le reçu (PDF)"}
          </button>

          <Link 
            href="/commandes" 
            style={{ marginLeft: "auto", color: "#0b5d33", fontSize: "13px", fontWeight: 700, textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 6 }}
          >
            <ArrowLeft width={14} /> Retour à mes commandes
          </Link>
        </div>
      </div>
    </AccountShell>
  );
}
