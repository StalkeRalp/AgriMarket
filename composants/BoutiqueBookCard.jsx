"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowUpRight, MapPin, Package, Store } from "lucide-react";

export default function BoutiqueBookCard({ shop, index = 0 }) {
  const router = useRouter();
  const navigationTimer = useRef(null);
  const [opening, setOpening] = useState(false);
  const [failedImages, setFailedImages] = useState(() => new Set());
  const images = useMemo(()=>[shop.photo].filter(src=>typeof src==="string" && src),[shop.photo]);
  const image = images.find(src=>!failedImages.has(src)) || "";
  const markImageFailed = src => setFailedImages(current=>new Set(current).add(src));
  const href = `/boutiques/${encodeURIComponent(shop.id)}`;

  useEffect(()=>()=>window.clearTimeout(navigationTimer.current),[]);

  const openShop = event => {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    if (opening) return;
    setOpening(true);
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      router.push(href);
      return;
    }
    navigationTimer.current = window.setTimeout(()=>router.push(href),480);
  };

  return <a className={`shop-book${opening?" is-opening":""}`} href={href} onClick={openShop} aria-label={`Ouvrir la boutique ${shop.name}`} style={{"--book-index":index}}>
    <span className="shop-book-pages" aria-hidden="true"><span/><span/><span/></span>
    <span className="shop-book-inside">
      <span className="shop-book-interior-photo">{image ? <img src={image} alt="" onError={()=>markImageFailed(image)}/> : <span>{shop.name.slice(0,1).toUpperCase()}</span>}</span>
      <span className="shop-book-interior-copy"><span className="shop-book-label">À L’INTÉRIEUR</span><strong>{shop.name}</strong><span className="shop-book-interior-description">{shop.description || "Une boutique locale à découvrir."}</span><span className="shop-book-meta"><MapPin size={14}/>{[shop.city,shop.region].filter(Boolean).join(" · ") || "Cameroun"}</span><span className="shop-book-meta"><Package size={14}/>{shop.products.length} produit(s) disponible(s)</span><span className="shop-book-cta">Découvrir cette boutique <ArrowUpRight size={15}/></span></span>
    </span>
    <span className="shop-book-cover">
      <span className="shop-book-cover-face">
        <span className="shop-book-cover-photo">{image ? <img src={image} alt="" onError={()=>markImageFailed(image)}/> : <span className="shop-book-initial">{shop.name.slice(0,1).toUpperCase()}</span>}</span>
        <span className="shop-book-cover-shade"/>
        <span className="shop-book-spine-mark"><Store size={14}/> AGRIMARKET · BOUTIQUE</span>
        <span className="shop-book-cover-copy"><span>PRODUCTEURS & VENDEURS</span><strong>{shop.name}</strong><small>{[shop.city,shop.region].filter(Boolean).join(" · ") || "Cameroun"}</small></span>
        <span className="shop-book-cover-count">{shop.products.length} OFFRE(S)</span>
      </span>
      <span className="shop-book-cover-back"><span className="shop-book-back-emblem"><Store size={23}/></span><strong>{shop.name}</strong><small>Du champ à votre table</small></span>
    </span>
    <span className="shop-book-click-cue"><ArrowUpRight size={16}/></span>
  </a>;
}
