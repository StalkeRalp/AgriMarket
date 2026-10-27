"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Package, Truck, CheckCircle2, Clock, ArrowRight, RefreshCw, Download, ExternalLink, ShieldCheck, Store, MessageSquare } from "lucide-react";
import { useStore } from "@/lib/store";
import { money, dateFr } from "@/lib/format";
import { useRequireAuth } from "@/composants/RequireAuth";

const SAMPLE_AGRI_ORDERS = [
  {
    id: "AGRI-2026-8942",
    createdAt: "2026-08-12T14:20:00.000Z",
    status: "En cours de livraison",
    statusCode: "shipping",
    total: 26000,
    subtotal: 24500,
    shipping: 1500,
    deliveryMode: "LIVRAISON_DOMICILE",
    paymentMethod: "MTN Mobile Money",
    paymentStatus: "Payé via MTN Mobile Money",
    address: "Bonapriso, Douala (Avenue De Gaulle)",
    trackingNumber: "EXP-DLA-89421",
    estimatedDelivery: "14 Août 2026",
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
  },
  {
    id: "AGRI-2026-7815",
    createdAt: "2026-08-04T09:15:00.000Z",
    status: "LIVRÉE",
    statusCode: "delivered",
    total: 30000,
    subtotal: 28000,
    shipping: 2000,
    deliveryMode: "LIVRAISON_DOMICILE",
    paymentMethod: "Orange Money",
    paymentStatus: "Payé via Orange Money",
    address: "Bastos, Yaoundé",
    trackingNumber: "EXP-YDE-78150",
    estimatedDelivery: "06 Août 2026",
    items: [
      {
        id: "p-semence-01",
        name: "Semences de maïs hybride certifié (Sac 10 kg)",
        brand: "AgriCam Intrants & Fertilisants",
        origin: "Douala (Littoral)",
        unit: "sac de 10kg",
        price: 28000,
        quantity: 1,
        image: "https://images.pexels.com/photos/547263/pexels-photo-547263.jpeg?auto=compress&w=900"
      }
    ]
  }
];

