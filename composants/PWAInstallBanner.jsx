"use client";

import { useEffect, useState } from "react";
import { Download, X, Sparkles } from "lucide-react";

/**
 * PWAInstallBanner
 * 
 * Ce composant :
 * 1. Écoute l'événement natif `beforeinstallprompt` du navigateur
 * 2. Empêche le mini-infobar natif (peu visible) de s'afficher
 * 3. Affiche à la place une bannière AgriMarket personnalisée
 * 4. Déclenche l'installation quand l'utilisateur clique "Installer"
 * 
 * ⚠️ Fonctionne uniquement en production (npm run build && npm start)
 *    ou via HTTPS. Pas en dev HTTP.
 */
export function PWAInstallBanner() {
  const [installPrompt, setInstallPrompt] = useState(null);
  const [showBanner, setShowBanner] = useState(false);
  const [installed, setInstalled] = useState(false);
  const [showInstallHelp, setShowInstallHelp] = useState(false);

  useEffect(() => {
    // Ne pas afficher si déjà installé (mode standalone = app installée)
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setInstalled(true);
      return;
    }

    const showInstallPrompt = () => setShowBanner(true);
    window.addEventListener("agrimarket:request-install", showInstallPrompt);

    // Ne pas réafficher automatiquement si l'utilisateur a déjà refusé dans cette session.
    // Le bouton explicite du footer peut toutefois rouvrir les instructions.
    let dismissed = false;
    try { dismissed = window.sessionStorage.getItem("itexal-pwa-dismissed") === "1"; } catch {}
    if (dismissed) return () => window.removeEventListener("agrimarket:request-install", showInstallPrompt);

    const handler = (e) => {
      // Bloquer le prompt natif du navigateur
      e.preventDefault();
      // Sauvegarder l'événement pour l'utiliser plus tard
      setInstallPrompt(e);
      // Afficher notre bannière après 3 secondes (moins intrusif)
      setTimeout(() => setShowBanner(true), 3000);
    };

    window.addEventListener("beforeinstallprompt", handler);
    const onInstalled = () => {
      setShowBanner(false);
      setInstalled(true);
      setInstallPrompt(null);
      setShowInstallHelp(false);
    };

    // Détecter si l'app vient d'être installée
    window.addEventListener("appinstalled", onInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
      window.removeEventListener("appinstalled", onInstalled);
      window.removeEventListener("agrimarket:request-install", showInstallPrompt);
    };
  }, []);

  const handleInstall = async () => {
    if (!installPrompt) {
      setShowBanner(false);
      setShowInstallHelp(true);
      return;
    }
    // Déclencher le prompt natif d'installation
    installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    if (outcome === "accepted") {
      setShowBanner(false);
    }
    setInstallPrompt(null);
  };

  const handleDismiss = () => {
    setShowBanner(false);
    // Ne plus montrer dans cette session
    try { window.sessionStorage.setItem("itexal-pwa-dismissed", "1"); } catch {}
  };

  if (installed) return null;

  if (showInstallHelp) {
    return (
      <div role="dialog" aria-modal="true" aria-label="Installer AgriMarket" style={{ position: "fixed", inset: 0, zIndex: 100000, display: "grid", placeItems: "center", padding: 18, background: "rgba(4,28,17,.66)" }}>
        <section style={{ width: "min(100%, 430px)", padding: 26, border: "1px solid #dce8dc", borderRadius: 16, background: "#fff", color: "#153b25", boxShadow: "0 22px 70px rgba(0,0,0,.25)" }}>
          <h2 style={{ margin: "0 0 10px", fontSize: 21 }}>Ajouter AgriMarket à votre téléphone</h2>
          <p style={{ margin: "0 0 18px", color: "#5d6d61", lineHeight: 1.6 }}>Ouvrez le menu de votre navigateur, puis choisissez « Installer l’application » ou « Ajouter à l’écran d’accueil ».</p>
          <button type="button" onClick={() => setShowInstallHelp(false)} style={{ minHeight: 44, padding: "0 18px", border: 0, borderRadius: 8, background: "#0b5d33", color: "#fff", fontWeight: 750, cursor: "pointer" }}>Compris</button>
        </section>
      </div>
    );
  }

  if (!showBanner) return null;

  return (
    <div
      style={{
        position: "fixed",
        bottom: "24px",
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 99999,
        width: "min(520px, calc(100vw - 32px))",
        background: "#ffffff",
        border: "1px solid #e3dcd5",
        boxShadow: "0 20px 60px rgba(41, 21, 51, 0.18), 0 4px 16px rgba(135, 56, 206, 0.10)",
        display: "flex",
        alignItems: "center",
        gap: "16px",
        padding: "16px 20px",
        animation: "slideUpBanner 0.4s cubic-bezier(0.16, 1, 0.3, 1) both",
      }}
      role="dialog"
      aria-label="Installer l'application AgriMarket"
    >
      <style>{`
        @keyframes slideUpBanner {
          from { opacity: 0; transform: translateX(-50%) translateY(20px); }
          to   { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
      `}</style>

      {/* Logo / Icône */}
      <div style={{
        width: "52px",
        height: "52px",
        borderRadius: "14px",
        overflow: "hidden",
        flexShrink: 0,
        border: "1px solid #ede6f7",
        background: "#faf5ff",
        display: "grid",
        placeItems: "center",
      }}>
        <img src="/logo/AgriMarket_logo.png" alt="AgriMarket" style={{ width: "44px", height: "44px", objectFit: "contain" }} />
      </div>

      {/* Texte */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "2px" }}>
          <Sparkles width={12} height={12} style={{ color: "#0d6b3c", flexShrink: 0 }} />
          <span style={{
            fontSize: "10px",
            fontWeight: "700",
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: "#0d6b3c",
          }}>
            AGRIMARKET
          </span>
        </div>
        <p style={{
          margin: 0,
          fontSize: "14px",
          fontWeight: "600",
          color: "#1a1412",
          lineHeight: "1.3",
        }}>
          Installer l'application
        </p>
        <p style={{
          margin: "2px 0 0 0",
          fontSize: "12px",
          color: "#6a625a",
          lineHeight: "1.4",
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}>
          Accès rapide • Mode hors-ligne • Notifications
        </p>
      </div>

      {/* Bouton Installer */}
      <button
        onClick={handleInstall}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "7px",
          background: "#0d6b3c",
          color: "#ffffff",
          border: "none",
          borderRadius: "0",
          padding: "10px 18px",
          fontSize: "12px",
          fontWeight: "700",
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          cursor: "pointer",
          flexShrink: 0,
          transition: "background 0.2s",
          whiteSpace: "nowrap",
        }}
        onMouseEnter={e => e.currentTarget.style.background = "#0b5b32"}
        onMouseLeave={e => e.currentTarget.style.background = "#0d6b3c"}
      >
        <Download width={14} height={14} />
        Installer
      </button>

      {/* Bouton Fermer */}
      <button
        onClick={handleDismiss}
        aria-label="Fermer"
        style={{
          background: "none",
          border: "none",
          cursor: "pointer",
          color: "#9e958e",
          padding: "4px",
          display: "grid",
          placeItems: "center",
          flexShrink: 0,
          transition: "color 0.2s",
        }}
        onMouseEnter={e => e.currentTarget.style.color = "#1a1412"}
        onMouseLeave={e => e.currentTarget.style.color = "#9e958e"}
      >
        <X width={16} height={16} />
      </button>
    </div>
  );
}
