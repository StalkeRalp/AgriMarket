"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { ArrowRight, CreditCard, Search, ShieldCheck, Sprout, Truck, Warehouse } from "lucide-react";

const services = [
  { id: "sourcing", icon: Search, image: "/Images%20Agrimarket/pexels-made-by-pixels-133605980-33364793.jpg", imageAlt: "Récolte de produits agricoles", eyebrow: "ACHAT & APPROVISIONNEMENT", title: "Trouver le bon produit", description: "Parcourez les offres de producteurs, coopératives et vendeurs spécialisés. Si un produit manque au catalogue, transmettez votre besoin à notre équipe de sourcing.", links: [{ label: "Parcourir le catalogue", href: "/catalogue", primary: true }, { label: "Décrire un besoin", href: "/demande-produit" }] },
  { id: "transport", icon: Truck, image: "/Images%20Agrimarket/pexels-arnaud-vigne-36746332-7164535.jpg", imageAlt: "Activité agricole dans les champs", eyebrow: "ACHEMINEMENT", title: "Transport & logistique rurale", description: "Préparez l’acheminement de vos achats et renseignez-vous sur les possibilités de livraison selon le produit, le vendeur, la quantité et votre localité. Les modalités sont à confirmer avec l’équipe avant la commande.", links: [{ label: "Demander les modalités", href: "/contact" }, { label: "Suivre une commande", href: "/suivi-commande" }] },
  { id: "stockage", icon: Warehouse, image: "/Images%20Agrimarket/images2/Fili-West%20Farms_%20A%20Chicken%20and%20Egg%20Story%20%E2%80%94%20Compost%20and%20Cava.jpeg", imageAlt: "Élevage de volailles et production locale", eyebrow: "CONSERVATION", title: "Stockage & conservation", description: "Faites-nous part de vos besoins de stockage, de conservation ou de chaîne du froid. Nous vous orientons selon la filière et les solutions disponibles auprès de nos partenaires.", links: [{ label: "Parler à l’équipe", href: "/contact" }] },
  { id: "qualite", icon: ShieldCheck, image: "/Images%20Agrimarket/images2/FOOD%20%E2%80%94%20BOBBI%20%20LIN.jpeg", imageAlt: "Produits frais issus des filières agricoles", eyebrow: "INFORMATION & CONFIANCE", title: "Qualité des offres", description: "Consultez les informations publiées sur chaque fiche : vendeur, prix, unité de vente, disponibilité et provenance lorsqu’elles sont renseignées. Contactez-nous si une offre nécessite une précision.", links: [{ label: "Voir les offres", href: "/catalogue", primary: true }, { label: "Signaler une question", href: "/contact" }] },
  { id: "credit", icon: CreditCard, image: "/Images%20Agrimarket/pexels-the-northern-lense-2148554063-31120516.jpg", imageAlt: "Productrice au travail dans une exploitation", eyebrow: "BESOINS D’ACHAT", title: "Financement & facilités d’achat", description: "Vous préparez un achat important ou un approvisionnement groupé ? Présentez votre demande à notre équipe. Les solutions éventuelles dépendent des partenaires et restent soumises à validation.", links: [{ label: "Présenter mon besoin", href: "/contact" }] },
  { id: "vendeurs", icon: Sprout, image: "/Images%20Agrimarket/pexels-lekepov-2044219506-36877896.jpg", imageAlt: "Production agricole locale", eyebrow: "PRODUCTEURS & VENDEURS", title: "Présenter et vendre vos produits", description: "Producteurs, éleveurs, transformateurs et fournisseurs peuvent se rapprocher d’AgriMarket pour présenter leur activité et leurs offres aux acheteurs.", links: [{ label: "Proposer mes produits", href: "/demande-produit", primary: true }, { label: "Découvrir la plateforme", href: "/a-propos" }] },
];

export default function ServicesShowcase() {
  const sectionRef = useRef(null);
  const sideImages = useRef([]);
  const cardImages = useRef([]);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return undefined;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    section.querySelectorAll(".agri-services-intro, .agri-service-card").forEach((item) => revealObserver.observe(item));

    if (reduceMotion.matches) return () => revealObserver.disconnect();

    let frame = 0;
    const updateParallax = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const bounds = section.getBoundingClientRect();
        const progress = Math.max(-1, Math.min(1, (window.innerHeight - bounds.top) / (window.innerHeight + bounds.height) - 0.5));
        sideImages.current.forEach((image, index) => {
          if (image) image.style.setProperty("--parallax-y", `${progress * (index === 0 ? -115 : 138)}px`);
        });
        cardImages.current.forEach((image, index) => {
          if (!image) return;
          const card = image.closest(".agri-service-card");
          const cardBounds = card?.getBoundingClientRect();
          if (!cardBounds) return;
          const localProgress = Math.max(-1, Math.min(1, (window.innerHeight - cardBounds.top) / (window.innerHeight + cardBounds.height) - 0.5));
          image.style.setProperty("--card-parallax-y", `${localProgress * (index % 2 ? 24 : -24)}px`);
        });
      });
    };
    updateParallax();
    window.addEventListener("scroll", updateParallax, { passive: true });
    window.addEventListener("resize", updateParallax);
    return () => {
      revealObserver.disconnect();
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", updateParallax);
      window.removeEventListener("resize", updateParallax);
    };
  }, []);

  return (
    <section className="agri-services-showcase" ref={sectionRef} aria-label="Nos services">
      <div className="agri-services-showcase-backdrop" aria-hidden="true">
        <div ref={(node) => { sideImages.current[0] = node; }} className="agri-services-showcase-side agri-services-showcase-side--left"><img src="/Images%20Agrimarket/pexels-made-by-pixels-133605980-33364793.jpg" alt="" loading="lazy" /><span>La richesse de nos terroirs</span></div>
        <div ref={(node) => { sideImages.current[1] = node; }} className="agri-services-showcase-side agri-services-showcase-side--right"><img src="/Images%20Agrimarket/pexels-the-northern-lense-2148554063-31120512.jpg" alt="" loading="lazy" /><span>Des femmes et des hommes engagés</span></div>
      </div>
      <div className="agri-services-showcase-content">
        <div className="agri-services-intro"><span className="agri-services-section-kicker">UN POINT DE DÉPART POUR VOS PROJETS</span><h2>De l’offre disponible à la demande spécifique.</h2><p>AgriMarket met en relation les acteurs du secteur et facilite la découverte des offres. Certains services dépendent du vendeur, de la zone desservie et de la disponibilité des partenaires : notre équipe vous aide à clarifier les modalités avant votre engagement.</p></div>
        <div className="agri-services-grid">{services.map(({ id, icon: Icon, image, imageAlt, eyebrow, title, description, links }, index) => <article className="agri-service-card" id={id} key={id} style={{ "--service-index": index }}>
          <div className="agri-service-image"><img ref={(node) => { cardImages.current[index] = node; }} src={image} alt={imageAlt} loading="lazy" /><span className="agri-service-image-shade" /><span className="agri-service-icon"><Icon size={23} /></span><span className="agri-service-image-index">0{index + 1}</span></div><span className="agri-services-section-kicker">{eyebrow}</span><h2>{title}</h2><p>{description}</p><div className="agri-service-links">{links.map((link) => <Link className={link.primary ? "agri-service-link-primary" : "agri-service-link-secondary"} href={link.href} key={`${link.label}-${link.href}`}>{link.label}<ArrowRight size={15} /></Link>)}</div>
        </article>)}</div>
      </div>
    </section>
  );
}
