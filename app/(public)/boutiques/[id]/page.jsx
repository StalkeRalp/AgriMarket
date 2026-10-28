"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { ArrowDown, ArrowLeft, ArrowRight, Check, Copy, Mail, MapPin, MessageCircle, Package, Phone, Sparkles, Store, X } from "lucide-react";
import { useStore } from "@/lib/store";
import { getPublicShops } from "@/lib/shops";
import { ProductCard } from "@/composants/ProductCard";
import ScrollRevealEffects from "@/composants/ScrollRevealEffects";

const SHOP_PRODUCTS_PER_PAGE = 12;

export default function ShopfrontPage() {
  const { id } = useParams();
  const { users, products } = useStore();
  const [showContact, setShowContact] = useState(false);
  const [copiedPhone, setCopiedPhone] = useState(false);
  const [productPage, setProductPage] = useState(1);
  const shop = getPublicShops(users, products).find(item=>item.id===id || item.slug===id);
  const totalProductPages = Math.max(1,Math.ceil((shop?.products.length || 0)/SHOP_PRODUCTS_PER_PAGE));
  const pageProducts = shop?.products.slice((productPage-1)*SHOP_PRODUCTS_PER_PAGE,productPage*SHOP_PRODUCTS_PER_PAGE) || [];

  useEffect(()=>setProductPage(1),[id]);
  useEffect(()=>{if(productPage>totalProductPages)setProductPage(totalProductPages);},[productPage,totalProductPages]);

  useEffect(()=>{
    if(!showContact)return undefined;
    const closeOnEscape=event=>{if(event.key==="Escape")setShowContact(false);};
    window.addEventListener("keydown",closeOnEscape);
    return ()=>window.removeEventListener("keydown",closeOnEscape);
  },[showContact]);

  if (!shop) return <main className="shopfront-page shopfront-page--immersive"><div className="shop-directory-empty"><Store size={30}/><h1>Boutique introuvable</h1><p>Cette boutique n’existe pas ou n’est plus disponible.</p><Link href="/boutiques"><ArrowLeft size={16}/> Voir toutes les boutiques</Link></div></main>;

  const location=[shop.city,shop.region].filter(Boolean).join(" · ") || "Cameroun";
  const phoneDigits=shop.phone ? shop.phone.replace(/\D/g,"") : "";
  const whatsappNumber=phoneDigits.startsWith("00") ? phoneDigits.slice(2) : phoneDigits.startsWith("237") ? phoneDigits : phoneDigits.length===9 ? `237${phoneDigits}` : phoneDigits;
  const whatsappHref=whatsappNumber.length>=9 && whatsappNumber.length<=15 ? `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(`Bonjour ${shop.name}, je vous contacte depuis AgriMarket.`)}` : "";
  const gmailHref=shop.email ? `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(shop.email)}&su=${encodeURIComponent(`Contact ${shop.name} via AgriMarket`)}&body=${encodeURIComponent(`Bonjour ${shop.name},\n\nJe vous contacte depuis AgriMarket au sujet de votre boutique.`)}` : "";
  const bannerPhoto=shop.bannerPhoto || "";

  const copyPhone=async()=>{
    if(!shop.phone || !navigator.clipboard?.writeText)return;
    try { await navigator.clipboard.writeText(shop.phone); setCopiedPhone(true); window.setTimeout(()=>setCopiedPhone(false),1800); }
    catch { setCopiedPhone(false); }
  };
  const firstVisiblePage=Math.max(1,productPage-2);
  const lastVisiblePage=Math.min(totalProductPages,productPage+2);
  const visiblePageNumbers=Array.from({length:lastVisiblePage-firstVisiblePage+1},(_,index)=>firstVisiblePage+index);

  return <ScrollRevealEffects className="shopfront-motion" revealSelector="[data-shop-detail-reveal]" parallaxSelector="[data-shopfront-parallax]">
    <main className="shopfront-page shopfront-page--immersive">
      <div className="shopfront-depth-scene" aria-hidden="true">
        <figure className="shopfront-depth-image shopfront-depth-image--one" data-shop-detail-reveal data-shopfront-parallax data-scroll-speed="0.1"><img src="/Images%20Agrimarket/pexels-the-northern-lense-2148554063-31120512.jpg" alt=""/></figure>
        <figure className="shopfront-depth-image shopfront-depth-image--two" data-shop-detail-reveal data-shopfront-parallax data-scroll-speed="-0.14"><img src="/Images%20Agrimarket/pexels-arnaud-vigne-36746332-7164535.jpg" alt=""/></figure>
        <figure className="shopfront-depth-image shopfront-depth-image--three" data-shop-detail-reveal data-shopfront-parallax data-scroll-speed="0.08"><img src="/Images%20Agrimarket/pexels-fera-263453090-36991618.jpg" alt=""/></figure>
      </div>
      <div className="shopfront-content-shell">
        <nav className="shopfront-breadcrumb" aria-label="Fil d’Ariane" data-shop-detail-reveal><Link href="/boutiques"><ArrowLeft size={15}/> Toutes les boutiques</Link><span>/</span><span>{shop.name}</span></nav>
        <header className={`shopfront-hero${bannerPhoto?" has-photo":" is-default"}`} data-shop-detail-reveal>
          {bannerPhoto && <img className="shopfront-hero-photo" src={bannerPhoto} alt="" aria-hidden="true" onError={event=>{event.currentTarget.hidden=true;}}/>}
          <div className="shopfront-hero-glow" aria-hidden="true"/>
          <div className="shopfront-identity">
            <span className="shopfront-photo shopfront-photo--hero">{shop.photo ? <img src={shop.photo} alt={`Photo de profil de ${shop.name}`}/> : <span>{shop.name.slice(0,1).toUpperCase()}</span>}</span>
            <div className="shopfront-copy shopfront-copy--hero"><span className="shopfront-kicker"><Store size={15}/> BOUTIQUE AGRIMARKET</span><h1>{shop.name}</h1><p>{shop.description}</p><span className="shopfront-location"><MapPin size={16}/>{location}</span></div>
          </div>
          <div className="shopfront-hero-actions"><a className="shopfront-primary-action" href="#produits">Explorer les produits <ArrowDown size={16}/></a><button className="shopfront-secondary-action" type="button" onClick={()=>{setCopiedPhone(false);setShowContact(true);}}><Phone size={16}/> Contacter la boutique</button></div>
          <div className="shopfront-trust-note"><Sparkles size={15}/> Achetez directement auprès d’un vendeur local</div>
        </header>
        <section className="shopfront-overview" aria-label="Informations de la boutique" data-shop-detail-reveal>
          <div className="shopfront-overview-intro"><span className="shop-directory-eyebrow">RENCONTREZ LE PRODUCTEUR</span><h2>Une boutique, un savoir-faire.</h2><p>Découvrez les produits proposés par {shop.name} et commandez en toute simplicité sur AgriMarket.</p></div>
          <div className="shopfront-stat-card"><span className="shopfront-stat-icon"><Package size={19}/></span><span className="shopfront-stat-copy"><strong>{shop.products.length.toString().padStart(2,"0")}</strong><small>offres disponibles</small></span><span className="shopfront-stat-arrow"><ArrowRight size={17}/></span></div>
          <div className="shopfront-stat-card"><span className="shopfront-stat-icon"><MapPin size={19}/></span><span className="shopfront-stat-copy"><strong className="shopfront-stat-location">{shop.city || "Cameroun"}</strong><small>{shop.region || "Producteur local"}</small></span><span className="shopfront-stat-arrow"><ArrowRight size={17}/></span></div>
        </section>
        <section className="shopfront-products shopfront-products--immersive" id="produits" aria-label={`Produits de ${shop.name}`}>
          <div className="shopfront-section-title" data-shop-detail-reveal><div><span className="shop-directory-eyebrow">SÉLECTION DE LA BOUTIQUE</span><h2>Les produits de {shop.name}</h2><p>Des offres locales à découvrir et à commander.</p></div><span className="shopfront-product-total"><Package size={16}/>{shop.products.length} produit(s)</span></div>
          {shop.products.length ? <><div className="product-grid collection-product-grid grid-4cols shopfront-product-grid">{pageProducts.map((product,index)=><ProductCard key={product.id} product={product} className="shopfront-product-reveal" reveal style={{"--shop-reveal-delay":`${Math.min(index%4,3)*70}ms`}}/>)}</div>{totalProductPages>1 && <nav className="shopfront-pagination" aria-label="Pages de produits"><button type="button" onClick={()=>setProductPage(page=>Math.max(1,page-1))} disabled={productPage===1}><ArrowLeft size={15}/> Précédent</button><div className="shopfront-pagination-pages">{firstVisiblePage>1 && <><button type="button" onClick={()=>setProductPage(1)} aria-label="Page 1">1</button>{firstVisiblePage>2 && <span aria-hidden="true">…</span>}</>}{visiblePageNumbers.map(page=><button type="button" key={page} onClick={()=>setProductPage(page)} aria-label={`Page ${page}`} aria-current={productPage===page?"page":undefined} className={productPage===page?"is-current":""}>{page}</button>)}{lastVisiblePage<totalProductPages && <>{lastVisiblePage<totalProductPages-1 && <span aria-hidden="true">…</span>}<button type="button" onClick={()=>setProductPage(totalProductPages)} aria-label={`Page ${totalProductPages}`}>{totalProductPages}</button></>}</div><button type="button" onClick={()=>setProductPage(page=>Math.min(totalProductPages,page+1))} disabled={productPage===totalProductPages}>Suivant <ArrowRight size={15}/></button></nav>}</> : <div className="shop-directory-empty shopfront-empty"><Package size={28}/><h2>La boutique prépare ses premières offres</h2><p>Revenez bientôt pour découvrir les produits proposés par {shop.name}.</p><Link href="/catalogue">Parcourir le catalogue <ArrowRight size={16}/></Link></div>}
        </section>
        <footer className="shopfront-bottom-cta" data-shop-detail-reveal><div><span className="shop-directory-eyebrow">CONTINUEZ VOTRE DÉCOUVERTE</span><h2>À la recherche d’autres producteurs ?</h2></div><Link href="/boutiques">Voir toutes les boutiques <ArrowRight size={17}/></Link></footer>
      </div>
    </main>
    {showContact && <div className="shop-contact-overlay" onMouseDown={event=>{if(event.target===event.currentTarget)setShowContact(false);}}><section className="shop-contact-dialog" role="dialog" aria-modal="true" aria-labelledby="shop-contact-title"><div className="shop-contact-dialog-head">{shop.photo && <img className="shop-contact-profile-photo" src={shop.photo} alt="" aria-hidden="true" onError={event=>{event.currentTarget.hidden=true;}}/>}<button type="button" className="shop-contact-close" onClick={()=>setShowContact(false)} aria-label="Fermer"><X size={19}/></button><span className="shopfront-kicker">CONTACT DIRECT</span><h2 id="shop-contact-title">{shop.name}</h2><p><MapPin size={15}/>{location}</p></div><div className="shop-contact-dialog-body">{shop.phone && <><span className="shop-contact-label">TÉLÉPHONE PROFESSIONNEL</span><strong className="shop-contact-number"><Phone size={17}/>{shop.phone}</strong></>}{(whatsappHref||gmailHref||shop.phone) && <div className={`shop-contact-actions${whatsappHref&&gmailHref?" has-dual-contact":""}`}>{whatsappHref && <a className="shop-contact-action shop-contact-action--whatsapp" href={whatsappHref} target="_blank" rel="noopener noreferrer"><MessageCircle size={17}/> WhatsApp</a>}{gmailHref && <a className="shop-contact-action shop-contact-action--email" href={gmailHref} target="_blank" rel="noopener noreferrer"><Mail size={17}/> Envoyer un mail</a>}{shop.phone && <button type="button" className="shop-contact-copy" onClick={copyPhone}>{copiedPhone?<Check size={16}/>:<Copy size={16}/>} {copiedPhone?"Copié":"Copier le numéro"}</button>}</div>}{shop.email && <div className="shop-contact-email-block"><span className="shop-contact-label">ADRESSE E-MAIL</span><span className="shop-contact-email"><Mail size={17}/>{shop.email}</span></div>}{!shop.phone&&!shop.email && <p className="shop-contact-unavailable">Cette boutique n’a pas encore renseigné de coordonnées.</p>}<small>En contactant cette boutique, vous échangez directement avec son vendeur.</small></div></section></div>}
  </ScrollRevealEffects>;
}
