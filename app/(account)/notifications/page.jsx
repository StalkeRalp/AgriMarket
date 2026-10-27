"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Bell,
  BellRing,
  CheckCheck,
  Clock3,
  CreditCard,
  PackageCheck,
  Sprout,
  Trash2,
  X,
} from "lucide-react";
import { dateFr } from "@/lib/format";
import { useStore } from "@/lib/store";
import { useRequireAuth } from "@/composants/RequireAuth";

const filters = [
  { id: "ALL", label: "Toutes" },
  { id: "UNREAD", label: "Non lues" },
  { id: "ORDER", label: "Commandes" },
  { id: "PAYMENT", label: "Paiements" },
  { id: "PROMO", label: "Offres" },
];

function iconForNotification(item) {
  if (["Package", "PackageCheck"].includes(item.icon) || item.type === "ORDER") return PackageCheck;
  if (["CreditCard"].includes(item.icon) || item.type === "PAYMENT") return CreditCard;
  if (item.type === "PROMO") return Sprout;
  return Bell;
}

function labelForNotification(type) {
  if (type === "ORDER") return "Commande";
  if (type === "PAYMENT") return "Paiement";
  if (type === "STOCK") return "Stock";
  if (type === "PROMO") return "Offre";
  return "Information";
}

export default function NotificationsPage() {
  const { user, hydrated } = useRequireAuth();
  const {
    notifications,
    unreadNotificationsCount,
    markAllNotificationsAsRead,
    toggleNotificationReadStatus,
    deleteNotification,
  } = useStore();
  const [filter, setFilter] = useState("ALL");
  const [selectedId, setSelectedId] = useState(null);

  const selectedNotification = notifications.find((item) => item.id === selectedId) || null;
  const filteredNotifications = useMemo(() => notifications.filter((item) => {
    if (filter === "UNREAD") return !item.read;
    if (filter === "ORDER" || filter === "PAYMENT" || filter === "PROMO") return item.type === filter;
    return true;
  }), [filter, notifications]);

  useEffect(() => {
    if (!selectedId) return undefined;
    const closeOnEscape = (event) => {
      if (event.key === "Escape") setSelectedId(null);
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [selectedId]);

  const openNotification = (item) => {
    setSelectedId(item.id);
    if (!item.read) toggleNotificationReadStatus(item.id);
  };

  if (!hydrated || !user) {
    return <main className="agri-notifications-loading"><span /><p>Chargement de vos notifications…</p></main>;
  }

  return (
    <main className="agri-notifications-page">
      <header className="agri-notifications-hero">
        <div className="agri-notifications-hero-inner">
          <span className="agri-notifications-kicker"><BellRing size={15} /> Votre espace AgriMarket</span>
          <h1>Vos notifications,<br /><span>au même endroit.</span></h1>
          <p>Suivez les actualités de vos commandes, paiements et activités sur la marketplace.</p>
          <div className="agri-notifications-summary">
            <span className="agri-notifications-summary-icon"><Bell size={19} /></span>
            <span><strong>{unreadNotificationsCount}</strong><small>{unreadNotificationsCount === 1 ? "notification non lue" : "notifications non lues"}</small></span>
          </div>
        </div>
        <div className="agri-notifications-hero-art" aria-hidden="true"><BellRing size={112} /><Sprout size={38} /></div>
      </header>

      <section className="agri-notifications-content">
        <div className="agri-notifications-toolbar">
          <div className="agri-notifications-filters" aria-label="Filtrer les notifications">
            {filters.map(({ id, label }) => {
              const count = id === "ALL" ? notifications.length : id === "UNREAD" ? unreadNotificationsCount : notifications.filter((item) => item.type === id).length;
              return (
                <button key={id} type="button" className={filter === id ? "is-active" : ""} onClick={() => setFilter(id)} aria-pressed={filter === id}>
                  {label}<span>{count}</span>
                </button>
              );
            })}
          </div>
          {unreadNotificationsCount > 0 && (
            <button className="agri-notifications-mark-all" type="button" onClick={markAllNotificationsAsRead}>
              <CheckCheck size={16} /> Tout marquer comme lu
            </button>
          )}
        </div>

        {filteredNotifications.length ? (
          <div className="agri-notifications-list">
            {filteredNotifications.map((item) => {
              const Icon = iconForNotification(item);
              return (
                <article className={`agri-notification-card ${item.read ? "" : "is-unread"}`} key={item.id}>
                  <button className="agri-notification-open" type="button" onClick={() => openNotification(item)}>
                    <span className="agri-notification-icon"><Icon size={21} /></span>
                    <span className="agri-notification-copy">
                      <span className="agri-notification-meta"><span>{labelForNotification(item.type)}</span><time><Clock3 size={13} />{dateFr(item.date)}</time></span>
                      <strong>{item.title}</strong>
                      <span className="agri-notification-message">{item.message}</span>
                      <span className="agri-notification-read-link">Lire le détail <ArrowRight size={15} /></span>
                    </span>
                    {!item.read && <span className="agri-notification-unread-dot" aria-label="Non lue" />}
                  </button>
                  <div className="agri-notification-controls">
                    <button type="button" onClick={() => toggleNotificationReadStatus(item.id)} aria-label={item.read ? "Marquer comme non lue" : "Marquer comme lue"} title={item.read ? "Marquer comme non lue" : "Marquer comme lue"}>
                      <CheckCheck size={16} />
                    </button>
                    <button type="button" onClick={() => deleteNotification(item.id)} aria-label="Supprimer la notification" title="Supprimer">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="agri-notifications-empty">
            <span><Bell size={28} /></span>
            <h2>{filter === "UNREAD" ? "Tout est à jour" : "Aucune notification ici"}</h2>
            <p>{filter === "UNREAD" ? "Vous avez consulté toutes vos notifications." : "Les nouvelles liées à votre activité apparaîtront dans cet espace."}</p>
            <Link href="/catalogue">Explorer les offres <ArrowRight size={15} /></Link>
          </div>
        )}
      </section>

      {selectedNotification && (() => {
        const Icon = iconForNotification(selectedNotification);
        return (
          <div className="agri-notification-modal" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setSelectedId(null); }}>
            <section className="agri-notification-detail" role="dialog" aria-modal="true" aria-labelledby="notification-detail-title">
              <header>
                <span className="agri-notification-detail-icon"><Icon size={23} /></span>
                <button type="button" onClick={() => setSelectedId(null)} aria-label="Fermer"><X size={20} /></button>
              </header>
              <span className="agri-notification-detail-type">{labelForNotification(selectedNotification.type)}</span>
              <h2 id="notification-detail-title">{selectedNotification.title}</h2>
              <div className="agri-notification-detail-date"><Clock3 size={14} />{dateFr(selectedNotification.date)}</div>
              <p className="agri-notification-detail-message">{selectedNotification.details || selectedNotification.message}</p>
              {selectedNotification.link && (
                <Link href={selectedNotification.link} className="agri-notification-detail-action" onClick={() => setSelectedId(null)}>
                  {selectedNotification.linkText || "Ouvrir"}<ArrowRight size={16} />
                </Link>
              )}
              <button className="agri-notification-detail-close" type="button" onClick={() => setSelectedId(null)}>Fermer</button>
            </section>
          </div>
        );
      })()}
    </main>
  );
}
