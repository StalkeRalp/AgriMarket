"use client";

import { useState } from "react";
import Link from "next/link";
import { useStore } from "@/lib/store";
import { 
  Sprout, 
  Search, 
  Send, 
  ShieldCheck, 
  Truck, 
  Clock, 
  Check,
  CheckCircle2, 
  Store, 
  MessageSquare, 
  HelpCircle, 
  Calendar,
  Layers,
  ArrowRight,
  PhoneCall,
  Wheat,
  Bird,
  Tractor,
  Package,
  Sparkles,
  Zap
} from "lucide-react";

// Catégories visuelles avec icônes
const CATEGORY_TILES = [
  { 
    id: "vivriers", 
    name: "Vivriers & Céréales", 
    desc: "Plantain, Maïs sec, Manioc, Oignons...", 
    icon: Wheat 
  },
  { 
    id: "elevage", 
    name: "Élevage & Aviculture", 
    desc: "Poussins, Porcs, Alvéoles d'œufs...", 
    icon: Bird 
  },
  { 
    id: "semences", 
    name: "Semences & Plants", 
    desc: "Hybrides certifiés, Rejets de plantain...", 
    icon: Sprout 
  },
  { 
    id: "intrants", 
    name: "Intrants & Fertilisants", 
    desc: "NPK, Urée, Fientes, Compost bio...", 
    icon: Layers 
  },
  { 
    id: "materiel", 
    name: "Matériel & Irrigation", 
    desc: "Motopompes, Tuyaux, Pulvérisateurs...", 
    icon: Tractor 
  },
  { 
    id: "transformes", 
    name: "Produits Transformés", 
    desc: "Farines locales, Huiles végétales...", 
    icon: Package 
  }
];

const SUGGESTIONS = [
  { name: "Sacs de maïs jaune séché 50kg", cat: "Vivriers & Céréales", unit: "Sacs de 50 kg" },
  { name: "Régimes de plantain corne fort", cat: "Vivriers & Céréales", unit: "Régimes de plantain" },
  { name: "Poussins d'un jour race Goliath", cat: "Élevage & Aviculture", unit: "Têtes de bétail / Sujets" },
  { name: "Alvéoles de 30 œufs frais calibre gros", cat: "Élevage & Aviculture", unit: "Alvéoles (30 œufs)" },
  { name: "Semences de maïs hybride certifié", cat: "Semences & Plants", unit: "Sacs de 10 kg" },
  { name: "Engrais minéral NPK 20-10-10", cat: "Intrants & Fertilisants", unit: "Sacs de 50 kg" },
  { name: "Motopompe d'irrigation 3 pouces", cat: "Matériel & Irrigation", unit: "Unités / Pièces" }
];

const CAMEROON_REGIONS = [
  "Centre (Yaoundé, Obala, Mbalmayo...)",
  "Littoral (Douala, Edéa...)",
  "Ouest (Bafoussam, Foumbot, Dschang...)",
  "Nord (Garoua, Guider...)",
  "Sud (Ebolowa, Kribi, Sangmélima...)",
  "Nord-Ouest (Bamenda, Kumbo...)",
  "Sud-Ouest (Buea, Limbe, Kumba...)",
  "Adamaoua (Ngaoundéré...)",
  "Est (Bertoua, Batouri...)",
  "Extrême-Nord (Maroua, Kousséri...)"
];

const UNIT_OPTIONS = [
  "Sacs de 50 kg",
  "Sacs de 100 kg",
  "Tonnes (T)",
  "Kilogrammes (kg)",
  "Alvéoles (30 œufs)",
  "Régimes de plantain",
  "Cageots / Caisses",
  "Têtes de bétail / Sujets",
  "Litres / Bidons",
  "Unités / Pièces"
];

const URGENCIES = [
  { id: "urgent", label: "🚨 Urgent (sous 24h à 48h)", desc: "Besoin immédiat" },
  { id: "week", label: "⚡ Sous 1 semaine", desc: "Planifié court terme" },
  { id: "month", label: "📅 Dans le mois", desc: "Approvisionnement moyen terme" },
  { id: "campaign", label: "🌱 Pour la prochaine campagne", desc: "Réservation de récolte" }
];