export default function CommandesPage() {
  const { user } = useRequireAuth();
  const { orders: storeOrders, addToCart, notify } = useStore();
  const [filter, setFilter] = useState("ALL");

  const orders = storeOrders && storeOrders.length > 0 ? storeOrders : SAMPLE_AGRI_ORDERS;

  const filteredOrders = orders.filter(order => {
    const s = (order.status || "").toLowerCase();
    if (filter === "DELIVERED") return s.includes("livrée") || s.includes("livree") || order.statusCode === "delivered";
    if (filter === "SHIPPING") return s.includes("cours") || s.includes("expédi") || order.statusCode === "shipping" || order.statusCode === "in_transit";
    if (filter === "PENDING") return s.includes("attente") || s.includes("confirm");
    return true;
  });

  const handleReorder = (order) => {
    if (order.items && order.items.length) {
      order.items.forEach(item => {
        addToCart(item.id || item.productId, item.quantity || 1);
      });
      if (notify) notify("Les articles agropastoraux ont été ajoutés à votre panier !");
    }
  };

  return (
    <main className="agri-track-container">
      {/* Breadcrumb */}
      <nav className="agri-checkout-breadcrumb">
        <Link href="/">Accueil</Link>
        <span className="sep">/</span>
        <Link href="/compte">Mon Compte</Link>
        <span className="sep">/</span>
        <strong>Mes Commandes & Historique Agropastoral</strong>
      </nav>

      {/* Hero Header */}
      <section className="agri-checkout-hero" style={{ padding: "32px 36px" }}>
        <span className="agri-checkout-hero-kicker">
          <Store width={13} /> Espace Client & Commandes Agricoles
        </span>
        <h1>Historique de vos commandes</h1>
        <p>
          Retrouvez l'ensemble de vos commandes de produits vivriers, élevage et semences. Suivez leur acheminement ou téléchargez vos reçus.
        </p>

        <div className="agri-checkout-trust-badges">
          <div className="agri-checkout-trust-badge">
            <CheckCircle2 width={15} /> Circuit Court Direct Terroirs
          </div>
          <div className="agri-checkout-trust-badge">
            <Truck width={15} /> Suivi Logistique en Temps Réel
          </div>
          <div className="agri-checkout-trust-badge">
            <MessageSquare width={15} /> Reçus Numériques WhatsApp
          </div>
        </div>
      </section>

      {/* Filter Tabs */}
      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "24px" }}>
        {[
          { key: "ALL", label: `Toutes les commandes (${orders.length})` },
          { key: "SHIPPING", label: "En cours d'acheminement" },
          { key: "DELIVERED", label: "Livrées avec succès" },
          { key: "PENDING", label: "En attente / Confirmées" }
        ].map(t => (
          <button 
            key={t.key}
            type="button"
            className={`agri-stepper-node ${filter === t.key ? "is-active" : ""}`}
            style={{ padding: "10px 16px", cursor: "pointer", fontSize: "13px", fontWeight: 700 }}
            onClick={() => setFilter(t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Orders List */}
      {filteredOrders.length > 0 ? (
        <div style={{ display: "grid", gap: "24px" }}>
          {filteredOrders.map((order) => {
            const isDelivered = (order.status || "").toLowerCase().includes("livrée") || (order.status || "").toLowerCase().includes("livree");
            return (
              <article className="agri-conf-card" key={order.id}>
                {/* Header Section */}
                <div style={{ background: "#f8faf9", borderBottom: "2px solid #e2ece7", padding: "18px 24px", display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: 14 }}>
                  <div>
                    <span style={{ fontSize: "11px", fontWeight: 800, color: "#0b5d33", textTransform: "uppercase", letterSpacing: "1px", display: "block" }}>
                      RÉFÉRENCE AGROPASTORALE
                    </span>
                    <strong style={{ fontSize: "17px", color: "#07331e" }}>{order.id}</strong>
                    <small style={{ color: "#64748b", marginLeft: 10 }}>
                      Passée le {order.createdAt ? dateFr(order.createdAt) : "Récemment"}
                    </small>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{
                      background: isDelivered ? "#e6f3eb" : "#fef3c7",
                      color: isDelivered ? "#0b5d33" : "#b45309",
                      padding: "4px 12px",
                      fontSize: "12px",
                      fontWeight: 800,
                      textTransform: "uppercase"
                    }}>
                      {order.status || "Confirmée"}
                    </span>
                  </div>
                </div>

                {/* Shipping & Payment Meta */}
                <div className="agri-conf-details-grid">
                  <div className="agri-conf-detail-box">
                    <div className="title">Règlement</div>
                    <strong>{order.paymentMethod || "Mobile Money"}</strong>
                    <p>Statut : {order.paymentStatus || order.status || "Payé"}</p>
                  </div>

                  <div className="agri-conf-detail-box">
                    <div className="title">Destination</div>
                    <strong>{order.city || "Cameroun"}</strong>
                    <p>{order.pickupPoint || (order.district ? `${order.district} - ` : "") + (order.address || "")}</p>
                  </div>

                  <div className="agri-conf-detail-box">
                    <div className="title">Montant Total</div>
                    <strong style={{ color: "#0b5d33", fontSize: "16px" }}>
                      {money ? money(order.total) : `${order.total} FCFA`}
                    </strong>
                    <p>Frais d'acheminement : {order.shipping === 0 ? "Gratuit" : money(order.shipping || 0)}</p>
                  </div>
                </div>

                {/* Items */}
                <div style={{ padding: "20px 24px" }}>
                  <div style={{ display: "grid", gap: 10 }}>
                    {(order.items || order.lines || []).map((item, idx) => (
                      <div key={item.id || idx} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, paddingBottom: 10, borderBottom: "1px dashed #e2e8f0" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                          <img 
                            src={item.image || "https://images.pexels.com/photos/2872755/pexels-photo-2872755.jpeg?auto=compress&w=900"} 
                            alt={item.name} 
                            style={{ width: 44, height: 44, objectFit: "cover", border: "1px solid #cbd5e1" }} 
                          />
                          <div>
                            <strong style={{ fontSize: "13px", color: "#0f172a", display: "block" }}>{item.name}</strong>
                            <small style={{ color: "#64748b" }}>
                              {item.quantity || 1} {item.unit || "unité"} × {money(item.price || 0)}
                            </small>
                          </div>
                        </div>
                        <strong style={{ fontSize: "13px", color: "#0b5d33" }}>
                          {money((item.quantity || 1) * (item.price || 0))}
                        </strong>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Footer Action Ribbon */}
                <div className="agri-conf-actions" style={{ padding: "16px 24px" }}>
                  <button 
                    type="button" 
                    className="agri-btn-submit-order" 
                    style={{ padding: "10px 18px", fontSize: "12px" }}
                    onClick={() => handleReorder(order)}
                  >
                    <RefreshCw width={14} /> Recommander les articles
                  </button>

                  <Link 
                    href={`/suivi-commande?code=${encodeURIComponent(order.id)}`} 
                    className="agri-btn-track-order"
                    style={{ padding: "9px 18px", fontSize: "12px" }}
                  >
                    <Truck width={14} /> Suivre l'acheminement
                  </Link>

                  <Link 
                    href={`/confirmation/${encodeURIComponent(order.id)}`} 
                    className="agri-btn-prev"
                    style={{ padding: "9px 16px", fontSize: "12px", textDecoration: "none" }}
                  >
                    Consulter le reçu
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="agri-form-card" style={{ padding: "60px 30px", textAlign: "center" }}>
          <Package width={48} height={48} style={{ color: "#0b5d33", margin: "0 auto 16px" }} />
          <h2 style={{ fontSize: 20, color: "#07331e", margin: "0 0 8px" }}>Aucune commande dans cette catégorie</h2>
          <p style={{ color: "#64748b", maxWidth: "460px", margin: "0 auto 20px", fontSize: "14px" }}>
            Découvrez nos arrivages de produits vivriers, élevage et semences certifiées du Cameroun.
          </p>
          <Link href="/catalogue" className="agri-btn-next" style={{ display: "inline-flex", textDecoration: "none" }}>
            Explorer le catalogue <ArrowRight width={16} />
          </Link>
        </div>
      )}
    </main>
  );
}
