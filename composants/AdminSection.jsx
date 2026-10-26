"use client";

import { useStore } from "@/lib/store";

export function AdminSection({ section }) {
  const { user } = useStore();

  if (!user || user.role !== "ADMIN") {
    return <div>Accès refusé</div>;
  }

  return (
    <div className="admin-section">
      <h2>{section}</h2>
      <p>Contenu du formulaire pour {section}</p>
    </div>
  );
}

export default AdminSection;
