"use client";
import Link from "next/link";
import { Heart, MapPin, Package } from "lucide-react";
import { AccountShell } from "@/composants/AccountShell";
import { useStore } from "@/lib/store";
import { useRequireAuth } from "@/composants/RequireAuth";

export default function Page() {
  const { user: authUser } = useRequireAuth();
  const { user, orders, wishlist, addresses } = useStore();
  return (
    <AccountShell title={`Bonjour${user?.name ? `, ${user.name.split(" ")[0]}` : ""}`}>
      <div className="cards">
        <Link className="stat-card" href="/commandes"><Package /><strong>{orders.length}</strong><span>Commandes</span></Link>
        <Link className="stat-card" href="/favoris"><Heart /><strong>{wishlist.length}</strong><span>Favoris</span></Link>
        <Link className="stat-card" href="/adresses"><MapPin /><strong>{addresses.length}</strong><span>Adresses</span></Link>
      </div>
      <div className="content-card next-profile-card">
        <h2>Mes informations</h2>
        <p><span>Nom</span><strong>{user?.name || user?.firstName}</strong></p>
        <p><span>E-mail</span><strong>{user?.email}</strong></p>
        <p><span>Téléphone</span><strong>{user?.phone}</strong></p>
      </div>
    </AccountShell>
  );
}
