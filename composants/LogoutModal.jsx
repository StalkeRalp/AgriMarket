"use client";

import React from "react";
import { LogOut } from "lucide-react";
import { useStore } from "@/lib/store";
import { useRouter } from "next/navigation";

export function LogoutModal({ isOpen, onClose }) {
  const { logout } = useStore();
  const router = useRouter();

  if (!isOpen) return null;

  const handleConfirm = () => {
    logout();
    onClose();
    router.push("/");
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(24, 18, 26, 0.65)",
        backdropFilter: "blur(5px)",
        zIndex: 99999,
        display: "grid",
        placeItems: "center",
        padding: "20px"
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "#ffffff",
          border: "1px solid #e3dcd5",
          maxWidth: "460px",
          width: "100%",
          padding: "36px 32px",
          textAlign: "center",
          boxShadow: "0 20px 60px rgba(0, 0, 0, 0.25)",
          position: "relative"
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            width: "56px",
            height: "56px",
            borderRadius: "50%",
            background: "#fdf2f2",
            color: "#eb4d4b",
            display: "grid",
            placeItems: "center",
            margin: "0 auto 20px auto",
            border: "1px solid #f9d6d6"
          }}
        >
          <LogOut width={24} height={24} />
        </div>

        <span
          style={{
            display: "block",
            fontSize: "11px",
            letterSpacing: "0.14em",
            color: "#0d6b3c",
            fontWeight: "700",
            textTransform: "uppercase",
            marginBottom: "6px"
          }}
        >
          AGRIMARKET
        </span>

        <h3
          style={{
            fontFamily: "var(--font-display), Georgia, serif",
            fontSize: "24px",
            margin: "0 0 12px 0",
            color: "#1a1412",
            fontWeight: "500"
          }}
        >
          Confirmation de Déconnexion
        </h3>

        <p
          style={{
            fontSize: "14px",
            color: "#6a625a",
            margin: "0 0 28px 0",
            lineHeight: "1.6"
          }}
        >
          En vous déconnectant, votre panier, vos favoris, vos commandes locales, vos adresses et votre historique de navigation seront effacés de cet appareil. Votre compte et vos produits resteront disponibles.
        </p>

        <div style={{ display: "flex", alignItems: "center", gap: "14px", justifyContent: "center" }}>
          <button
            type="button"
            className="dior-btn-outline"
            onClick={onClose}
            style={{ height: "46px", flex: 1, padding: 0 }}
          >
            ANNULER
          </button>
          <button
            type="button"
            className="dior-btn-primary"
            onClick={handleConfirm}
            style={{ height: "46px", flex: 1, background: "#eb4d4b", borderColor: "#eb4d4b", color: "#ffffff", padding: 0 }}
          >
            OUI, EFFACER ET QUITTER
          </button>
        </div>
      </div>
    </div>
  );
}
