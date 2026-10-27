"use client";
import Link from "next/link";
import { ArrowRight, Heart, MapPin, Package, Store, WalletCards } from "lucide-react";
import { AccountShell } from "@/composants/AccountShell";
import { useStore } from "@/lib/store";

export default function Page() {
  const { user, orders, wishlist, addresses, products } = useStore();
  const seller = Boolean(user?.isSeller || user?.sellerProfile || user?.roles?.includes("SELLER") || user?.role === "SELLER");
  const myProducts = products.filter(product => product.sellerId === user?.id);
  const mySales = orders.filter(order => (order.items || []).some(item => myProducts.some(product => product.id === (item.productId || item.id))));
  const myPurchases = orders.filter(order => (order.customer?.email || order.email || "").toLowerCase() === (user?.email || "").toLowerCase());
  return (
    <AccountShell authRequired={false} title={user ? `Bonjour${user?.name ? `, ${user.name.split(" ")[0]}` : ""}` : "Mon espace personnel"}>
      {!user ? <section className="mypage-card mypage-guest"><Store size={32}/><span className="mypage-kicker">AGRIMARKET · MON ESPACE</span><h2>Votre activité, réunie au même endroit</h2><p>Consultez les rubriques de votre espace personnel. La connexion permet de retrouver vos données et d’effectuer des actions qui vous sont propres.</p><div className="mypage-guest-links"><Link href="/achats">Mes achats</Link><Link href="/boutique">Ma boutique</Link><Link href="/produits">Mes produits</Link><Link href="/ventes">Mes ventes</Link><Link href="/finances">Mes finances</Link><Link href="/profil">Mon profil</Link></div><Link className="mypage-primary" href="/connexion"><ArrowRight size={16}/> Se connecter</Link></section> : <>
      <div className="cards">
        <Link className="stat-card" href="/achats"><Package /><strong>{myPurchases.length}</strong><span>Mes achats</span></Link>
        <Link className="stat-card" href="/favoris"><Heart /><strong>{wishlist.length}</strong><span>Favoris</span></Link>
        <Link className="stat-card" href="/adresses"><MapPin /><strong>{addresses.length}</strong><span>Adresses</span></Link>
        {seller && <Link className="stat-card" href="/produits"><Store/><strong>{myProducts.length}</strong><span>Produits</span></Link>}
        {seller && <Link className="stat-card" href="/ventes"><WalletCards/><strong>{mySales.length}</strong><span>Ventes</span></Link>}
      </div>
      {seller && <section className="mypage-dashboard-banner"><div><span className="mypage-kicker">ESPACE VENDEUR</span><h2>{user.sellerProfile?.shopName || "Votre boutique AgriMarket"}</h2><p>{user.sellerStatus === "pending" ? "Votre demande de boutique attend une validation." : "Gérez vos offres, vos commandes et le suivi de votre activité."}</p></div><Link href="/boutique">Gérer ma boutique <ArrowRight size={16}/></Link></section>}
      {!seller && <section className="mypage-dashboard-banner"><div><span className="mypage-kicker">DÉVELOPPEZ VOTRE ACTIVITÉ</span><h2>Vous produisez ou distribuez au Cameroun ?</h2><p>Présentez votre activité et proposez vos produits aux acheteurs de la plateforme.</p></div><Link href="/boutique">Créer ma boutique <ArrowRight size={16}/></Link></section>}
      <div className="content-card next-profile-card">
        <h2>Mes informations</h2>
        <p><span>Nom</span><strong>{user?.name || user?.firstName}</strong></p>
        <p><span>E-mail</span><strong>{user?.email}</strong></p>
        <p><span>Téléphone</span><strong>{user?.phone}</strong></p>
      </div>
      </>}
    </AccountShell>
  );
}
