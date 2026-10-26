"use client";

import { useEffect, useRef, useState } from "react";

/**
 * ScrollReveal — Composant d'animation au scroll haute performance pour ITEXAL Beauty
 * 
 * Basé sur IntersectionObserver et transform/opacity GPU-accélérés (60fps)
 * 
 * Animations disponibles :
 * - "fade-up" : Apparition fluide vers le haut (titres, conteneurs)
 * - "fade-in" : Fondu d'apparition doux
 * - "zoom-in" : Légère échelle agrandie à l'apparition
 * - "slide-right" / "slide-left" : Glissement latéral
 */
export function ScrollReveal({
  children,
  animation = "fade-up",
  delay = 0,
  duration = 750,
  threshold = 0.1,
  className = "",
  style = {},
  ...props
}) {
  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Respecter la préférence de réduction de mouvement
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(el); // Ne se déclenche qu'une seule fois
        }
      },
      { threshold, rootMargin: "0px 0px -30px 0px" }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);

  return (
    <div
      ref={ref}
      className={`scroll-reveal reveal-${animation} ${isVisible ? "is-visible" : ""} ${className}`}
      style={{
        transitionDelay: `${delay}ms`,
        transitionDuration: `${duration}ms`,
        ...style,
      }}
      {...props}
    >
      {children}
    </div>
  );
}

/**
 * ParallaxWrap — Effet Parallaxe au scroll pour bannières & visuels
 * Désactivé automatiquement sur mobile (< 768px) pour les performances.
 */
export function ParallaxWrap({ children, speed = 0.12, className = "", style = {} }) {
  const targetRef = useRef(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.innerWidth < 768 || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    let rafId;
    const handleScroll = () => {
      if (!targetRef.current) return;
      const rect = targetRef.current.parentElement.getBoundingClientRect();
      const windowHeight = window.innerHeight;

      if (rect.top < windowHeight && rect.bottom > 0) {
        const offset = (rect.top - windowHeight / 2) * speed;
        targetRef.current.style.transform = `translate3d(0, ${offset}px, 0)`;
      }
    };

    const onScroll = () => {
      rafId = requestAnimationFrame(handleScroll);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener("scroll", onScroll);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [speed]);

  return (
    <div className={`parallax-container ${className}`} style={{ overflow: "hidden", position: "relative", ...style }}>
      <div ref={targetRef} className="parallax-inner" style={{ willChange: "transform", height: "100%", width: "100%" }}>
        {children}
      </div>
    </div>
  );
}
