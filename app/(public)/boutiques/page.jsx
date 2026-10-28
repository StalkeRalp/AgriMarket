"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowRight, MapPin, Search, Store } from "lucide-react";
import { useStore } from "@/lib/store";
import { getPublicShops } from "@/lib/shops";
import BoutiqueBookCard from "@/composants/BoutiqueBookCard";
import ScrollRevealEffects from "@/composants/ScrollRevealEffects";

export default function BoutiquesPage() {
  const { users, products } = useStore();
  const bannerVideoRef = useRef(null);
  const shops = getPublicShops(users, products);
  const [query,setQuery] = useState("");
  const visibleShops = useMemo(()=>{
    const needle=query.trim().toLocaleLowerCase("fr");
    if(!needle)return shops;
    return shops.filter(shop=>[shop.name,shop.description,shop.city,shop.region].join(" ").toLocaleLowerCase("fr").includes(needle));
  },[shops,query]);

  useEffect(()=>{
    const video=bannerVideoRef.current;
    const motionPreference=window.matchMedia("(prefers-reduced-motion: reduce)");
    if(!video)return;
    const syncPlayback=()=>{
      if(motionPreference.matches) video.pause();
      else video.play().catch(()=>{});
    };
    syncPlayback();
    motionPreference.addEventListener?.("change",syncPlayback);
    return ()=>motionPreference.removeEventListener?.("change",syncPlayback);
  },[]);

  return <ScrollRevealEffects className="shop-directory-motion" revealSelector="[data-shop-reveal]" parallaxSelector="[data-shop-parallax]">
    <main className="shop-directory-page">
      <div className="shop-parallax-scene" aria-hidden="true"><div className="shop-parallax-image shop-parallax-image--left" data-shop-reveal data-shop-parallax data-scroll-speed="0.11"><img src="/Images%20Agrimarket/pexels-made-by-pixels-133605980-33364793.jpg" alt=""/></div><div className="shop-parallax-image shop-parallax-image--right" data-shop-reveal data-shop-parallax data-scroll-speed="-0.13"><img src="/Images%20Agrimarket/pexels-the-northern-lense-2148554063-31120516.jpg" alt=""/></div><div className="shop-parallax-image shop-parallax-image--lower-left" data-shop-reveal data-shop-parallax data-scroll-speed="0.16"><img src="/Images%20Agrimarket/pexels-arnaud-vigne-36746332-7164535.jpg" alt=""/></div><div className="shop-parallax-image shop-parallax-image--lower-right" data-shop-reveal data-shop-parallax data-scroll-speed="-0.09"><img src="/Images%20Agrimarket/pexels-the-northern-lense-2148554063-31120512.jpg" alt=""/></div></div>
      <header className="shop-directory-hero" data-shop-reveal><video ref={bannerVideoRef} className="shop-directory-hero-video" autoPlay muted loop playsInline preload="metadata" aria-hidden="true" poster="/Images%20Agrimarket/pexels-made-by-pixels-133605980-33364793.jpg"><source src="/Videos%20Agrimarket/16464906_1920_1080_50fps.mp4" type="video/mp4"/></video><div className="shop-directory-hero-orbit" aria-hidden="true"/><span className="shop-directory-eyebrow"><Store size={15}/> PRODUCTEURS & VENDEURS</span><h1>Un marché, des histoires <em>à découvrir.</em></h1><p>Rencontrez les coopératives, producteurs et commerçants du Cameroun. Ouvrez leur boutique pour découvrir leurs produits.</p><div className="shop-directory-hero-bottom"><strong><span>{shops.length.toString().padStart(2,"0")}</span> boutiques à découvrir</strong><span>Du champ à votre table, en direct des terroirs.</span></div></header>
      <section className="shop-directory-explore" aria-label="Explorer les boutiques">
        <div><span className="shop-directory-eyebrow">LE CARNET DES PRODUCTEURS</span><h2>Choisissez une boutique</h2><p>{visibleShops.length} résultat(s) · touchez ou survolez une couverture pour l’ouvrir</p></div>
        <label className="shop-directory-search"><Search size={18}/><input type="search" value={query} onChange={event=>setQuery(event.target.value)} placeholder="Nom, ville ou région…" aria-label="Rechercher une boutique"/>{query && <button type="button" onClick={()=>setQuery("")} aria-label="Effacer la recherche">×</button>}</label>
      </section>
      <section className="shop-directory-grid" aria-label="Boutiques disponibles">
        {visibleShops.map((shop,index)=><div className="shop-book-reveal" data-shop-reveal key={shop.id} style={{"--shop-reveal-delay":`${Math.min(index%6,5)*75}ms`}}><BoutiqueBookCard shop={shop} index={index}/></div>)}
        {!visibleShops.length && <div className="shop-directory-empty" data-shop-reveal><Store size={28}/><h2>{shops.length?"Aucune boutique trouvée":"Aucune boutique pour le moment"}</h2><p>{shops.length?"Essayez un autre nom de boutique, une ville ou une région.":"Les boutiques apparaîtront ici dès qu’un vendeur aura publié son profil."}</p>{query && <button type="button" onClick={()=>setQuery("")}>Effacer la recherche <ArrowRight size={15}/></button>}</div>}
      </section>
      <footer className="shop-directory-footer" data-shop-reveal><span>Vous êtes producteur ou commerçant ?</span><Link href="/boutique">Présenter ma boutique <ArrowRight size={16}/></Link></footer>
    </main>
  </ScrollRevealEffects>;
}
