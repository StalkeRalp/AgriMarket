"use client";

import Link from "next/link";
import { useEffect } from "react";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";

export default function AppError({ error, reset }) {
  useEffect(() => {
    // Keep technical details in the console for developers, never in the customer-facing message.
    console.error("Erreur de page AgriMarket", error);
  }, [error]);

  return (
    <main className="agri-friendly-error" role="alert">
      <div className="agri-friendly-error-card">
        <span className="agri-friendly-error-icon"><AlertTriangle size={25} /></span>
        <p className="agri-friendly-error-eyebrow">Un petit contretemps</p>
        <h1>Cette page n’a pas pu s’afficher.</h1>
        <p>Vos informations sont conservées. Réessayez dans un instant ou retournez à l’accueil.</p>
        <div className="agri-friendly-error-actions">
          <button type="button" onClick={() => reset()}><RefreshCw size={16} /> Réessayer</button>
          <Link href="/"><Home size={16} /> Accueil</Link>
        </div>
      </div>
    </main>
  );
}
