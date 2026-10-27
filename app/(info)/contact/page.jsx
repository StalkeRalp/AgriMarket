"use client";

import Link from "next/link";
import {
  ArrowRight,
  CircleHelp,
  Headset,
  Mail,
  MapPin,
  MessageSquareText,
  Phone,
  Send,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useStore } from "@/lib/store";

const contactBackgrounds = [
  "/Images%20Agrimarket/pexels-the-northern-lense-2148554063-31120512.jpg",
  "/Images%20Agrimarket/pexels-arnaud-vigne-36746332-7164535.jpg",
  "/Images%20Agrimarket/pexels-nasiru-othman-447186959-36757340.jpg",
];

export default function Page() {
  const { notify } = useStore();
  const [activeBackground, setActiveBackground] = useState(0);
  const [previousBackground, setPreviousBackground] = useState(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const timer = window.setTimeout(() => {
      setPreviousBackground(activeBackground);
      setActiveBackground((activeBackground + 1) % contactBackgrounds.length);
    }, 5000);

    return () => window.clearTimeout(timer);
  }, [activeBackground]);

  return (
    <main className="agri-contact-page">
      <section className="agri-contact-shell container">
        <div className="agri-contact-hero">
          <div className="agri-contact-hero-left">
            {contactBackgrounds.map((image, index) => (
              <div
                key={image}
                className={`agri-contact-hero-bg ${activeBackground === index ? "is-active" : ""} ${previousBackground === index ? "is-exiting" : ""}`}
                style={{ backgroundImage: `url("${image}")` }}
                aria-hidden="true"
              />
            ))}
            <div className="agri-contact-hero-content">
              <div className="agri-contact-badge"><MessageSquareText size={17} />Restons en contact</div>
              <h1>
                Contactez <span>AgriMarket</span>
              </h1>
              <p>
                Une équipe à votre écoute pour répondre à toutes vos questions et vous accompagner.
              </p>

              <div className="agri-contact-info-grid">
                <div className="agri-contact-pill">
                  <div className="agri-contact-pill-icon"><Phone size={18} /></div>
                  <div>
                    <strong>Téléphone</strong>
                    <span>+237 6 52 24 78 90</span>
                    <small>Lun - Sam : 8h - 18h</small>
                  </div>
                </div>

                <div className="agri-contact-pill">
                  <div className="agri-contact-pill-icon"><Mail size={18} /></div>
                  <div>
                    <strong>Email</strong>
                    <span>contact@agrimarket.cm</span>
                    <small>Réponse sous 24h</small>
                  </div>
                </div>

                <div className="agri-contact-pill agri-contact-pill--wide">
                  <div className="agri-contact-pill-icon"><MapPin size={18} /></div>
                  <div>
                    <strong>Adresse</strong>
                    <span>Yaoundé, Cameroun</span>
                    <small>Quartier Bastos</small>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="agri-contact-form-wrap">
            <div className="agri-contact-form-card">
              <h2><Send size={18} />Envoyez-nous un message</h2>

              <form
                className="agri-contact-form"
                onSubmit={(e) => {
                  e.preventDefault();
                  e.currentTarget.reset();
                  notify("Message enregistré");
                }}
              >
                <div className="agri-contact-field-grid">
                  <div className="agri-contact-field">
                    <label htmlFor="name">Nom complet *</label>
                    <input id="name" name="name" required placeholder="Nom complet" />
                  </div>
                  <div className="agri-contact-field">
                    <label htmlFor="email">Votre email *</label>
                    <input id="email" name="email" type="email" required placeholder="Votre email" />
                  </div>
                </div>

                <div className="agri-contact-field">
                  <label htmlFor="subject">Sujet *</label>
                  <select id="subject" name="subject" defaultValue="" required>
                    <option value="" disabled>Choisir un sujet</option>
                    <option value="commande">Commande</option>
                    <option value="livraison">Livraison</option>
                    <option value="vendeur">Devenir vendeur</option>
                    <option value="autre">Autre demande</option>
                  </select>
                </div>

                <div className="agri-contact-field">
                  <label htmlFor="message">Votre message *</label>
                  <textarea id="message" name="message" required placeholder="Écrivez votre message ici..." />
                </div>

                <button type="submit" className="agri-contact-submit-btn">
                  <Send size={18} />
                  <span>Envoyer le message</span>
                </button>
              </form>
            </div>
          </div>
        </div>

        <div className="agri-contact-lower-grid">
          <div className="agri-contact-map-card">
            <div className="agri-mini-title">
              <MapPin size={16} />
              <span>Notre localisation</span>
            </div>
            <div className="agri-map-box">
              <iframe
                title="Carte AgriMarket à Bastos, Yaoundé"
                src="https://maps.google.com/maps?q=Bastos%2C%20Yaound%C3%A9%2C%20Cameroon&z=14&output=embed"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                allowFullScreen
              />
            </div>
            <a className="agri-map-btn" href="https://maps.google.com/?q=Bastos,+Yaounde,+Cameroon" target="_blank" rel="noreferrer">
              Voir sur Google Maps <ArrowRight size={15} />
            </a>
          </div>

          <div className="agri-contact-faq-card">
            <div className="agri-mini-title">
              <CircleHelp size={18} />
              <span>Questions fréquentes</span>
            </div>

            <div className="agri-faq-list">
              <details className="agri-faq-item">
                <summary><span className="agri-faq-plus">+</span><span>Comment acheter sur AgriMarket ?</span></summary>
                <p className="agri-faq-answer">Parcourez le catalogue, ajoutez les produits à votre panier puis suivez les étapes de commande.</p>
              </details>
              <details className="agri-faq-item">
                <summary><span className="agri-faq-plus">+</span><span>Quels sont les moyens de paiement ?</span></summary>
                <p className="agri-faq-answer">Les options disponibles sont indiquées au moment de la commande selon le vendeur et la zone.</p>
              </details>
              <details className="agri-faq-item">
                <summary><span className="agri-faq-plus">+</span><span>Comment devenir vendeur ?</span></summary>
                <p className="agri-faq-answer">Contactez notre équipe pour présenter votre activité et ouvrir votre boutique.</p>
              </details>
            </div>
            <Link href="/faq" className="agri-contact-faq-link">Voir toutes les FAQ <ArrowRight size={14} /></Link>
          </div>

          <div className="agri-contact-support-card">
            <div className="agri-support-icon">
              <Headset size={38} />
            </div>
            <h3>Besoin d’aide ?</h3>
            <p>Notre service client est disponible pour vous accompagner.</p>
            <Link href="/faq" className="agri-support-btn">
              Nous contacter
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>

      </section>
    </main>
  );
}
