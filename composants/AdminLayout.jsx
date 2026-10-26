"use client";

import { useStore } from "@/lib/store";

export function AdminLayout({ children }) {
  const { user } = useStore();

  if (!user || user.role !== "ADMIN") {
    return <div>Accès refusé</div>;
  }

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <h2>Admin</h2>
        <nav>
          <a href="/admin">Dashboard</a>
          <a href="/admin/produits">Produits</a>
          <a href="/admin/categories">Catégories</a>
          <a href="/admin/clients">Clients</a>
          <a href="/admin/commandes">Commandes</a>
        </nav>
      </aside>
      <main className="admin-content">{children}</main>
    </div>
  );
}

export default AdminLayout;
