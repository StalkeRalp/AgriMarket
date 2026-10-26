"use client";

import Link from "next/link";
import { ArrowRight, Check, Quote, Star } from "lucide-react";
import { useMemo, useState } from "react";
import { useStore } from "@/lib/store";

export default function ReviewsPage() {
  const { reviews, products } = useStore();
  const [filter, setFilter] = useState("Tous");
  const rows = reviews.filter(review => review.approved);
  const average = rows.length ? (rows.reduce((sum, review) => sum + review.rating, 0) / rows.length).toFixed(1) : "0.0";
  const filtered = useMemo(() => filter === "Tous" ? rows : rows.filter(review => String(review.rating) === filter), [filter, rows]);
  const distribution = [5, 4, 3, 2, 1].map(rating => ({ rating, count: rows.filter(review => review.rating === rating).length }));

  return <main className="reviews-page">
    <section className="reviews-hero"><div className="container reviews-hero__inner"><div><p className="eyebrow">La parole à notre communauté</p><h1>Vos expériences<br /><em>agricoles.</em></h1><p>Des témoignages de producteurs, éleveurs, distributeurs et acteurs de terrain qui achètent chez AgriMarket.</p></div><div className="reviews-hero__quote"><Quote /><p>« Les bons produits de terrain font la différence, et notre réseau le confirme chaque jour. »</p></div></div></section>

    <section className="container reviews-summary"><div className="reviews-summary__rating"><strong>{average}</strong><div><Stars value={Number(average)} /><p>Note moyenne</p><small>{rows.length} avis publiés</small></div></div><div className="reviews-summary__bars">{distribution.map(({ rating, count }) => <div key={rating}><span>{rating} <Star /></span><div><i style={{ width: `${rows.length ? count / rows.length * 100 : 0}%` }} /></div><b>{count}</b></div>)}</div><Link className="btn btn-dark" href="/catalogue">Découvrir la boutique <ArrowRight /></Link></section>

    <section className="reviews-list-section"><div className="container"><header className="reviews-list-head"><div><p className="eyebrow">Ils nous écrivent</p><h2>Les derniers avis</h2></div><label>Filtrer par <select value={filter} onChange={event => setFilter(event.target.value)}><option value="Tous">Tous les avis</option><option value="5">5 étoiles</option><option value="4">4 étoiles</option><option value="3">3 étoiles</option><option value="2">2 étoiles</option><option value="1">1 étoile</option></select></label></header>{filtered.length ? <div className="reviews-editorial-grid">{filtered.map((review, index) => <ReviewCard key={review.id} review={review} product={products.find(item => item.id === review.productId)} featured={index === 0} />)}</div> : <div className="reviews-empty"><Star /><h3>Aucun avis dans cette sélection</h3><button className="btn btn-light" onClick={() => setFilter("Tous")}>Voir tous les avis</button></div>}</div></section>

    <section className="reviews-cta"><div className="container"><div><p className="eyebrow">Votre tour</p><h2>Vous avez testé<br />un de nos produits ?</h2></div><div><p>Votre retour aide la communauté agricole à choisir les bons intrants, équipements et solutions de terrain.</p><Link className="btn btn-light" href="/compte">Partager mon expérience <ArrowRight /></Link></div></div></section>
  </main>;
}

function Stars({ value }) { return <span className="reviews-stars" aria-label={`${value} étoiles`}>{[1, 2, 3, 4, 5].map(star => <Star key={star} className={star <= Math.round(value) ? "filled" : ""} />)}</span>; }

function ReviewCard({ review, product, featured }) { return <article className={`review-editorial-card ${featured ? "is-featured" : ""}`}><header><Stars value={review.rating} /><span className="review-verified"><Check /> Achat vérifié</span></header><Quote className="review-card-quote" /><h3>{review.title}</h3><p>{review.comment}</p><footer><div className="review-avatar">{review.name?.slice(0, 1).toUpperCase()}</div><div><strong>{review.name}</strong><small>{product?.name || "Produit AgriMarket"}</small></div></footer></article>; }
