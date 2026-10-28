"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { AccountShell } from "@/composants/AccountShell";
import { useStore } from "@/lib/store";
import { dateFr, money } from "@/lib/format";
import { ArrowRight, CheckCircle2, Clock3, PackageCheck, Truck } from "lucide-react";

const completedCodes = ["delivered", "completed"];
const progressCodes = ["confirmed", "accepted", "preparing", "ready", "shipped", "shipping", "in_transit"];

export default function DeliveryHistoryPage() {
  const { user, orders, products } = useStore();
  const [filter, setFilter] = useState("all");
  const ownProductIds = useMemo(()=>new Set(products.filter(product=>product.sellerId===user?.id).map(product=>product.id)),[products,user?.id]);
  const myOrders = useMemo(()=>orders.filter(order=>{
    const email = (order.customer?.email || order.email || "").toLowerCase();
    const isBuyerOrder = Boolean(email && email === (user?.email || "").toLowerCase());
    const isSellerOrder = (order.items||[]).some(item=>ownProductIds.has(item.productId||item.id));
    return isBuyerOrder || isSellerOrder;
  }).filter(order=>order.deliveryMode || order.shipping !== undefined).sort((a,b)=>new Date(b.createdAt||0)-new Date(a.createdAt||0)),[orders,user?.email,ownProductIds]);
  const getState = order => {
    const code = String(order.statusCode || "").toLowerCase();
    if (completedCodes.includes(code) || /livr[ée]e/i.test(order.status || "")) return "completed";
    if (progressCodes.includes(code) || /préparation|expédi|livraison|confirmée/i.test(order.status || "")) return "progress";
    return "other";
  };
  const filtered = myOrders.filter(order=>filter==="all" || getState(order)===filter);
  const completedCount = myOrders.filter(order=>getState(order)==="completed").length;
  const progressCount = myOrders.filter(order=>getState(order)==="progress").length;

  return <AccountShell authRequired={false} title="Historique des livraisons" description="Retrouvez vos livraisons et retraits, leur statut et la progression communiquée par les boutiques.">
    {!user ? <div className="mypage-card mypage-empty"><PackageCheck size={30}/><h2>Connectez-vous pour consulter vos livraisons</h2><p>L’historique des commandes et des livraisons est associé à votre compte.</p><Link className="mypage-primary" href="/connexion">Se connecter <ArrowRight size={16}/></Link></div> : <>
    <div className="delivery-history-summary"><article><span><PackageCheck size={18}/> Livraisons suivies</span><strong>{myOrders.length}</strong></article><article><span><CheckCircle2 size={18}/> Terminées</span><strong>{completedCount}</strong></article><article><span><Clock3 size={18}/> En cours</span><strong>{progressCount}</strong></article></div>
    <div className="delivery-history-filters" role="group" aria-label="Filtrer l’historique des livraisons">{[{id:"all",label:`Toutes (${myOrders.length})`},{id:"progress",label:`En cours (${progressCount})`},{id:"completed",label:`Terminées (${completedCount})`}].map(item=><button key={item.id} type="button" className={filter===item.id?"is-active":""} onClick={()=>setFilter(item.id)}>{item.label}</button>)}</div>
    {filtered.length ? <div className="delivery-history-list">{filtered.map(order=>{
      const state=getState(order);
      const lastUpdate=[...(order.timeline||[])].sort((a,b)=>new Date(b.date||0)-new Date(a.date||0))[0];
      const isPickup=order.deliveryMode==="RETRAIT_RELAIS";
      return <article className="mypage-card delivery-history-card" key={order.id}>
        <div className="delivery-history-card-head"><div><span className="mypage-kicker">COMMANDE · {order.createdAt?dateFr(order.createdAt):"Date inconnue"}</span><h2>{order.id}</h2></div><span className={`delivery-history-status ${state}`}>{order.status || "Enregistrée"}</span></div>
        <div className="delivery-history-card-info"><span><Truck size={16}/>{isPickup?"Retrait":"Livraison"} · {[order.city,order.region].filter(Boolean).join(", ") || "Destination à confirmer"}</span><span><PackageCheck size={16}/>{(order.items||[]).length} article(s)</span><strong>{money(order.total || 0)}</strong></div>
        {lastUpdate && <p className="delivery-history-last-update"><strong>Dernière mise à jour :</strong> {lastUpdate.step || lastUpdate.description} · {lastUpdate.date?dateFr(lastUpdate.date):""}</p>}
        <div className="delivery-history-actions"><Link href={`/suivi-commande?code=${encodeURIComponent(order.id)}`}><Truck size={15}/> Suivre la livraison</Link><Link href={`/commandes/${encodeURIComponent(order.id)}`}>Détails <ArrowRight size={15}/></Link></div>
      </article>;
    })}</div> : <div className="mypage-card mypage-empty"><PackageCheck size={30}/><h2>{myOrders.length?"Aucune livraison dans ce filtre":"Aucune livraison enregistrée"}</h2><p>Les commandes avec livraison ou retrait apparaîtront ici après leur confirmation.</p><Link className="mypage-primary" href="/catalogue">Découvrir le catalogue <ArrowRight size={16}/></Link></div>}
    </>}
  </AccountShell>;
}