export default function DemandeProduitPage() {
  const { productRequests, setProductRequests, notify, user } = useStore();
  const [submitting, setSubmitting] = useState(false);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);

  const [formData, setFormData] = useState({
    name: user?.name || (user?.firstName ? `${user.firstName} ${user.lastName || ""}`.trim() : ""),
    phone: user?.phone || "",
    whatsapp: user?.whatsapp || user?.phone || "",
    email: user?.email || "",
    region: user?.region ? `${user.region}` : CAMEROON_REGIONS[0],
    city: user?.city || "Douala",
    productName: "",
    category: CATEGORY_TILES[0].name,
    quantity: "",
    unit: "Sacs de 50 kg",
    supplyType: "Achat en gros / Approvisionnement professionnel (B2B)",
    targetBudget: "",
    urgency: URGENCIES[0].label,
    details: ""
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectCategory = (catName) => {
    setFormData(prev => ({ ...prev, category: catName }));
  };

  const handleApplySuggestion = (sug) => {
    setFormData(prev => ({
      ...prev,
      productName: sug.name,
      category: sug.cat,
      unit: sug.unit
    }));
    notify(`Suggestion appliquée : « ${sug.name} »`);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.productName.trim()) {
      notify("Veuillez indiquer le produit ou la denrée recherchée.");
      return;
    }
    if (!formData.phone.trim()) {
      notify("Veuillez renseigner un numéro de téléphone pour le rappel.");
      return;
    }

    setSubmitting(true);

    const newRequest = {
      id: `DEM-AGRI-${Date.now().toString().slice(-6)}`,
      createdAt: new Date().toISOString(),
      status: "Transmise aux producteurs",
      ...formData
    };

    setTimeout(() => {
      setProductRequests(current => [newRequest, ...(current || [])]);
      setSubmitting(false);
      setSubmittedSuccess(true);
      notify("Demande de sourcing transmise ! Nos producteurs partenaires ont été notifiés.");
      window.scrollTo({ top: 320, behavior: "smooth" });
    }, 400);
  };

  const resetForm = () => {
    setFormData(prev => ({
      ...prev,
      productName: "",
      quantity: "",
      targetBudget: "",
      details: ""
    }));
    setSubmittedSuccess(false);
  };

  return (
    <div className="agri-request-fullwidth-wrapper">
      {/* Breadcrumb */}
      <nav className="agri-checkout-breadcrumb" style={{ padding: "16px 0 10px" }}>
        <Link href="/">Accueil</Link>
        <span className="sep">/</span>
        <Link href="/catalogue">Catalogue Agropastoral</Link>
        <span className="sep">/</span>
        <strong>Sourcing & Approvisionnement Sur-Mesure Pleine Largeur</strong>
      </nav>

      {/* BANNIÈRE SPECTACULAIRE PLEINE LARGEUR */}
      <section className="agri-request-banner-wide">
        <span className="agri-checkout-hero-kicker">
          <Zap width={13} /> Cellule Sourcing & Approvisionnement Rapide
        </span>
        <h1>Vous ne trouvez pas un produit agricole ou un intrant ?</h1>
        <p>
          Déposez votre besoin en 2 minutes. AgriMarket interroge immédiatement son réseau de plus de <strong>500 coopératives maraîchères, fermes avicoles et fournisseurs d'intrants</strong> à travers les 10 régions du Cameroun. Vous recevez directement sur WhatsApp les photos de stocks disponibles et les meilleurs devis bord-champ.
        </p>

        {/* Badges Flottants de Réassurance */}
        <div className="agri-request-badges-ribbon">
          <div className="agri-request-badge-item">
            <CheckCircle2 width={18} /> Devis & Réponse sous 24h
          </div>
          <div className="agri-request-badge-item">
            <ShieldCheck width={18} /> Filière 100% Locale & Vérifiée
          </div>
          <div className="agri-request-badge-item">
            <Truck width={18} /> Acheminement Garanti Partout au Cameroun
          </div>
          <div className="agri-request-badge-item">
            <MessageSquare width={18} /> Photos & Négociation sur WhatsApp
          </div>
        </div>
      </section>

      {/* Main 2-Column Responsive Full-Width Layout */}
      <div className="agri-request-grid-layout">
        
        {/* Left Column: Interactive Form or Success State */}
        <div>
          {submittedSuccess ? (
            <div className="agri-form-card" style={{ padding: "48px 36px", textAlign: "center" }}>
              <div style={{ width: 68, height: 68, background: "#e6f3eb", color: "#0b5d33", display: "grid", placeItems: "center", margin: "0 auto 20px", border: "2px solid #a3e6be" }}>
                <CheckCircle2 width={36} height={36} />
              </div>
              <h2 style={{ fontSize: 24, color: "#07331e", margin: "0 0 12px", fontWeight: 900 }}>Demande de Sourcing Enregistrée !</h2>
              <p style={{ color: "#475569", maxWidth: 620, margin: "0 auto 24px", fontSize: 15, lineHeight: 1.6 }}>
                Votre requête pour <strong>« {formData.productName} »</strong> ({formData.quantity} {formData.unit}) a été transmise aux coopératives et exploitants partenaires de la région <strong>{formData.region}</strong>.
                Notre équipe logistique vous contactera via WhatsApp au <strong>+237 {formData.whatsapp || formData.phone}</strong> avec une offre chiffrée.
              </p>

              <div style={{ display: "flex", justifyContent: "center", gap: 14, flexWrap: "wrap", marginTop: 24 }}>
                <button type="button" className="agri-btn-next" onClick={resetForm}>
                  Soumettre une autre demande
                </button>
                <Link href="/catalogue" className="agri-btn-prev" style={{ textDecoration: "none" }}>
                  Explorer le catalogue
                </Link>
                <a 
                  href={`https://wa.me/237699000000?text=${encodeURIComponent(`Bonjour AgriMarket, je viens de déposer la demande *${formData.productName}* (${formData.quantity} ${formData.unit}). Avez-vous déjà des stocks disponibles ?`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="agri-btn-whatsapp-share"
                >
                  <MessageSquare width={15} /> Discuter avec le service Sourcing sur WhatsApp
                </a>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="agri-form-card">
              
              {/* Header */}
              <div className="agri-form-card-header">
                <div className="agri-form-card-title">
                  <div className="icon-wrap">
                    <Search width={18} />
                  </div>
                  <h3>Formulaire d'Approvisionnement Intuitif & Rapide</h3>
                </div>
                <span className="agri-card-step-badge">
                  Remplissage en 2 min
                </span>
              </div>

              <div className="agri-form-card-body">
                
                {/* 1. SÉLECTION VISUELLE DE CATÉGORIE (Tuiles interactives) */}
                <div style={{ marginBottom: "26px" }}>
                  <label style={{ fontSize: "12px", fontWeight: 800, textTransform: "uppercase", color: "#07331e", display: "block", marginBottom: "10px" }}>
                    1. Choisissez la catégorie du produit :
                  </label>
                  <div className="agri-category-visual-grid">
                    {CATEGORY_TILES.map((cat) => {
                      const Icon = cat.icon;
                      const isSelected = formData.category.includes(cat.name.split(" ")[0]);
                      return (
                        <div
                          key={cat.id}
                          className={`agri-category-tile ${isSelected ? "is-active" : ""}`}
                          onClick={() => handleSelectCategory(cat.name)}
                        >
                          <div className="agri-category-tile-icon">
                            <Icon width={20} />
                          </div>
                          <div>
                            <strong>{cat.name}</strong>
                            <small style={{ color: "#64748b", fontSize: "11px", display: "block", marginTop: 2 }}>{cat.desc}</small>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 2. DÉSIGNATION DU PRODUIT & SUGGESTIONS RAPIDES */}
                <div style={{ marginBottom: "26px" }}>
                  <label style={{ fontSize: "12px", fontWeight: 800, textTransform: "uppercase", color: "#07331e", display: "block", marginBottom: "6px" }}>
                    2. Nom du produit ou denrée recherchée <span style={{ color: "#f37021" }}>*</span>
                  </label>
                  <input
                    type="text"
                    required
                    name="productName"
                    value={formData.productName}
                    onChange={handleChange}
                    placeholder="Ex: Sacs de maïs jaune 50kg, Poussins Goliath, Régimes de plantain..."
                    style={{ width: "100%", padding: "14px 16px", fontSize: "15px", border: "2px solid #cbd5e1" }}
                  />

                  {/* Suggestions en 1 clic */}
                  <div style={{ marginTop: 10 }}>
                    <span style={{ fontSize: "11px", color: "#64748b", fontWeight: 700, textTransform: "uppercase" }}>
                      💡 Suggestions fréquentes (cliquez pour pré-remplir) :
                    </span>
                    <div className="agri-suggestions-ribbon">
                      {SUGGESTIONS.map((sug, i) => (
                        <button
                          key={i}
                          type="button"
                          className="agri-suggestion-chip"
                          onClick={() => handleApplySuggestion(sug)}
                        >
                          <Sparkles width={12} style={{ color: "#f37021" }} />
                          {sug.name}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* 3. QUANTITÉS, CONDITIONNEMENT & BUDGET */}
                <div style={{ marginBottom: "26px" }}>
                  <label style={{ fontSize: "12px", fontWeight: 800, textTransform: "uppercase", color: "#07331e", display: "block", marginBottom: "10px" }}>
                    3. Volumes et Conditionnement souhaité :
                  </label>
                  <div className="agri-fields-grid">
                    <div className="agri-field-group">
                      <label>Quantité / Nombre <span className="required">*</span></label>
                      <input
                        type="text"
                        required
                        name="quantity"
                        value={formData.quantity}
                        onChange={handleChange}
                        placeholder="Ex: 50, 200, 10..."
                      />
                    </div>

                    <div className="agri-field-group">
                      <label>Unité de Mesure <span className="required">*</span></label>
                      <select name="unit" value={formData.unit} onChange={handleChange}>
                        {UNIT_OPTIONS.map(u => (
                          <option key={u} value={u}>{u}</option>
                        ))}
                      </select>
                    </div>

                    <div className="agri-field-group">
                      <label>Type d'Approvisionnement</label>
                      <select name="supplyType" value={formData.supplyType} onChange={handleChange}>
                        <option value="Achat en gros / Approvisionnement professionnel (B2B)">Achat en gros B2B</option>
                        <option value="Demi-gros / Commande groupée">Demi-gros / Commande groupée</option>
                        <option value="Consommation au détail ménage">Consommation au détail</option>
                        <option value="Contrat régulier / Récurrent">Contrat régulier récurrent</option>
                      </select>
                    </div>

                    <div className="agri-field-group">
                      <label>Budget Cible Estimé (FCFA)</label>
                      <input
                        type="text"
                        name="targetBudget"
                        value={formData.targetBudget}
                        onChange={handleChange}
                        placeholder="Ex: 22 000 FCFA/sac ou 1 000 000 FCFA total"
                      />
                    </div>
                  </div>
                </div>

                {/* 4. SÉLECTEUR D'URGENCE INTERACTIF */}
                <div style={{ marginBottom: "26px" }}>
                  <label style={{ fontSize: "12px", fontWeight: 800, textTransform: "uppercase", color: "#07331e", display: "block", marginBottom: "8px" }}>
                    4. Délai & Urgence de livraison :
                  </label>
                  <div className="agri-urgency-selector">
                    {URGENCIES.map(u => {
                      const isSelected = formData.urgency === u.label;
                      return (
                        <div
                          key={u.id}
                          className={`agri-urgency-pill ${isSelected ? "is-selected" : ""}`}
                          onClick={() => setFormData(prev => ({ ...prev, urgency: u.label }))}
                        >
                          <Clock width={15} />
                          <div>
                            <div>{u.label}</div>
                            <small style={{ fontSize: "10px", color: "#64748b" }}>{u.desc}</small>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 5. COORDONNÉES DE LIVRAISON & WHATSAPP DIRECT */}
                <div style={{ marginBottom: "26px" }}>
                  <label style={{ fontSize: "12px", fontWeight: 800, textTransform: "uppercase", color: "#07331e", display: "block", marginBottom: "10px" }}>
                    5. Vos Coordonnées pour l'envoi des devis :
                  </label>

                  <div className="agri-fields-grid">
                    <div className="agri-field-group">
                      <label>Nom ou Entreprise <span className="required">*</span></label>
                      <input
                        type="text"
                        required
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Ex: Alain Nkomo ou GIC Agro"
                      />
                    </div>

                    <div className="agri-field-group">
                      <label>Téléphone d'Appel <span className="required">*</span></label>
                      <div className="agri-phone-input-wrap">
                        <span className="agri-phone-prefix">🇨🇲 +237</span>
                        <input
                          type="tel"
                          required
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          placeholder="699 00 11 22"
                        />
                      </div>
                    </div>

                    <div className="agri-field-group full-width">
                      <label>Numéro WhatsApp pour Devis & Photos <span className="required">*</span></label>
                      <div className="agri-phone-input-wrap">
                        <span className="agri-phone-prefix">💬 +237</span>
                        <input
                          type="tel"
                          required
                          name="whatsapp"
                          value={formData.whatsapp}
                          onChange={handleChange}
                          placeholder="677 88 99 00"
                        />
                      </div>
                      <div className="agri-whatsapp-pill-badge" style={{ marginTop: 6 }}>
                        <Check width={12} /> Les coopératives vous envoient les photos directes des stocks et le prix bord-champ
                      </div>
                    </div>

                    <div className="agri-field-group">
                      <label>Région de Réception <span className="required">*</span></label>
                      <select name="region" value={formData.region} onChange={handleChange}>
                        {CAMEROON_REGIONS.map(reg => (
                          <option key={reg} value={reg}>{reg}</option>
                        ))}
                      </select>
                    </div>

                    <div className="agri-field-group">
                      <label>Ville / Quartier de Destination <span className="required">*</span></label>
                      <input
                        type="text"
                        required
                        name="city"
                        value={formData.city}
                        onChange={handleChange}
                        placeholder="Ex: Douala, Yaoundé, Bafoussam..."
                      />
                    </div>

                    <div className="agri-field-group full-width">
                      <label>Précisions, Variété ou Exigences Particulières</label>
                      <textarea
                        name="details"
                        rows={3}
                        value={formData.details}
                        onChange={handleChange}
                        placeholder="Ex: Taux d'humidité < 14%, variété locale jaune, calibrage gros, fientes sèches en sac, certificat phytosanitaire..."
                      />
                    </div>
                  </div>
                </div>

                {/* Submit Action Button */}
                <div className="agri-step-actions-bar" style={{ justifyContent: "flex-end" }}>
                  <button 
                    type="submit" 
                    className="agri-btn-submit-order" 
                    disabled={submitting}
                    style={{ padding: "16px 36px", fontSize: "15px" }}
                  >
                    {submitting ? "Transmission en cours..." : "Transmettre ma demande de sourcing aux producteurs"}
                    <Send width={18} />
                  </button>
                </div>

              </div>
            </form>
          )}

          {/* Section: Historique des demandes de sourcing */}
          {productRequests && productRequests.length > 0 && (
            <section style={{ marginTop: "40px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                <h3 style={{ fontSize: "18px", fontWeight: 900, color: "#07331e", textTransform: "uppercase", margin: 0 }}>
                  Vos Demandes d'Approvisionnement en cours ({productRequests.length})
                </h3>
                <span style={{ fontSize: "12px", color: "#0b5d33", fontWeight: 700 }}>
                  Mise à jour en temps réel
                </span>
              </div>

              <div className="agri-my-requests-list">
                {productRequests.map((req, idx) => (
                  <article className="agri-my-request-card" key={req.id || idx}>
                    <div className="agri-my-request-info">
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                        <Sprout width={16} style={{ color: "#0b5d33" }} />
                        <strong>{req.productName || req.product || "Produit agricole"}</strong>
                      </div>
                      <span>
                        Quantité : <strong>{req.quantity} {req.unit || ""}</strong> · Destination : <strong>{req.city || req.region}</strong>
                      </span>
                      <small style={{ color: "#64748b", display: "block", marginTop: 4 }}>
                        Émise le {req.createdAt ? new Date(req.createdAt).toLocaleDateString("fr-FR") : "Aujourd'hui"} · Réf : {req.id}
                      </small>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <span className="agri-my-request-status">
                        {req.status || "Transmise aux producteurs"}
                      </span>
                      <a 
                        href={`https://wa.me/237699000000?text=${encodeURIComponent(`Bonjour, je souhaite un suivi pour ma demande de sourcing *${req.id}* (${req.productName || req.product}).`)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="agri-btn-whatsapp-share"
                        style={{ padding: "8px 14px", fontSize: "11px" }}
                      >
                        <MessageSquare width={13} /> Suivi WhatsApp
                      </a>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Right Sidebar: Guide & Sourcing Direct WhatsApp */}
        <aside>
          <div className="agri-request-sidebar-box">
            <h3>Comment fonctionne le sourcing AgriMarket ?</h3>

            <div className="agri-request-sidebar-step">
              <div className="agri-request-sidebar-num">1</div>
              <p>
                <strong>Dépôt de votre besoin</strong> : Renseignez la denrée, les quantités et votre localisation au Cameroun.
              </p>
            </div>

            <div className="agri-request-sidebar-step">
              <div className="agri-request-sidebar-num">2</div>
              <p>
                <strong>Sondage des coopératives</strong> : Notre plateforme interroge les producteurs et éleveurs des bassins agricoles (Foumbot, Obala, Bafoussam, Grand Nord...).
              </p>
            </div>

            <div className="agri-request-sidebar-step">
              <div className="agri-request-sidebar-num">3</div>
              <p>
                <strong>Offres et photos sur WhatsApp</strong> : Vous recevez les photos réelles des stocks et le prix bord-champ sans intermédiaire.
              </p>
            </div>

            <div className="agri-request-sidebar-step">
              <div className="agri-request-sidebar-num">4</div>
              <p>
                <strong>Livraison sécurisée</strong> : Validation et expédition directe vers votre exploitation, entrepôt ou point relais.
              </p>
            </div>

            {/* Assistance Rapide */}
            <div style={{ marginTop: 24, paddingTop: 18, borderTop: "1px dashed #cbd5e1" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, color: "#07331e", fontSize: "13px", fontWeight: 800, marginBottom: 8 }}>
                <PhoneCall width={16} style={{ color: "#f37021" }} />
                <span>Urgence d'approvisionnement ?</span>
              </div>
              <p style={{ fontSize: "12px", color: "#64748b", margin: "0 0 14px", lineHeight: 1.5 }}>
                Notre équipe logistique est disponible en direct du lundi au samedi de 07h à 19h.
              </p>
              <a 
                href="https://wa.me/237699000000?text=Bonjour,%20j'ai%20une%20demande%20d'approvisionnement%20agropastorale%20urgente."
                target="_blank"
                rel="noopener noreferrer"
                className="agri-btn-whatsapp-share"
                style={{ width: "100%", justifyContent: "center", boxSizing: "border-box", fontSize: "12px", padding: "12px 16px" }}
              >
                <MessageSquare width={15} /> Contacter la cellule Sourcing (+237 699 000 000)
              </a>
            </div>
          </div>
        </aside>

      </div>
    </div>
  );
}
