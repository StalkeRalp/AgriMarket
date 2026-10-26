"use client";

import Link from "next/link";
import { AlertTriangle, ArrowUpRight, Boxes, ShoppingBag, Star, Users } from "lucide-react";
import { useStore } from "@/lib/store";
import { money } from "@/lib/format";

export default function AdminDashboard() {
  const { products, orders, users, reviews } = useStore();
  const revenue = orders.reduce((sum, order) => sum + order.total, 0);
  const low = products.filter(product => product.stock <= 5);
  const cards = [["Chiffre d’affaires", money(revenue), ShoppingBag], ["Commandes", orders.length, Boxes], ["Clients", users.filter(user => user.role === "CLIENT").length, Users], ["Avis", reviews.length, Star]];
  return <main className="admin-main"><div className="admin-heading"><div><p className="eyebrow">Aujourd’hui</p><h1>Vue d’ensemble</h1></div><p>Suivez l’activité de la boutique en un coup d’œil.</p></div><section className="admin-stats">{cards.map(([label, value, Icon]) => <article key={label}><div><span>{label}</span><strong>{value}</strong></div><Icon /></article>)}</section><div className="admin-dashboard-grid"><section className="admin-panel"><header><div><h2>Dernières commandes</h2><p>Les ventes les plus récentes.</p></div><Link href="/admin/commandes">Tout voir <ArrowUpRight /></Link></header>{orders.length ? <div className="admin-table-wrap"><table><thead><tr><th>Référence</th><th>Client</th><th>Total</th><th>Statut</th></tr></thead><tbody>{orders.slice(0, 6).map(order => <tr key={order.id}><td>{order.id}</td><td>{order.customer?.name || order.customer?.firstName || "Client"}</td><td>{money(order.total)}</td><td><span className="status-pill">{order.status}</span></td></tr>)}</tbody></table></div> : <div className="admin-empty"><ShoppingBag /><p>Aucune commande pour le moment.</p></div>}</section><section className="admin-panel"><header><div><h2>Stocks à surveiller</h2><p>Produits avec 5 unités ou moins.</p></div></header>{low.length ? <div className="admin-low-stock">{low.map(product => <Link href={`/produit/${product.id}`} key={product.id}><img src={product.image} alt="" /><span><strong>{product.name}</strong><small>{product.reference}</small></span><b className={product.stock === 0 ? "danger" : ""}>{product.stock}</b></Link>)}</div> : <div className="admin-empty"><AlertTriangle /><p>Tous les stocks sont suffisants.</p></div>}</section></div></main>;
}
