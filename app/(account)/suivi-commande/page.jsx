"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Search, CheckCircle2, Truck, Package, Clock, ShieldCheck, Download, ArrowRight, MapPin, Sparkles } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useStore } from "@/lib/store";
import { dateFr, money } from "@/lib/format";
import { generateReceiptPDF } from "@/lib/pdfReceipt";

const DEFAULT_DEMO_ORDER = {
  id: "CMD-81725363",
  createdAt: "2026-08-13T01:30:00.000Z",
  status: "Nouvelle",
  currentStepIndex: 1, // 1: Nouvelle, 2: Confirmée, 3: Préparation, 4: Expédiée, 5: Livrée
  total: 68500,
  shipping: 2000,
  city: "Douala",
  district: "Bonapriso",
  address: "Face Boulangerie Z, portail vert",
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

export default function SuiviCommandePage() {
  const searchParams = useSearchParams();
  const initialCode = searchParams.get("code") || "";
  const { orders } = useStore();

  const [query, setQuery] = useState(initialCode);
  const [searchedOrder, setSearchedOrder] = useState(null);
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    if (initialCode) {
      handleSearchCode(initialCode);
    } else {
      setSearchedOrder(DEFAULT_DEMO_ORDER);
    }
  }, [initialCode, orders]);

  const handleSearchCode = (codeToSearch) => {
    const code = codeToSearch.trim();
    if (!code) return;
    setSearched(true);
    const found = orders ? orders.find(o => o.id.toLowerCase() === code.toLowerCase()) : null;
    if (found) {
      setSearchedOrder(found);
    } else if (code.toUpperCase().startsWith("CMD-") || code.toUpperCase().startsWith("ITX-")) {
      setSearchedOrder({
        ...DEFAULT_DEMO_ORDER,
        id: code.toUpperCase()
      });
    } else {
      setSearchedOrder(null);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    handleSearchCode(query);
  };

  const steps = [
    { step: 1, label: "Nouvelle", desc: "Commande reçue" },
    { step: 2, label: "Confirmée", desc: "Paiement validé" },
    { step: 3, label: "Préparation", desc: "En atelier" },
    { step: 4, label: "Expédiée", desc: "Remise au coursier" },
    { step: 5, label: "Livrée", desc: "Remise en mains propres" }
  ];

  const currentStep = searchedOrder 
    ? (searchedOrder.currentStepIndex || (searchedOrder.status === "LIVRÉE" ? 5 : searchedOrder.status === "EN COURS D'EXPÉDITION" ? 4 : 1))
    : 1;

  return (
    <main className="suivi-page">
      {/* Luxury Breadcrumb */}
      <nav className="collection-breadcrumb container">
        <Link href="/">Accueil</Link>
        <span>/</span>
        <Link href="/commandes">Mes Commandes</Link>
        <span>/</span>
        <strong>Suivi de Colis & Colisage</strong>
      </nav>

      {/* Hero Header */}
      <header className="orders-hero container">
        <div className="orders-hero__inner">
          <span className="eyebrow">MAISON ITEXAL — SUIVI EXPRESS</span>
          <h1>Suivez votre colis en temps réel</h1>
          <p>
            Saisissez le numéro de référence attribué lors de votre commande pour connaître l'état d'avancement exact de votre livraison.
          </p>

          {/* Search Form Box */}
          <form onSubmit={handleSearchSubmit} className="suivi-search-box">
            <div className="suivi-input-wrap">
              <Search width={18} className="search-icon" />
              <input
                type="text"
                placeholder="Ex: CMD-81725363 ou ITX-2026-8942"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="dior-btn-primary">
              Rechercher <ArrowRight width={15} />
            </button>
          </form>
        </div>
      </header>

      <div className="container" style={{ maxWidth: "1000px" }}>
        {searchedOrder ? (
          <article className="order-track-card-luxury">
            {/* Header Section */}
            <div className="track-card-top">
              <div className="track-id-group">
                <span className="track-kicker">SUIVI DE COMMANDE</span>
                <h2>{searchedOrder.id}</h2>
                <span className="track-date">
                  Effectuée le {searchedOrder.createdAt ? dateFr(searchedOrder.createdAt) : "13 Août 2026"}
                </span>
              </div>
              <div className="track-badge-pill">
                <Sparkles width={14} />
                <span>{searchedOrder.status || "Nouvelle"}</span>
              </div>
            </div>

            {/* 5-Step Haute Couture Progress Tracker Bar */}
            <div className="track-progress-wrapper">
              <div className="track-line-bg">
                <div 
                  className="track-line-fill" 
                  style={{ width: `${((currentStep - 1) / 4) * 100}%` }} 
                />
              </div>

              <div className="track-steps-nodes">
                {steps.map((item) => {
                  const isDone = item.step <= currentStep;
                  const isCurrent = item.step === currentStep;
                  return (
                    <div 
                      key={item.step} 
                      className={`track-node ${isDone ? "is-done" : ""} ${isCurrent ? "is-current" : ""}`}
                    >
                      <div className="node-circle">
                        {isDone ? <CheckCircle2 width={18} /> : item.step}
                      </div>
                      <strong className="node-label">{item.label}</strong>
                      <small className="node-desc">{item.desc}</small>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Shipping Info Details Grid */}
            <div className="order-shipping-meta" style={{ marginTop: "35px" }}>
              <div>
                <small>Mode de règlement :</small>
                <strong>{searchedOrder.paymentMethod || "MTN Mobile Money / OM"}</strong>
              </div>
              <div>
                <small>Adresse de destination :</small>
                <strong>{searchedOrder.city || "Douala"} ({searchedOrder.district || "Bonapriso"})</strong>
              </div>
              <div>
                <small>Total de la commande :</small>
                <strong>{money ? money(searchedOrder.total) : `${searchedOrder.total} FCFA`}</strong>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="track-card-footer">
              <button 
                className="dior-btn-primary"
                onClick={() => generateReceiptPDF(searchedOrder)}
              >
                <Download width={16} /> Télécharger le reçu (PDF)
              </button>

              <Link 
                href={`/confirmation/${searchedOrder.id}`} 
                className="dior-btn-outline"
              >
                Voir le détail complet
              </Link>
            </div>
          </article>
        ) : (
          /* Empty / Not Found State */
          searched && (
            <div className="orders-empty-card">
              <Package width={48} height={48} />
              <h2>Commande introuvable</h2>
              <p>Aucune référence correspondant à "{query}" n'a été trouvée. Veuillez vérifier votre numéro de commande.</p>
              <Link href="/commandes" className="dior-btn-primary">
                Voir toutes mes commandes <ArrowRight width={16} />
              </Link>
            </div>
          )
        )}
      </div>
    </main>
  );
}
