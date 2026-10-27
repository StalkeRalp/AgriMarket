"use client";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, Heart, MapPin, Package, PackageCheck, Plus, Store, WalletCards } from "lucide-react";
import { AccountShell } from "@/composants/AccountShell";
import { useStore } from "@/lib/store";
import { dateFr, money } from "@/lib/format";

export default function Page() {
  const { user, orders, wishlist, addresses, products } = useStore();
  const seller = Boolean(user?.isSeller || user?.sellerProfile || user?.roles?.includes("SELLER") || user?.role === "SELLER");
  const myProducts = products.filter(product => product.sellerId === user?.id);
  const mySales = orders.filter(order => (order.items || []).some(item => myProducts.some(product => product.id === (item.productId || item.id))));
  const myPurchases = orders.filter(order => (order.customer?.email || order.email || "").toLowerCase() === (user?.email || "").toLowerCase());
  const recentOrders = [...myPurchases].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)).slice(0, 3);
  return (
    <AccountShell authRequired={false} title={user ? `Bonjour${user?.name ? `, ${user.name.split(" ")[0]}` : ""}` : "Mon espace personnel"}>
      {!user ? <section className="mypage-card mypage-guest"><Store size={32}/><span className="mypage-kicker">AGRIMARKET · MON ESPACE</span><h2>Votre activité, réunie au même endroit</h2><p>Consultez les rubriques de votre espace personnel. La connexion permet de retrouver vos données et d’effectuer des actions qui vous sont propres.</p><div className="mypage-guest-links"><Link href="/achats">Mes achats</Link><Link href="/boutique">Ma boutique</Link><Link href="/produits">Mes produits</Link><Link href="/ventes">Mes ventes</Link><Link href="/finances">Mes finances</Link><Link href="/profil">Mon profil</Link></div><Link className="mypage-primary" href="/connexion"><ArrowRight size={16}/> Se connecter</Link></section> : <>
      <div className="account-dashboard-metrics">
        <Link className="account-dashboard-metric" href="/achats"><span className="account-dashboard-metric-icon"><PackageCheck/></span><span className="account-dashboard-metric-label">Commandes passées</span><strong>{myPurchases.length}</strong><small>Voir mes achats <ArrowUpRight/></small></Link>
        <Link className="account-dashboard-metric" href="/favoris"><span className="account-dashboard-metric-icon is-orange"><Heart/></span><span className="account-dashboard-metric-label">Articles favoris</span><strong>{wishlist.length}</strong><small>Retrouver ma sélection <ArrowUpRight/></small></Link>
        <Link className="account-dashboard-metric" href="/adresses"><span className="account-dashboard-metric-icon is-lime"><MapPin/></span><span className="account-dashboard-metric-label">Adresses enregistrées</span><strong>{addresses.length}</strong><small>Gérer mes adresses <ArrowUpRight/></small></Link>
        {seller && <Link className="account-dashboard-metric" href="/produits"><span className="account-dashboard-metric-icon"><Store/></span><span className="account-dashboard-metric-label">Offres publiées</span><strong>{myProducts.length}</strong><small>Gérer mes produits <ArrowUpRight/></small></Link>}
        {seller && <Link className="account-dashboard-metric" href="/ventes"><span className="account-dashboard-metric-icon is-orange"><WalletCards/></span><span className="account-dashboard-metric-label">Commandes à traiter</span><strong>{mySales.filter(order => !["completed", "delivered", "cancelled", "refused"].includes(order.statusCode)).length}</strong><small>Suivre mes ventes <ArrowUpRight/></small></Link>}
      </div>
      <div className="account-dashboard-grid">
        <section className="account-dashboard-panel account-dashboard-orders">
          <div className="account-dashboard-section-head"><div><span className="mypage-kicker">VOTRE ACTIVITÉ</span><h2>Commandes récentes</h2></div><Link href="/achats">Toutes mes commandes <ArrowRight/></Link></div>
          {recentOrders.length ? <div className="account-dashboard-order-list">{recentOrders.map(order=><article key={order.id}><span className="account-dashboard-order-icon"><Package/></span><div><strong>Commande {order.id}</strong><small>{order.createdAt ? dateFr(order.createdAt) : "Date non renseignée"} · {(order.items || []).length} article(s)</small></div><strong className="account-dashboard-order-total">{money(order.total || order.subtotal || 0)}</strong><span className={`account-dashboard-order-status ${String(order.status || "").toLowerCase().includes("livr") ? "is-done" : ""}`}>{order.status || "Enregistrée"}</span></article>)}</div> : <div className="account-dashboard-empty"><PackageCheck/><div><strong>Votre historique est prêt à se remplir</strong><p>Vos achats et leur suivi apparaîtront ici dès votre première commande.</p></div><Link href="/catalogue">Explorer le catalogue <ArrowRight/></Link></div>}
        </section>
        <section className="account-dashboard-panel account-dashboard-profile">
          <div className="account-dashboard-section-head"><div><span className="mypage-kicker">VOTRE COMPTE</span><h2>Informations personnelles</h2></div><Link href="/profil" aria-label="Modifier mon profil"><ArrowUpRight/></Link></div>
          <div className="account-dashboard-profile-fields"><p><span>Nom complet</span><strong>{user?.name || user?.firstName || "À compléter"}</strong></p><p><span>Adresse e-mail</span><strong>{user?.email || "À compléter"}</strong></p><p><span>Téléphone</span><strong>{user?.phone || "À compléter"}</strong></p></div>
          <Link className="account-dashboard-profile-link" href="/profil">Gérer mon profil <ArrowRight/></Link>
        </section>
      </div>
      <section className="account-dashboard-promo"><div><span className="mypage-kicker">{seller ? "ESPACE VENDEUR" : "AGRIMARKET · ESPACE PRO"}</span><h2>{seller ? (user.sellerProfile?.shopName || "Votre boutique AgriMarket") : "Développez votre activité sur AgriMarket"}</h2><p>{seller ? (user.sellerStatus === "pending" ? "Votre demande de boutique attend une validation." : "Gérez votre boutique, vos offres et vos commandes depuis un seul espace.") : "Présentez votre activité et vos produits aux acheteurs de la plateforme."}</p></div><div className="account-dashboard-promo-actions">{seller && <Link className="account-dashboard-secondary-action" href="/boutique">Gérer ma boutique <ArrowRight/></Link>}<Link className="account-dashboard-primary-action" href={seller ? "/produits" : "/boutique"}>{seller ? <><Plus/> Ajouter un produit</> : <><Store/> Créer ma boutique</>}</Link></div></section>
      </>}
    </AccountShell>
  );
}
