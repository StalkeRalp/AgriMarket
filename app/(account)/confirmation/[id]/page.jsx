"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Check, PackageCheck, Truck, Download, ShoppingBag, ArrowRight, ShieldCheck, MapPin, Phone, CreditCard, Sparkles } from "lucide-react";
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

  const order = orders.find(item => item.id === id) || {
    id: id || "ITX-2026-8942",
    createdAt: new Date().toISOString(),
    status: "CONFIRMÉE & EN PRÉPARATION",
    total: 68500,
    shipping: 2000,
    name: "Client ITEXAL",
    phone: "+237 699 000 000",
    email: "client@demo.cm",
    city: "Douala",
    district: "Bonamoussadi",
    address: "Repère Carrefour Market",
    paymentMethod: "MTN Mobile Money",
    items: [
      {
        id: "p1",
        name: "Sérum Hydratant Eclat Intense",
        brand: "LANEIGE",
        price: 24500,
        quantity: 1,
        image: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=800&q=80"
      },
      {
        id: "p2",
        name: "Huile de Parfum Élixir Botanique",
        brand: "DIOR BEAUTY",
        price: 44000,
        quantity: 1,
        image: "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=800&q=80"
      }
    ]
  };

  const handleDownloadPDF = () => {
    try {
      setDownloading(true);
      setErrorMessage("");
      generateReceiptPDF(order);
    } catch (err) {
      console.error(err);
      setErrorMessage("Échec de la génération du reçu : " + (err.message || "Une erreur est survenue."));
    } finally {
      setTimeout(() => setDownloading(false), 1200);
    }
  };

  const handleNavigateOrders = (e) => {
    e.preventDefault();
    router.push("/commandes");
  };

  return (
    <main className="confirmation-page">
      {/* Luxury Breadcrumb */}
      <nav className="collection-breadcrumb container">
        <Link href="/">Accueil</Link>
        <span>/</span>
        <strong>Confirmation de Commande</strong>
      </nav>

      <div className="container">
        <section className="confirmation-card-luxury">
          {/* Top Check Emblem */}
          <div className="confirmation-emblem">
            <div className="check-ring">
              <Check width={32} height={32} />
            </div>
            <span className="eyebrow">MAISON ITEXAL BEAUTY</span>
            <h1>Votre commande est confirmée !</h1>
            <p className="subtitle">
              Merci pour votre achat d'exception. Notre atelier prépare soigneusement votre colis pour une expédition rapide.
            </p>
          </div>

          {/* Status Timeline */}
          <div className="confirmation-timeline">
            <div className="timeline-step is-active">
              <div className="step-icon"><Check width={16} /></div>
              <span>Commande Reçue</span>
            </div>
            <div className="timeline-step is-active">
              <div className="step-icon"><PackageCheck width={16} /></div>
              <span>Préparation en cours</span>
            </div>
            <div className="timeline-step">
              <div className="step-icon"><Truck width={16} /></div>
              <span>Expédition Express</span>
            </div>
          </div>

          {/* Order Details Grid */}
          <div className="confirmation-details-grid">
            <div className="details-box">
              <div className="box-title">
                <ShieldCheck width={16} /> <span>Référence Commande</span>
              </div>
              <strong className="detail-value highlight">{order.id}</strong>
              <small>Passée le {order.createdAt ? dateFr(order.createdAt) : "Aujourd'hui"}</small>
            </div>

            <div className="details-box">
              <div className="box-title">
                <MapPin width={16} /> <span>Adresse de Livraison</span>
              </div>
              <strong className="detail-value">{order.city || "Douala / Yaoundé"}</strong>
              <small>{order.district ? `${order.district} - ` : ""}{order.address}</small>
            </div>

            <div className="details-box">
              <div className="box-title">
                <CreditCard width={16} /> <span>Mode de Règlement</span>
              </div>
              <strong className="detail-value">{order.paymentMethod || order.payment || "Paiement Mobile"}</strong>
              <small>Statut : Confirmé & Validé</small>
            </div>
          </div>

          {/* Items Summary Table */}
          <div className="confirmation-items-summary">
            <h3>Récapitulatif des Articles</h3>
            <div className="summary-list">
              {(order.items || order.lines || []).map((item, idx) => (
                <div className="summary-item-row" key={item.id || idx}>
                  <div className="item-thumb">
                    <img src={item.image || (item.product && item.product.image) || "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=300&q=80"} alt={item.name} />
                  </div>
                  <div className="item-details">
                    <span className="item-brand">{item.brand || "ITEXAL BEAUTY"}</span>
                    <h4>{item.name || (item.product && item.product.name)}</h4>
                    <span className="item-meta">Qté : {item.quantity || 1} × {(item.price || (item.product && item.product.price))?.toLocaleString("fr-FR")} FCFA</span>
                  </div>
                  <div className="item-subtotal">
                    <strong>{((item.quantity || 1) * (item.price || (item.product && item.product.price) || 0)).toLocaleString("fr-FR")} FCFA</strong>
                  </div>
                </div>
              ))}
            </div>

            <div className="confirmation-totals-box">
              <div className="total-row">
                <span>Sous-total articles :</span>
                <strong>{money(order.total ? order.total - (order.shipping || 2000) : 66500)}</strong>
              </div>
              <div className="total-row">
                <span>Frais de livraison :</span>
                <strong>{money(order.shipping || 2000)}</strong>
              </div>
              <div className="total-row grand-total">
                <span>Total Général :</span>
                <strong>{money(order.total || 68500)}</strong>
              </div>
            </div>
          </div>

          {/* Error notice if PDF generation fails */}
          {errorMessage && (
            <div className="pdf-error-toast">
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Action Ribbon: PDF Download + View Orders + Continue Shopping */}
          <div className="confirmation-actions-ribbon">
            <button 
              className="dior-btn-primary"
              onClick={handleDownloadPDF}
              disabled={downloading}
            >
              <Download width={16} />
              {downloading ? "Génération du reçu..." : "Télécharger le reçu (PDF)"}
            </button>

            <button 
              className="dior-btn-outline"
              onClick={handleNavigateOrders}
            >
              Voir mes commandes <ArrowRight width={15} />
            </button>

            <Link href="/catalogue" className="dior-btn-outline secondary">
              Continuer mes achats
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
