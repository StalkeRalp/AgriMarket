"use client";

import { useEffect, useRef } from "react";

export default function ScrollRevealEffects({ children, className = "", revealSelector, parallaxSelector }) {
  const rootRef = useRef(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return undefined;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let revealObserver;
    let mutationObserver;
    if ("IntersectionObserver" in window && revealSelector) {
      revealObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            revealObserver.unobserve(entry.target);
          }
        });
      }, { threshold: 0.12 });
      root.querySelectorAll(revealSelector).forEach((item) => revealObserver.observe(item));
      mutationObserver = new MutationObserver((records) => {
        records.forEach((record) => record.addedNodes.forEach((node) => {
          if (node.nodeType !== Node.ELEMENT_NODE) return;
          if (node.matches(revealSelector)) revealObserver.observe(node);
          node.querySelectorAll(revealSelector).forEach((item) => revealObserver.observe(item));
        }));
      });
      mutationObserver.observe(root, { childList: true, subtree: true });
    } else if (revealSelector) {
      root.querySelectorAll(revealSelector).forEach((item) => item.classList.add("is-visible"));
    }

    if (reduceMotion.matches || !parallaxSelector) return () => {
      revealObserver?.disconnect();
      mutationObserver?.disconnect();
    };

    const layers = [...root.querySelectorAll(parallaxSelector)];
    let frame = 0;
    const updateParallax = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        layers.forEach((layer) => {
          const rect = layer.getBoundingClientRect();
          const speed = Number(layer.dataset.scrollSpeed || 0.12);
          const offset = Math.max(-95, Math.min(95, (window.innerHeight / 2 - (rect.top + rect.height / 2)) * speed));
          layer.style.setProperty("--scroll-offset", `${offset}px`);
        });
      });
    };
    updateParallax();
    window.addEventListener("scroll", updateParallax, { passive: true });
    window.addEventListener("resize", updateParallax);
    return () => {
      revealObserver?.disconnect();
      mutationObserver?.disconnect();
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", updateParallax);
      window.removeEventListener("resize", updateParallax);
    };
  }, [parallaxSelector, revealSelector]);

  return <div className={className} ref={rootRef}>{children}</div>;
}
