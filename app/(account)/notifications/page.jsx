"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Bell, Package, Sparkles, CheckCheck, ArrowRight, Tag, ShieldCheck, Clock, Trash2 } from "lucide-react";
import { dateFr } from "@/lib/format";

const INITIAL_NOTIFICATIONS = [
  {
    id: "notif-1",
    type: "ORDER",
    title: "Commande en cours d'expédition",
    message: "Votre rituel beauté 'Sérum Hydratant Eclat Intense' de la commande #ITX-2026-8942 a été remis au transporteur à Douala.",
    date: new Date().toISOString(),
    read: false,
    link: "/commandes",
    linkText: "Suivre mon colis",
    icon: Package
  },
  {
    id: "notif-2",
    type: "PROMO",
    title: "Invitation Exclusive : Ventes Privées Dior",
    message: "Bénéficiez de 20% de remise exceptionnelle sur l'ensemble de la gamme Dior Prestige avec le code privilège PRIVILEGE20.",
    date: new Date(Date.now() - 3600000 * 24).toISOString(),
    read: false,
    link: "/catalogue?brand=DIOR",
    linkText: "Découvrir la sélection",
    icon: Sparkles
  },
  {
    id: "notif-3",
    type: "ORDER",
    title: "Commande confirmée avec succès",
    message: "Votre commande #ITX-2026-7815 d'un montant de 32 000 FCFA a bien été enregistrée et est en cours de préparation dans nos ateliers.",
    date: new Date(Date.now() - 3600000 * 72).toISOString(),
    read: true,
    link: "/commandes",
    linkText: "Voir la commande",
    icon: ShieldCheck
  }
];

import { useStore } from "@/lib/store";
import { useRequireAuth } from "@/composants/RequireAuth";

export default function NotificationsPage() {
  const { user, hydrated } = useRequireAuth();
  const { 
    notifications, 
    unreadNotificationsCount, 
    markAllNotificationsAsRead, 
    toggleNotificationReadStatus, 
    deleteNotification 
  } = useStore();
  
  const [filter, setFilter] = useState("ALL");

  const filteredNotifs = notifications.filter(n => {
    if (filter === "UNREAD") return !n.read;
    if (filter === "ORDER") return n.type === "ORDER";
    if (filter === "PROMO") return n.type === "PROMO";
    return true;
  });

  return (
    <main className="notifications-page">
      {/* Luxury Breadcrumb */}
      <nav className="collection-breadcrumb container">
        <Link href="/">Accueil</Link>
        <span>/</span>
        <strong>Espace Notifications</strong>
      </nav>

      {/* Hero Header */}
      <header className="orders-hero container">
        <div className="orders-hero__inner">
          <span className="eyebrow">MAISON ITEXAL — MES ALERTES PRIVÉES</span>
          <h1>Notifications & Privilèges</h1>
          <p>
            Suivez le statut de vos commandes en temps réel et ne manquez aucune invitation à nos ventes privées exclusives.
          </p>
        </div>
      </header>

      <div className="container" style={{ maxWidth: "920px" }}>
        {/* Controls Bar */}
        <div className="notif-controls-bar">
          <div className="orders-filter-bar" style={{ marginBottom: 0, borderBottom: "none" }}>
            <button 
              className={`orders-tab ${filter === "ALL" ? "is-active" : ""}`}
              onClick={() => setFilter("ALL")}
            >
              Toutes ({notifications.length})
            </button>
            <button 
              className={`orders-tab ${filter === "UNREAD" ? "is-active" : ""}`}
              onClick={() => setFilter("UNREAD")}
            >
              Non lues ({unreadNotificationsCount})
            </button>
            <button 
              className={`orders-tab ${filter === "ORDER" ? "is-active" : ""}`}
              onClick={() => setFilter("ORDER")}
            >
              Commandes
            </button>
            <button 
              className={`orders-tab ${filter === "PROMO" ? "is-active" : ""}`}
              onClick={() => setFilter("PROMO")}
            >
              Offres Privilèges
            </button>
          </div>

          {unreadNotificationsCount > 0 && (
            <button className="btn-mark-all-read" onClick={markAllNotificationsAsRead}>
              <CheckCheck width={15} /> Tout marquer comme lu
            </button>
          )}
        </div>

        {/* Notifications List */}
        {filteredNotifs.length > 0 ? (
          <div className="notifications-list">
            {filteredNotifs.map((item) => {
              const IconComp = item.icon === "Package" ? Package : item.icon === "Sparkles" ? Sparkles : item.icon === "ShieldCheck" ? ShieldCheck : Bell;
              return (
                <article className={`notif-card-luxury ${!item.read ? "is-unread" : ""}`} key={item.id}>
                  <div className="notif-icon-badge">
                    <IconComp width={20} />
                  </div>

                  <div className="notif-content-body">
                    <div className="notif-header-row">
                      <span className="notif-tag">
                        {item.type === "ORDER" ? "LIVRAISON & COMMANDE" : "OFFRE PRIVILÈGE"}
                      </span>
                      <span className="notif-date">
                        <Clock width={12} /> {dateFr(item.date)}
                      </span>
                    </div>

                    <h3>{item.title}</h3>
                    <p>{item.message}</p>

                    <div className="notif-actions-row">
                      {item.link && (
                        <Link href={item.link} className="dior-btn-primary" style={{ padding: "10px 20px", fontSize: "11px" }}>
                          {item.linkText} <ArrowRight width={14} />
                        </Link>
                      )}

                      <button 
                        className="notif-btn-secondary"
                        onClick={() => toggleNotificationReadStatus(item.id)}
                      >
                        {item.read ? "Marquer comme non lu" : "Marquer comme lu"}
                      </button>

                      <button 
                        className="notif-btn-delete"
                        onClick={() => deleteNotification(item.id)}
                        aria-label="Supprimer"
                      >
                        <Trash2 width={15} />
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="orders-empty-card">
            <Bell width={48} height={48} />
            <h2>Aucune notification</h2>
            <p>Vous êtes à jour ! Vos alertes et offres exclusives s'afficheront ici dès qu'elles seront disponibles.</p>
            <Link href="/catalogue" className="dior-btn-primary">
              Explorer le Catalogue <ArrowRight width={16} />
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}
