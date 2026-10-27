"use client";

import { useEffect, useRef } from "react";
import { Boxes, PackageCheck, Search } from "lucide-react";

const steps = [
  { number: "01", icon: Search, title: "Exprimez votre besoin", text: "Recherchez une offre ou décrivez votre demande dans le formulaire adapté." },
  { number: "02", icon: Boxes, title: "Échangez sur les détails", text: "Précisez quantités, localité, délais et modalités directement avec l’équipe ou le vendeur." },
  { number: "03", icon: PackageCheck, title: "Confirmez les conditions", text: "Avant de finaliser, vérifiez le prix, la disponibilité et les modalités convenues." },
];

export default function ServicesProcess() {
  const sectionRef = useRef(null);
  const leftImageRef = useRef(null);
  const rightImageRef = useRef(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return undefined;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const revealObserver = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        section.classList.add("is-visible");
        revealObserver.disconnect();
      }
    }, { threshold: 0.16 });
    revealObserver.observe(section);

    if (reduceMotion.matches) return () => revealObserver.disconnect();

    let frame = 0;
    const updateParallax = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const bounds = section.getBoundingClientRect();
        const travel = Math.max(-1, Math.min(1, (window.innerHeight - bounds.top) / (window.innerHeight + bounds.height) - 0.5));
        if (leftImageRef.current) leftImageRef.current.style.setProperty("--parallax-y", `${travel * -76}px`);
        if (rightImageRef.current) rightImageRef.current.style.setProperty("--parallax-y", `${travel * 92}px`);
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
    <section className="agri-services-process" ref={sectionRef}>
      <div className="agri-services-parallax-image agri-services-parallax-image--left" ref={leftImageRef} aria-hidden="true">
        <img src="/Images%20Agrimarket/pexels-made-by-pixels-133605980-33364793.jpg" alt="" loading="lazy" />
        <span>Au départ, votre besoin</span>
      </div>
      <div className="agri-services-parallax-image agri-services-parallax-image--right" ref={rightImageRef} aria-hidden="true">
        <img src="/Images%20Agrimarket/pexels-arnaud-vigne-36746332-7164535.jpg" alt="" loading="lazy" />
        <span>En lien avec les filières locales</span>
      </div>
      <div className="agri-services-process-content">
        <div className="agri-services-process-heading"><span className="agri-services-section-kicker">COMMENT ÇA SE PASSE ?</span><h2>Un parcours clair, étape par étape.</h2><p>Pour chaque service, prenez le temps de valider les informations et les conditions avec votre interlocuteur.</p></div>
        <div className="agri-services-steps">{steps.map(({ number, icon: Icon, title, text }, index) => <article className="agri-services-step" key={number} style={{ "--step-index": index }}><span className="agri-services-step-number">{number}</span><span className="agri-services-step-icon"><Icon size={21} /></span><h3>{title}</h3><p>{text}</p></article>)}</div>
      </div>
    </section>
  );
}
