"use client";

import { useState, useEffect, useRef } from "react";
import { useStore } from "@/lib/store";
import { useRequireAuth } from "@/composants/RequireAuth";
import { AccountShell } from "@/composants/AccountShell";
import { 
  Check, 
  Save, 
  ShieldCheck, 
  Upload, 
  Camera, 
  Sprout, 
  Store, 
  MapPin, 
  Phone, 
  MessageSquare, 
  Lock, 
  BellRing,
  AlertTriangle,
  UserCheck,
  KeyRound,
  RefreshCw,
  Mail,
  CheckCircle2
} from "lucide-react";

// Presets d'avatars de producteurs, éleveurs et acteurs agropastoraux
const AGRI_AVATAR_PRESETS = [
  "https://images.pexels.com/photos/2872755/pexels-photo-2872755.jpeg?auto=compress&w=300",
  "https://images.pexels.com/photos/547263/pexels-photo-547263.jpeg?auto=compress&w=300",
  "https://images.pexels.com/photos/2255459/pexels-photo-2255459.jpeg?auto=compress&w=300",
  "https://images.pexels.com/photos/162712/egg-white-food-protein-162712.jpeg?auto=compress&w=300"
];

const CAMEROON_REGIONS = [
  "Centre",
  "Littoral",
  "Ouest",
  "Nord",
  "Sud",
  "Nord-Ouest",
  "Sud-Ouest",
  "Adamaoua",
  "Est",
  "Extrême-Nord"
];

