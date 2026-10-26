"use client";

import { useState, useEffect, useRef } from "react";
import { useStore } from "@/lib/store";
import { useRequireAuth } from "@/composants/RequireAuth";
import { AccountShell } from "@/composants/AccountShell";
import { Check, Save, ShieldCheck, Upload, Camera } from "lucide-react";

const AVATAR_PRESETS = [
  "/Images/pexels-alesiakozik-7795760.jpg",
  "/Images/pexels-karola-g-4202326.jpg",
  "/Images/pexels-chidy-31141638.jpg",
  "/Images/pexels-valeriiamiller-3680203.jpg"
];

export default function ProfilPage() {
  const { user: authUser, hydrated } = useRequireAuth();
  const { user, updateUserProfile } = useStore();
  const fileInputRef = useRef(null);

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    avatar: "",
    farmType: "Maraîcher & Vivrier",
    region: "Centre",
    city: "Yaoundé",
    notificationsEmail: true,
    notificationsWhatsapp: true,
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
        phone: user.phone || "+237 600 000 000",
        avatar: user.avatar || AVATAR_PRESETS[0],
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

  const handleAvatarSelect = (url) => {
    setForm(prev => ({ ...prev, avatar: url }));
  };

  const handleFileUpload = (e) => {
    const file = e.target.files && e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (reader.result) {
          setForm(prev => ({ ...prev, avatar: reader.result }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const name = `${form.firstName} ${form.lastName}`.trim();
    updateUserProfile({
      name,
      firstName: form.firstName,
      lastName: form.lastName,
      email: form.email,
      phone: form.phone,
      avatar: form.avatar,
      farmType: form.farmType,
      region: form.region,
      city: form.city,
      notificationsEmail: form.notificationsEmail,
      notificationsWhatsapp: form.notificationsWhatsapp
    });
  };

  return (
    <AccountShell
      title="Mon Profil & Paramètres"
      description="Modifiez vos informations personnelles, votre profil agriculteur et vos préférences de communication pour un suivi plus fluide."
    >
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "30px", marginBottom: "70px" }}>
        
        {/* Hidden File Input for Avatar Upload */}
        <input
          type="file"
          ref={fileInputRef}
          accept="image/*"
          onChange={handleFileUpload}
          style={{ display: "none" }}
        />

        {/* CARD 1: Informations Personnelles & Photo de Profil */}
        <article className="order-card-luxury" style={{ background: "#ffffff", border: "1px solid #e3dcd5", padding: "30px 35px" }}>
          <div style={{ marginBottom: "24px", paddingBottom: "16px", borderBottom: "1px solid #efe8e1" }}>
            <span style={{ display: "block", fontSize: "11px", letterSpacing: "0.14em", color: "#1a6b42", fontWeight: "700", textTransform: "uppercase", marginBottom: "4px" }}>
              ESPACE IDENTITÉ
            </span>
            <h3 style={{ fontFamily: "var(--font-display), Georgia, serif", fontSize: "22px", margin: 0, color: "#1a1412", fontWeight: "400" }}>
              Informations Personnelles & Photo de Profil
            </h3>
          </div>

          {/* Avatar Selector Gallery & Image Upload */}
          <div style={{ marginBottom: "28px", background: "#f7faf7", border: "1px solid #dfece3", padding: "20px 24px", display: "flex", alignItems: "center", gap: "24px", flexWrap: "wrap" }}>
            <div
              style={{ position: "relative", width: "86px", height: "86px", flexShrink: 0, cursor: "pointer" }}
              onClick={() => fileInputRef.current?.click()}
              title="Cliquer pour importer une photo"
            >
              {form.avatar ? (
                <img src={form.avatar} alt="Photo de profil" style={{ width: "86px", height: "86px", borderRadius: "50%", objectFit: "cover", border: "2px solid #fff", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }} />
              ) : (
                <div style={{ width: "86px", height: "86px", borderRadius: "50%", background: "#1a6b42", color: "#fff", fontSize: "32px", fontWeight: "700", display: "grid", placeItems: "center" }}>
                  {(form.firstName || "U").charAt(0).toUpperCase()}
                </div>
              )}
              <span
                style={{
                  position: "absolute",
                  bottom: "0",
                  right: "0",
                  background: "#1a6b42",
                  color: "#fff",
                  width: "26px",
                  height: "26px",
                  borderRadius: "50%",
                  display: "grid",
                  placeItems: "center",
                  border: "2px solid #fff",
                  boxShadow: "0 2px 6px rgba(0,0,0,0.15)"
                }}
              >
                <Camera width={14} height={14} />
              </span>
            </div>
            
            <div style={{ flex: 1, minWidth: "220px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", marginBottom: "12px", flexWrap: "wrap" }}>
                <label style={{ fontSize: "11px", fontWeight: "700", letterSpacing: "0.1em", textTransform: "uppercase", color: "#55665d", margin: 0 }}>
                  PHOTO OU PORTRAIT DE PROFIL :
                </label>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="dior-btn-outline"
                  style={{ fontSize: "11px", height: "36px", padding: "0 14px", display: "inline-flex", alignItems: "center", gap: "6px" }}
                >
                  <Upload width={14} height={14} /> Importer depuis l'appareil
                </button>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "14px", flexWrap: "wrap" }}>
                {AVATAR_PRESETS.map((imgUrl, index) => (
                  <button
                    type="button"
                    key={index}
                    onClick={() => handleAvatarSelect(imgUrl)}
                    style={{
                      position: "relative",
                      width: "50px",
                      height: "50px",
                      borderRadius: "50%",
                      border: form.avatar === imgUrl ? "2px solid #1a6b42" : "2px solid #dcd3ca",
                      padding: 0,
                      background: "none",
                      cursor: "pointer",
                      overflow: "hidden",
                      transition: "all 0.2s ease",
                      transform: form.avatar === imgUrl ? "scale(1.08)" : "none"
                    }}
                  >
                    <img src={imgUrl} alt={`Avatar preset ${index + 1}`} style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "50%" }} />
                    {form.avatar === imgUrl && (
                      <span style={{ position: "absolute", inset: 0, background: "rgba(26, 107, 66, 0.5)", color: "#fff", display: "grid", placeItems: "center" }}>
                        <Check width={16} height={16} />
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="form-grid-2col">
            <div className="form-group-item">
              <label htmlFor="firstName">Prénom</label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                value={form.firstName}
                onChange={handleChange}
                placeholder="Ex: Jean"
                required
              />
            </div>

            <div className="form-group-item">
              <label htmlFor="lastName">Nom de famille</label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                value={form.lastName}
                onChange={handleChange}
                placeholder="Ex: Tchoua"
                required
              />
            </div>

            <div className="form-group-item">
              <label htmlFor="email">Adresse e-mail</label>
              <input
                type="email"
                id="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="votre.email@domaine.com"
                required
              />
            </div>

            <div className="form-group-item">
              <label htmlFor="phone">Numéro de Téléphone (Cameroun)</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                placeholder="+237 6XX XX XX XX"
              />
            </div>
          </div>
        </article>

        {/* CARD 2: Profil de l’exploitation & expertise */}
        <article className="order-card-luxury" style={{ background: "#ffffff", border: "1px solid #e3dcd5", padding: "30px 35px" }}>
          <div style={{ marginBottom: "24px", paddingBottom: "16px", borderBottom: "1px solid #efe8e1" }}>
            <span style={{ display: "block", fontSize: "11px", letterSpacing: "0.14em", color: "#1a6b42", fontWeight: "700", textTransform: "uppercase", marginBottom: "4px" }}>
              EXPERTISE AGRICOLE
            </span>
            <h3 style={{ fontFamily: "var(--font-display), Georgia, serif", fontSize: "22px", margin: 0, color: "#1a1412", fontWeight: "400" }}>
              Profil de l’exploitation & Activités
            </h3>
          </div>

          <div className="form-grid-3col">
            <div className="form-group-item">
              <label htmlFor="farmType">Activité agropastorale</label>
              <select id="farmType" name="farmType" value={form.farmType} onChange={handleChange}>
                <option value="Maraîcher & Vivrier">Maraîcher & Vivrier</option>
                <option value="Céréalier">Céréalier</option>
                <option value="Éleveur & Aviculteur">Éleveur & Aviculteur</option>
                <option value="Pépiniériste">Pépiniériste</option>
                <option value="Transformateur local">Transformateur local</option>
                <option value="Distributeur d'intrants">Distributeur d'intrants</option>
                <option value="Acheteur / Consommateur">Acheteur / Consommateur</option>
              </select>
            </div>

            <div className="form-group-item">
              <label htmlFor="region">Région (Cameroun)</label>
              <select id="region" name="region" value={form.region} onChange={handleChange}>
                <option value="Centre">Centre</option>
                <option value="Littoral">Littoral</option>
                <option value="Ouest">Ouest</option>
                <option value="Nord">Nord</option>
                <option value="Sud">Sud</option>
                <option value="Nord-Ouest">Nord-Ouest</option>
                <option value="Sud-Ouest">Sud-Ouest</option>
                <option value="Adamaoua">Adamaoua</option>
                <option value="Est">Est</option>
                <option value="Extrême-Nord">Extrême-Nord</option>
              </select>
            </div>

            <div className="form-group-item">
              <label htmlFor="city">Ville / Localité</label>
              <input
                type="text"
                id="city"
                name="city"
                value={form.city}
                onChange={handleChange}
                placeholder="Ex: Foumbot, Obala, Yaoundé..."
              />
            </div>
          </div>
        </article>

        {/* CARD 3: Sécurité & Mot de Passe */}
        <article className="order-card-luxury" style={{ background: "#ffffff", border: "1px solid #e3dcd5", padding: "30px 35px" }}>
          <div style={{ marginBottom: "24px", paddingBottom: "16px", borderBottom: "1px solid #efe8e1" }}>
            <span style={{ display: "block", fontSize: "11px", letterSpacing: "0.14em", color: "#1a6b42", fontWeight: "700", textTransform: "uppercase", marginBottom: "4px" }}>
              SÉCURITÉ DU COMPTE
            </span>
            <h3 style={{ fontFamily: "var(--font-display), Georgia, serif", fontSize: "22px", margin: 0, color: "#1a1412", fontWeight: "400" }}>
              Modification du Mot de Passe
            </h3>
          </div>

          <div className="form-grid-2col">
            <div className="form-group-item">
              <label htmlFor="newPassword">Nouveau mot de passe</label>
              <input
                type="password"
                id="newPassword"
                name="newPassword"
                value={form.newPassword}
                onChange={handleChange}
                placeholder="••••••••••••"
              />
            </div>

            <div className="form-group-item">
              <label htmlFor="confirmPassword">Confirmer le nouveau mot de passe</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={form.confirmPassword}
                onChange={handleChange}
                placeholder="••••••••••••"
              />
            </div>
          </div>
        </article>

        {/* CARD 4: Préférences & Notifications */}
        <article className="order-card-luxury" style={{ background: "#ffffff", border: "1px solid #e3dcd5", padding: "30px 35px" }}>
          <div style={{ marginBottom: "24px", paddingBottom: "16px", borderBottom: "1px solid #efe8e1" }}>
            <span style={{ display: "block", fontSize: "11px", letterSpacing: "0.14em", color: "#1a6b42", fontWeight: "700", textTransform: "uppercase", marginBottom: "4px" }}>
              COMMUNICATION
            </span>
            <h3 style={{ fontFamily: "var(--font-display), Georgia, serif", fontSize: "22px", margin: 0, color: "#1a1412", fontWeight: "400" }}>
              Préférences de Notification & Suivi de Commande
            </h3>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <label style={{ display: "flex", alignItems: "center", gap: "12px", cursor: "pointer", fontSize: "14px", color: "#4a3e50" }}>
              <input
                type="checkbox"
                name="notificationsEmail"
                checked={form.notificationsEmail}
                onChange={handleChange}
                style={{ width: "18px", height: "18px", accentColor: "#1a6b42" }}
              />
              <span>Recevoir les offres saisonnières, alertes produits et conseils agricoles par e-mail</span>
            </label>

            <label style={{ display: "flex", alignItems: "center", gap: "12px", cursor: "pointer", fontSize: "14px", color: "#4a3e50" }}>
              <input
                type="checkbox"
                name="notificationsWhatsapp"
                checked={form.notificationsWhatsapp}
                onChange={handleChange}
                style={{ width: "18px", height: "18px", accentColor: "#1a6b42" }}
              />
              <span>Recevoir le suivi de vos commandes et la disponibilité des produits sur WhatsApp</span>
            </label>
          </div>
        </article>

        {/* Submit Action Bar */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end" }}>
          <button type="submit" className="dior-btn-primary" style={{ height: "48px", padding: "0 36px" }}>
            <Save width={16} height={16} /> SAUVEGARDER LES MODIFICATIONS
          </button>
        </div>

      </form>
    </AccountShell>
  );
}
