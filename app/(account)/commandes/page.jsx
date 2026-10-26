"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Package, Truck, CheckCircle2, Clock, ArrowRight, RefreshCw, Download, ExternalLink, ShieldCheck, ShoppingBag } from "lucide-react";
import { useStore } from "@/lib/store";
import { money, dateFr } from "@/lib/format";
import { useRequireAuth } from "@/composants/RequireAuth";


const SAMPLE_ORDERS = [
  {
    id: "ITX-2026-8942",
    createdAt: "2026-08-12T14:30:00.000Z",
    status: "LIVRÉE",
    statusCode: "delivered",
    total: 68500,
    paymentMethod: "MTN Mobile Money",
    address: "Bonamoussadi, Douala (Repère Carrefour)",
    trackingNumber: "EXP-DLA-99201",
    estimatedDelivery: "13 Août 2026",
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
  },
  {
    id: "ITX-2026-7815",
    createdAt: "2026-08-04T09:15:00.000Z",
    status: "EN COURS D'EXPÉDITION",
    statusCode: "shipping",
    total: 32000,
    paymentMethod: "Orange Money",
    address: "Bastos, Yaoundé",
    trackingNumber: "EXP-YDE-44109",
    estimatedDelivery: "14 Août 2026",
    items: [
      {
        id: "p3",
        name: "Masque Capillaire Nutrition Ultime",
        brand: "KÉRASTASE",
        price: 32000,
        quantity: 1,
        image: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80"
      }
    ]
  }
];

export default function CommandesPage() {
  const { user, hydrated } = useRequireAuth();
  const { orders: storeOrders, addToCart, notify } = useStore();
  const [filter, setFilter] = useState("ALL");

  const orders = storeOrders && storeOrders.length > 0 ? storeOrders : SAMPLE_ORDERS;

  const filteredOrders = orders.filter(order => {
    if (filter === "DELIVERED") return order.status === "LIVRÉE" || order.statusCode === "delivered";
    if (filter === "SHIPPING") return order.status === "EN COURS D'EXPÉDITION" || order.statusCode === "shipping";
    return true;
  });

  const handleReorder = (order) => {
    if (order.items && order.items.length) {
      order.items.forEach(item => {
        addToCart(item.id || item.productId, item.quantity || 1);
      });
      if (notify) notify("Tous les articles de la commande ont été réajoutés à votre panier !");
    }
  };

  return (
    <main className="orders-page">
      {/* Luxury Breadcrumb */}
      <nav className="collection-breadcrumb container">
        <Link href="/">Accueil</Link>
        <span>/</span>
        <Link href="/compte">Mon Compte</Link>
        <span>/</span>
        <strong>Mes Commandes & Historique</strong>
      </nav>

      {/* Hero Header */}
      <header className="orders-hero container">
        <div className="orders-hero__inner">
          <span className="eyebrow">HAUTE PARFUMERIE & SOINS D'EXCEPTION</span>
          <h1>Mes Commandes & Achats</h1>
          <p>
            Suivez vos expéditions en temps réel, consultez l'historique complet de vos rituels beauté et accédez à vos reçus détaillés.
          </p>
        </div>
      </header>

      <div className="container">
        {/* Orders Filter Tabs */}
        <div className="orders-filter-bar">
          <button 
            className={`orders-tab ${filter === "ALL" ? "is-active" : ""}`}
            onClick={() => setFilter("ALL")}
          >
            Toutes les commandes ({orders.length})
          </button>
          <button 
            className={`orders-tab ${filter === "SHIPPING" ? "is-active" : ""}`}
            onClick={() => setFilter("SHIPPING")}
          >
            En cours d'expédition
          </button>
          <button 
            className={`orders-tab ${filter === "DELIVERED" ? "is-active" : ""}`}
            onClick={() => setFilter("DELIVERED")}
          >
            Livrées
          </button>
        </div>

        {/* Orders List */}
        {filteredOrders.length > 0 ? (
          <div className="orders-list">
            {filteredOrders.map((order) => {
              const isDelivered = order.status === "LIVRÉE" || order.statusCode === "delivered";
              return (
                <article className="order-card-luxury" key={order.id}>
                  {/* Card Header */}
                  <div className="order-card-header">
                    <div className="order-title-group">
                      <span className="order-number">{order.id}</span>
                      <span className="order-date">
                        Passée le {order.createdAt ? dateFr(order.createdAt) : "12 Août 2026"}
                      </span>
                    </div>

                    <div className={`order-status-badge ${isDelivered ? "is-delivered" : "is-shipping"}`}>
                      {isDelivered ? <CheckCircle2 width={14} /> : <Truck width={14} />}
                      <span>{order.status || "EN COURS"}</span>
                    </div>
                  </div>

                  {/* Order Shipping Progress & Meta */}
                  <div className="order-shipping-meta">
                    <div>
                      <small>Méthode de paiement :</small>
                      <strong>{order.paymentMethod || "Paiement sécurisé"}</strong>
                    </div>
                    <div>
                      <small>Adresse de livraison :</small>
                      <strong>{order.address || order.city || "Douala / Yaoundé"}</strong>
                    </div>
                    <div>
                      <small>N° Suivi Transporteur :</small>
                      <strong>{order.trackingNumber || "EXP-CAM-2026"}</strong>
                    </div>
                  </div>

                  {/* Order Items List */}
                  <div className="order-items-grid">
                    {(order.items || order.lines || []).map((item, idx) => (
                      <div className="order-item-row" key={item.id || idx}>
                        <div className="order-item-media">
                          <img src={item.image || (item.product && item.product.image) || "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=300&q=80"} alt={item.name} />
                        </div>
                        <div className="order-item-info">
                          <span className="item-brand">{item.brand || "ITEXAL BEAUTY"}</span>
                          <h4>{item.name || (item.product && item.product.name)}</h4>
                          <span className="item-qty-price">
                            Qté : {item.quantity || 1} × {(item.price || (item.product && item.product.price))?.toLocaleString("fr-FR")} FCFA
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Card Footer Summary */}
                  <div className="order-card-footer">
                    <div className="order-total-box">
                      <span>Montant Total</span>
                      <strong>{money ? money(order.total) : `${order.total?.toLocaleString("fr-FR")} FCFA`}</strong>
                    </div>

                    <div className="order-actions-group">
                      <button 
                        className="dior-btn-primary"
                        onClick={() => handleReorder(order)}
                      >
                        <RefreshCw width={14} /> Recommander la sélection
                      </button>
                      <Link 
                        href={`/suivi-commande?code=${order.id}`}
                        className="dior-btn-outline"
                      >
                        <Truck width={14} /> Suivre le colis
                      </Link>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          /* Empty Orders Card */
          <div className="orders-empty-card">
            <Package width={48} height={48} />
            <h2>Aucune commande enregistrée</h2>
            <p>Découvrez notre sélection exclusive et passez votre première commande dès aujourd'hui.</p>
            <Link href="/catalogue" className="dior-btn-primary">
              Explorer le Catalogue <ArrowRight width={16} />
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}