export default function ProfilPage() {
  const { user: authUser, hydrated } = useRequireAuth();
  const { 
    user, 
    updateUserProfile, 
    requestPasswordReset, 
    resetPassword, 
    notify 
  } = useStore();

  const fileInputRef = useRef(null);
  const [saving, setSaving] = useState(false);
  const [passwordError, setPasswordError] = useState("");

  // State for interactive password reset modal/workflow
  const [resetModalOpen, setResetModalOpen] = useState(false);
  const [resetStep, setResetStep] = useState(1); // 1: Demande, 2: Saisie code & nouveau mdp
  const [resetToken, setResetToken] = useState("");
  const [resetNewPassword, setResetNewPassword] = useState("");
  const [resetConfirmPassword, setResetConfirmPassword] = useState("");
  const [resetError, setResetError] = useState("");
  const [generatedTokenPreview, setGeneratedTokenPreview] = useState("");

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    whatsapp: "",
    avatar: "",
    userRole: "Producteur / Agriculteur",
    farmName: "",
    farmType: "Maraîcher & Vivrier",
    region: "Centre",
    city: "Yaoundé",
    notificationsEmail: true,
    notificationsWhatsapp: true,
    alertsHarvest: true,
    newPassword: "",
    confirmPassword: ""
  });

  useEffect(() => {
    if (user) {
      setForm(prev => ({
        ...prev,
        firstName: user.firstName || (user.name ? user.name.split(" ")[0] : ""),
        lastName: user.lastName || (user.name ? user.name.split(" ").slice(1).join(" ") : ""),
        email: user.email || "",
        phone: user.phone || "+237 677 00 00 00",
        whatsapp: user.whatsapp || user.phone || "+237 677 00 00 00",
        avatar: user.avatar || AGRI_AVATAR_PRESETS[0],
        userRole: user.userRole || (user.role === "SELLER" ? "Producteur / Agriculteur" : "Particulier / Acheteur"),
        farmName: user.farmName || "",
        farmType: user.farmType || "Maraîcher & Vivrier",
        region: user.region || "Centre",
        city: user.city || "Yaoundé"
      }));
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  // Immediate selection of avatar preset + instant synchronization to navbar
  const handleAvatarSelect = (url) => {
    setForm(prev => ({ ...prev, avatar: url }));
    updateUserProfile({ avatar: url });
    notify("Photo de profil mise à jour et synchronisée avec la barre de navigation !");
  };

  // File upload from computer/phone + instant synchronization to navbar
  const handleFileUpload = (e) => {
    const file = e.target.files && e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (reader.result) {
          const photoUrl = reader.result;
          setForm(prev => ({ ...prev, avatar: photoUrl }));
          updateUserProfile({ avatar: photoUrl });
          notify("Photo importée avec succès et visible sur votre profil et la barre de navigation !");
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setPasswordError("");

    if (form.newPassword) {
      if (form.newPassword.length < 6) {
        setPasswordError("Le mot de passe doit comporter au moins 6 caractères.");
        return;
      }
      if (form.newPassword !== form.confirmPassword) {
        setPasswordError("Les mots de passe saisis ne sont pas identiques.");
        return;
      }
    }

    setSaving(true);
    const fullName = `${form.firstName} ${form.lastName}`.trim();

    setTimeout(() => {
      updateUserProfile({
        name: fullName,
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        phone: form.phone,
        whatsapp: form.whatsapp,
        avatar: form.avatar,
        userRole: form.userRole,
        farmName: form.farmName,
        farmType: form.farmType,
        region: form.region,
        city: form.city,
        notificationsEmail: form.notificationsEmail,
        notificationsWhatsapp: form.notificationsWhatsapp,
        alertsHarvest: form.alertsHarvest
      });

      setSaving(false);
      setForm(prev => ({ ...prev, newPassword: "", confirmPassword: "" }));
      notify("Profil et photo enregistrés ! Visible immédiatement sur votre profil et la barre de navigation.");
    }, 350);
  };

  // Password reset request flow
  const handleRequestReset = () => {
    const targetEmail = form.email || user?.email || "client@agrimarket.cm";
    const res = requestPasswordReset(targetEmail);
    if (res && res.token) {
      setGeneratedTokenPreview(res.token);
      setResetToken(res.token);
      setResetStep(2);
      notify(`Code de sécurité généré : ${res.token}`);
    }
  };

  const handleConfirmReset = (e) => {
    e.preventDefault();
    setResetError("");

    if (!resetToken.trim()) {
      setResetError("Veuillez renseigner le code de réinitialisation reçu.");
      return;
    }
    if (!resetNewPassword || resetNewPassword.length < 6) {
      setResetError("Le nouveau mot de passe doit comporter au moins 6 caractères.");
      return;
    }
    if (resetNewPassword !== resetConfirmPassword) {
      setResetError("Les mots de passe ne correspondent pas.");
      return;
    }

    resetPassword(resetToken, resetNewPassword);
    setResetModalOpen(false);
    setResetStep(1);
    setResetNewPassword("");
    setResetConfirmPassword("");
    notify("Votre mot de passe a été réinitialisé avec succès !");
  };

  return (
    <AccountShell
      title="Mon Profil & Paramètres Agropastoraux"
      description="Gérez votre identité, votre exploitation, votre photo de profil visible sur toute la plateforme et la sécurité de votre compte."
    >
      {/* BANNIÈRE INTUITIVE DU PROFIL AGRIPASTORAL */}
      <section className="agri-profile-hero-banner">
        <div className="agri-profile-banner-top">
          {/* Avatar avec déclencheur de modification immédiate */}
          <div 
            className="agri-profile-banner-avatar"
            onClick={() => fileInputRef.current?.click()}
            title="Cliquer pour changer votre photo de profil"
            style={{ cursor: "pointer" }}
          >
            {form.avatar ? (
              <img src={form.avatar} alt="Photo de profil" />
            ) : (
              <div className="agri-profile-banner-avatar-fallback">
                {(form.firstName || user?.name || "A").charAt(0).toUpperCase()}
              </div>
            )}
            <div className="agri-avatar-badge-edit">
              <Camera width={14} height={14} />
            </div>
          </div>

          {/* Informations Clés & Badges */}
          <div className="agri-profile-banner-info">
            <span className="agri-profile-banner-kicker">
              <CheckCircle2 width={13} /> Profil Agropastoral Vérifié Cameroun
            </span>
            <h2>{form.firstName || user?.firstName || "Exploitant"} {form.lastName || user?.lastName || "AgriMarket"}</h2>

            <div className="agri-profile-banner-chips">
              <span className="agri-profile-chip badge-orange">
                <Sprout width={13} /> {form.userRole}
              </span>
              <span className="agri-profile-chip">
                <Store width={13} /> {form.farmType}
              </span>
              <span className="agri-profile-chip badge-lime">
                <MapPin width={13} /> {form.city || "Yaoundé"} ({form.region})
              </span>
            </div>
          </div>
        </div>

        {/* Statistiques & Reassurance de la bannière */}
        <div className="agri-profile-banner-stats">
          <div className="agri-profile-stat-item">
            <ShieldCheck width={15} /> Compte actif & identité vérifiée
          </div>
          <div className="agri-profile-stat-item">
            <MessageSquare width={15} /> WhatsApp : <strong>{form.whatsapp || form.phone}</strong>
          </div>
          <div className="agri-profile-stat-item" style={{ marginLeft: "auto" }}>
            <button 
              type="button" 
              onClick={() => fileInputRef.current?.click()}
              style={{ background: "#ffffff", color: "#07331e", border: "none", padding: "6px 14px", fontSize: "12px", fontWeight: "800", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 6 }}
            >
              <Camera width={14} /> Modifier ma photo
            </button>
          </div>
        </div>
      </section>

      {/* Main Profile Form */}
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "24px", marginBottom: "70px" }}>
        
        {/* Hidden File Input */}
        <input
          type="file"
          ref={fileInputRef}
          accept="image/*"
          onChange={handleFileUpload}
          style={{ display: "none" }}
        />

        {/* CARD 1: Identité & Coordonnées */}
        <article className="agri-profile-card">
          <div className="agri-profile-card-header">
            <div>
              <span className="kicker">IDENTITÉ & PHOTO VISIBLE PARTOUT</span>
              <h3>Photo de Profil & Informations Personnelles</h3>
            </div>
            <span className="agri-card-step-badge">
              <UserCheck width={13} style={{ verticalAlign: "middle", marginRight: 4 }} />
              Synchronisé en Temps Réel
            </span>
          </div>

          {/* Avatar selector & upload */}
          <div className="agri-avatar-selector-box">
            <div
              className="agri-avatar-main-frame"
              onClick={() => fileInputRef.current?.click()}
              title="Cliquer pour importer une photo personnalisée"
            >
              {form.avatar ? (
                <img src={form.avatar} alt="Photo de profil" />
              ) : (
                <div className="agri-avatar-placeholder">
                  {(form.firstName || "A").charAt(0).toUpperCase()}
                </div>
              )}
              <div className="agri-avatar-badge-edit">
                <Camera width={14} height={14} />
              </div>
            </div>

            <div style={{ flex: 1, minWidth: "240px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px", flexWrap: "wrap", gap: 10 }}>
                <label style={{ fontSize: "11px", fontWeight: 800, textTransform: "uppercase", color: "#07331e", letterSpacing: "0.5px" }}>
                  Photo visible sur votre profil et la barre de navigation :
                </label>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="agri-btn-locate"
                >
                  <Upload width={13} /> Importer depuis l'appareil
                </button>
              </div>

              <div className="agri-avatar-presets-wrap">
                {AGRI_AVATAR_PRESETS.map((imgUrl, idx) => (
                  <button
                    type="button"
                    key={idx}
                    onClick={() => handleAvatarSelect(imgUrl)}
                    className={`agri-avatar-preset-btn ${form.avatar === imgUrl ? "is-selected" : ""}`}
                    title="Choisir cet avatar"
                  >
                    <img src={imgUrl} alt={`Preset ${idx + 1}`} />
                    {form.avatar === imgUrl && (
                      <span style={{ position: "absolute", inset: 0, background: "rgba(11, 93, 51, 0.5)", color: "#fff", display: "grid", placeItems: "center" }}>
                        <Check width={18} height={18} />
                      </span>
                    )}
                  </button>
                ))}
              </div>
              <small style={{ color: "#0b5d33", display: "block", marginTop: "8px", fontWeight: 700, fontSize: "11px" }}>
                💡 Dès la sélection ou l'import, votre photo s'affiche instantanément sur votre profil et sur la barre de navigation en haut à droite !
              </small>
            </div>
          </div>

          {/* 2-Col Personal Fields */}
          <div className="agri-fields-grid">
            <div className="agri-field-group">
              <label>Prénom <span className="required">*</span></label>
              <input
                type="text"
                name="firstName"
                value={form.firstName}
                onChange={handleChange}
                placeholder="Ex: Paul"
                required
              />
            </div>

            <div className="agri-field-group">
              <label>Nom de Famille <span className="required">*</span></label>
              <input
                type="text"
                name="lastName"
                value={form.lastName}
                onChange={handleChange}
                placeholder="Ex: Mbida"
                required
              />
            </div>

            <div className="agri-field-group">
              <label>Adresse E-mail <span className="required">*</span></label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="votre.email@domaine.cm"
                required
              />
            </div>

            <div className="agri-field-group">
              <label>Téléphone d'Appel Direct <span className="required">*</span></label>
              <div className="agri-phone-input-wrap">
                <span className="agri-phone-prefix">🇨🇲 +237</span>
                <input
                  type="tel"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="699 00 11 22"
                  required
                />
              </div>
            </div>

            <div className="agri-field-group full-width">
              <label>Numéro WhatsApp Client / Professionnel <span className="required">*</span></label>
              <div className="agri-phone-input-wrap">
                <span className="agri-phone-prefix">💬 +237</span>
                <input
                  type="tel"
                  name="whatsapp"
                  value={form.whatsapp}
                  onChange={handleChange}
                  placeholder="677 88 99 00"
                  required
                />
              </div>
              <div className="agri-whatsapp-pill-badge" style={{ marginTop: 6 }}>
                <Check width={12} /> Reçu numérique PDF et alertes de livraison envoyés sur ce numéro
              </div>
            </div>
          </div>
        </article>

        {/* CARD 2: Profil Agropastoral & Localisation */}
        <article className="agri-profile-card">
          <div className="agri-profile-card-header">
            <div>
              <span className="kicker">FILIÈRE & TERROIR DU CAMEROUN</span>
              <h3>Profil de l'Exploitation & Activité Agropastorale</h3>
            </div>
            <Sprout width={20} style={{ color: "#0b5d33" }} />
          </div>

          <div className="agri-fields-grid">
            <div className="agri-field-group">
              <label>Votre Rôle Principal</label>
              <select name="userRole" value={form.userRole} onChange={handleChange}>
                <option value="Producteur / Agriculteur">Producteur Indépendant / Planteur</option>
                <option value="Éleveur & Aviculteur">Éleveur / Aviculteur / Pisciculteur</option>
                <option value="GIC ou Coopérative Agricole">GIC ou Coopérative Agricole</option>
                <option value="Transformateur local">Transformateur Agroalimentaire Local</option>
                <option value="Commerçant / Grossiste">Commerçant Vivrier / Grossiste B2B</option>
                <option value="Particulier / Acheteur">Particulier / Consommateur Ménage</option>
              </select>
            </div>

            <div className="agri-field-group">
              <label>Secteur & Spécialité</label>
              <select name="farmType" value={form.farmType} onChange={handleChange}>
                <option value="Maraîcher & Vivrier">Cultures Vivrières & Maraîchage</option>
                <option value="Céréalier">Céréales & Légumineuses (Maïs, Soja, Haricot)</option>
                <option value="Éleveur & Aviculteur">Élevage (Volailles, Porcins, Petits Ruminants)</option>
                <option value="Pépiniériste">Semences, Plants & Pépinières Certifiées</option>
                <option value="Distributeur d'intrants">Intrants, Fertilisants & Engrais Homologués</option>
                <option value="Outillage & Équipements">Outillage & Machinisme Agricole</option>
              </select>
            </div>

            <div className="agri-field-group full-width">
              <label>Nom de l'Exploitation, Ferme ou GIC (Optionnel)</label>
              <input
                type="text"
                name="farmName"
                value={form.farmName}
                onChange={handleChange}
                placeholder="Ex: Ferme Agro-Écologique d'Obala, Coopérative Maraîchère de Foumbot..."
              />
            </div>

            <div className="agri-field-group">
              <label>Région (Cameroun)</label>
              <select name="region" value={form.region} onChange={handleChange}>
                {CAMEROON_REGIONS.map(reg => (
                  <option key={reg} value={reg}>{reg}</option>
                ))}
              </select>
            </div>

            <div className="agri-field-group">
              <label>Ville / Bassin Agricole</label>
              <input
                type="text"
                name="city"
                value={form.city}
                onChange={handleChange}
                placeholder="Ex: Foumbot, Obala, Bafoussam, Yaoundé..."
              />
            </div>
          </div>
        </article>

        {/* CARD 3: Sécurité & Option de Réinitialisation du Mot de Passe */}
        <article className="agri-profile-card">
          <div className="agri-profile-card-header">
            <div>
              <span className="kicker">SÉCURITÉ & ACCÈS</span>
              <h3>Mot de Passe & Option de Réinitialisation</h3>
            </div>
            <Lock width={18} style={{ color: "#0b5d33" }} />
          </div>

          {passwordError && (
            <div style={{ padding: "10px 14px", background: "#fef2f2", border: "1px solid #fecaca", color: "#dc2626", fontSize: "13px", marginBottom: "16px", display: "flex", alignItems: "center", gap: 8 }}>
              <AlertTriangle width={15} />
              <span>{passwordError}</span>
            </div>
          )}

          <div className="agri-fields-grid">
            <div className="agri-field-group">
              <label>Nouveau mot de passe direct</label>
              <input
                type="password"
                name="newPassword"
                value={form.newPassword}
                onChange={handleChange}
                placeholder="Laisser vide si inchangé"
              />
            </div>

            <div className="agri-field-group">
              <label>Confirmer le nouveau mot de passe</label>
              <input
                type="password"
                name="confirmPassword"
                value={form.confirmPassword}
                onChange={handleChange}
                placeholder="Répétez le mot de passe"
              />
            </div>
          </div>

          {/* Option Spéciale : Réinitialisation interactive sans se déconnecter */}
          <div className="agri-password-reset-box">
            <h4>
              <KeyRound width={16} /> Option : Réinitialiser mon mot de passe avec code de sécurité
            </h4>
            <p>
              Vous avez oublié votre ancien mot de passe ou souhaitez générer un nouveau code de sécurité sans quitter votre session ?
            </p>
            <button 
              type="button" 
              className="agri-btn-prev" 
              onClick={() => { setResetModalOpen(true); setResetStep(1); }}
              style={{ background: "#ffffff", borderColor: "#f37021", color: "#c2410c", display: "inline-flex", alignItems: "center", gap: 8, padding: "8px 16px" }}
            >
              <RefreshCw width={14} /> Lancer la réinitialisation de mot de passe
            </button>
          </div>
        </article>

        {/* CARD 4: Préférences de Communication */}
        <article className="agri-profile-card">
          <div className="agri-profile-card-header">
            <div>
              <span className="kicker">COMMUNICATION & MARCHÉ</span>
              <h3>Préférences de Notification & Suivi</h3>
            </div>
            <BellRing width={20} style={{ color: "#f37021" }} />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <label style={{ display: "flex", alignItems: "flex-start", gap: "12px", cursor: "pointer", fontSize: "14px", color: "#1e293b" }}>
              <input
                type="checkbox"
                name="notificationsWhatsapp"
                checked={form.notificationsWhatsapp}
                onChange={handleChange}
                style={{ width: "18px", height: "18px", accentColor: "#0b5d33", marginTop: 2 }}
              />
              <div>
                <strong>Notifications WhatsApp automatiques</strong>
                <p style={{ margin: "2px 0 0", fontSize: "12px", color: "#64748b" }}>
                  Recevez immédiatement le reçu PDF de vos commandes et le lien de géolocalisation sur WhatsApp.
                </p>
              </div>
            </label>

            <label style={{ display: "flex", alignItems: "flex-start", gap: "12px", cursor: "pointer", fontSize: "14px", color: "#1e293b" }}>
              <input
                type="checkbox"
                name="alertsHarvest"
                checked={form.alertsHarvest}
                onChange={handleChange}
                style={{ width: "18px", height: "18px", accentColor: "#0b5d33", marginTop: 2 }}
              />
              <div>
                <strong>Alertes Arrivages & Prix du Marché Vivrier</strong>
                <p style={{ margin: "2px 0 0", fontSize: "12px", color: "#64748b" }}>
                  Soyez prévenu dès qu'une récolte fraîche (plantain, maïs, œufs, oignons) est disponible à prix direct coopérative.
                </p>
              </div>
            </label>

            <label style={{ display: "flex", alignItems: "flex-start", gap: "12px", cursor: "pointer", fontSize: "14px", color: "#1e293b" }}>
              <input
                type="checkbox"
                name="notificationsEmail"
                checked={form.notificationsEmail}
                onChange={handleChange}
                style={{ width: "18px", height: "18px", accentColor: "#0b5d33", marginTop: 2 }}
              />
              <div>
                <strong>Bulletin agronomique mensuel par e-mail</strong>
                <p style={{ margin: "2px 0 0", fontSize: "12px", color: "#64748b" }}>
                  Recevez les conseils de nos agronomes sur les calendriers culturaux et traitements bio.
                </p>
              </div>
            </label>
          </div>
        </article>

        {/* Action Button */}
        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 10 }}>
          <button
            type="submit"
            className="agri-btn-submit-order"
            disabled={saving}
          >
            <Save width={16} />
            {saving ? "Enregistrement en cours..." : "Sauvegarder les modifications du profil"}
          </button>
        </div>

      </form>

      {/* MODALE INTERACTIVE DE RÉINITIALISATION DE MOT DE PASSE (In-App) */}
      {resetModalOpen && (
        <div className="agri-modal-alert-overlay" onClick={() => setResetModalOpen(false)}>
          <div className="agri-modal-alert-card" style={{ maxWidth: "480px" }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
              <h3 style={{ margin: 0, display: "flex", alignItems: "center", gap: 8 }}>
                <KeyRound width={20} style={{ color: "#f37021" }} /> Réinitialisation du Mot de Passe
              </h3>
              <button 
                type="button" 
                onClick={() => setResetModalOpen(false)}
                style={{ background: "none", border: "none", fontSize: "18px", cursor: "pointer", color: "#64748b" }}
              >
                ✕
              </button>
            </div>

            {resetError && (
              <div style={{ padding: "8px 12px", background: "#fef2f2", border: "1px solid #fecaca", color: "#dc2626", fontSize: "12px", marginBottom: "14px" }}>
                {resetError}
              </div>
            )}

            {resetStep === 1 ? (
              <div>
                <p style={{ fontSize: "13px", color: "#475569", lineHeight: 1.5, marginBottom: "16px" }}>
                  Nous allons générer un code de réinitialisation sécurisé pour votre compte associé à l'e-mail <strong>{form.email || user?.email}</strong>.
                </p>
                <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
                  <button 
                    type="button" 
                    className="agri-btn-next" 
                    onClick={handleRequestReset}
                    style={{ flex: 1, justifyContent: "center" }}
                  >
                    <Mail width={15} /> Obtenir mon code de sécurité
                  </button>
                  <button 
                    type="button" 
                    className="agri-btn-prev" 
                    onClick={() => setResetModalOpen(false)}
                  >
                    Annuler
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleConfirmReset}>
                <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", padding: "10px 14px", marginBottom: "14px", fontSize: "12px", color: "#166534" }}>
                  Code généré : <strong>{generatedTokenPreview}</strong>
                </div>

                <div className="agri-field-group" style={{ marginBottom: 12 }}>
                  <label style={{ fontSize: "11px", fontWeight: 800 }}>Code de réinitialisation reçu *</label>
                  <input
                    type="text"
                    required
                    value={resetToken}
                    onChange={(e) => setResetToken(e.target.value)}
                    placeholder="Ex: RST-1234"
                  />
                </div>

                <div className="agri-field-group" style={{ marginBottom: 12 }}>
                  <label style={{ fontSize: "11px", fontWeight: 800 }}>Nouveau mot de passe *</label>
                  <input
                    type="password"
                    required
                    value={resetNewPassword}
                    onChange={(e) => setResetNewPassword(e.target.value)}
                    placeholder="6 caractères minimum"
                  />
                </div>

                <div className="agri-field-group" style={{ marginBottom: 18 }}>
                  <label style={{ fontSize: "11px", fontWeight: 800 }}>Confirmer le mot de passe *</label>
                  <input
                    type="password"
                    required
                    value={resetConfirmPassword}
                    onChange={(e) => setResetConfirmPassword(e.target.value)}
                    placeholder="Répétez le mot de passe"
                  />
                </div>

                <div style={{ display: "flex", gap: "10px" }}>
                  <button 
                    type="submit" 
                    className="agri-btn-submit-order" 
                    style={{ flex: 1, justifyContent: "center" }}
                  >
                    <Check width={15} /> Valider le nouveau mot de passe
                  </button>
                  <button 
                    type="button" 
                    className="agri-btn-prev" 
                    onClick={() => setResetModalOpen(false)}
                  >
                    Fermer
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </AccountShell>
  );
}
