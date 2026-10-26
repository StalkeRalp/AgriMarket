"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@/lib/store";

/**
 * Hook — Redirige vers /connexion si l'utilisateur n'est pas connecté.
 * Utilisation : appeler useRequireAuth() en haut d'une page protégée.
 * Retourne { user, hydrated } pour conditionner l'affichage.
 */
export function useRequireAuth(redirectTo = "/connexion") {
  const { user, hydrated } = useStore();
  const router = useRouter();

  useEffect(() => {
    if (hydrated && !user) {
      router.replace(redirectTo);
    }
  }, [hydrated, user, router, redirectTo]);

  return { user, hydrated };
}

/**
 * Composant wrapper — Protège son contenu enfant.
 * Affiche un loader pendant l'hydratation, puis redirige si non connecté.
 *
 * Usage :
 *   <RequireAuth>
 *     <MonContenuProtégé />
 *   </RequireAuth>
 */
export function RequireAuth({ children, redirectTo = "/connexion" }) {
  const { user, hydrated } = useRequireAuth(redirectTo);

  // Pendant l'hydratation côté client, ne rien afficher
  if (!hydrated) {
    return (
      <div className="require-auth-loader">
        <div className="auth-loader-spinner" />
      </div>
    );
  }

  // Redirigé par le hook — ne pas afficher le contenu protégé
  if (!user) return null;

  return <>{children}</>;
}
