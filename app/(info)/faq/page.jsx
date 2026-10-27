import Link from "next/link";
import { ArrowRight, ChevronDown, CircleHelp, Headset, PackageCheck, Sprout } from "lucide-react";
import ScrollRevealEffects from "@/composants/ScrollRevealEffects";

export const metadata = {
  title: "Questions fréquentes",
  description: "Réponses aux questions sur les commandes, paiements, livraisons et ventes sur AgriMarket.",
};

const sections = [
  {
    id: "commandes",
    title: "Commandes & suivi",
    icon: PackageCheck,
    questions: [
      ["Comment passer une commande ?", "Choisissez vos produits, ajoutez-les au panier puis renseignez vos coordonnées et les détails de livraison avant de confirmer."],
      ["Où retrouver ma commande ?", "Connectez-vous à votre compte et ouvrez la rubrique Mes commandes. Gardez votre référence de commande pour toute demande d’assistance."],
      ["Puis-je modifier ou annuler une commande ?", "Les possibilités dépendent de l’avancement de la préparation. Contactez rapidement le vendeur ou notre équipe depuis la page Contact."],
    ],
  },
  {
    id: "paiements",
    title: "Paiements",
    icon: CircleHelp,
    questions: [
      ["Quels moyens de paiement sont proposés ?", "Les options affichées au moment du paiement peuvent inclure MTN Mobile Money, Orange Money et le paiement en espèces à la livraison ou au retrait."],
      ["Comment savoir si mon paiement mobile est confirmé ?", "Suivez les instructions affichées pendant le paiement et attendez la confirmation dans le parcours de commande. Une capture d’écran seule ne confirme pas un paiement."],
    ],
  },
  {
    id: "livraison",
    title: "Livraison & retrait",
    icon: PackageCheck,
    questions: [
      ["Où livrez-vous ?", "La disponibilité et les frais dépendent de la zone desservie et du vendeur. Les informations applicables sont présentées pendant la commande."],
      ["Puis-je retirer ma commande ?", "Lorsqu’un retrait est proposé, vous pourrez le sélectionner pendant la commande et consulter les informations du point de retrait."],
      ["Comment suivre la livraison ?", "Consultez le statut de la commande dans votre compte. Pour une précision, contactez le vendeur ou l’assistance avec votre référence."],
    ],
  },
  {
    id: "vendeurs",
    title: "Compte & vendeurs",
    icon: Sprout,
    questions: [
      ["Comment devenir vendeur sur AgriMarket ?", "Présentez votre activité via notre formulaire Devenir vendeur. Notre équipe pourra vous guider pour la mise en place de votre boutique."],
      ["Puis-je acheter et vendre avec le même compte ?", "Oui. AgriMarket est conçu pour qu’un même compte puisse accéder aux parcours d’achat et de vente selon les fonctionnalités activées."],
      ["Comment mettre à jour mes coordonnées ?", "Connectez-vous, ouvrez votre profil et modifiez vos informations. En cas de difficulté, écrivez-nous depuis la page Contact."],
    ],
  },
];

export default function FAQPage() {
  return (
    <ScrollRevealEffects className="agri-faq-motion-root" revealSelector="[data-faq-reveal]" parallaxSelector="[data-faq-parallax]">
    <main className="agri-editorial-page agri-faq-page">
      <section className="agri-faq-hero">
        <div className="agri-faq-hero-backdrop" aria-hidden="true"><img data-faq-parallax data-scroll-speed="-0.12" src="/Images%20Agrimarket/pexels-nasiru-othman-447186959-36757340.jpg" alt="" /></div>
        <div className="agri-faq-hero-copy" data-faq-reveal>
          <span className="agri-editorial-kicker"><CircleHelp size={15} /> Centre d’aide AgriMarket</span>
          <h1>Comment pouvons-nous<br /><span>vous aider ?</span></h1>
          <p>Retrouvez rapidement les réponses aux questions les plus fréquentes sur vos achats et votre activité.</p>
          <a className="agri-editorial-hero-link" href="#commandes">Parcourir les réponses <ArrowRight size={17} /></a>
        </div>
        <div className="agri-faq-hero-art" aria-hidden="true"><Headset size={68} /><span>À votre écoute</span></div>
      </section>

      <nav className="agri-faq-topics" aria-label="Rubriques de la FAQ">
        {sections.map(({ id, title, icon: Icon }, index) => (
          <a href={`#${id}`} key={id} data-faq-reveal style={{ "--faq-reveal-index": index }}><Icon size={18} />{title}<ArrowRight size={14} /></a>
        ))}
      </nav>

      <div className="agri-faq-layout">
        <div className="agri-faq-parallax-scenery agri-faq-parallax-scenery--left" data-faq-parallax data-scroll-speed="0.12" aria-hidden="true"><img src="/Images%20Agrimarket/pexels-made-by-pixels-133605980-33364793.jpg" alt="" /></div>
        <div className="agri-faq-parallax-scenery agri-faq-parallax-scenery--right" data-faq-parallax data-scroll-speed="-0.14" aria-hidden="true"><img src="/Images%20Agrimarket/pexels-the-northern-lense-2148554063-31120516.jpg" alt="" /></div>
        <div className="agri-faq-sections">
          {sections.map(({ id, title, icon: Icon, questions }) => (
            <section className="agri-faq-group" id={id} key={id} data-faq-reveal>
              <header><span><Icon size={19} /></span><div><span className="agri-editorial-eyebrow">Besoin d’information</span><h2>{title}</h2></div></header>
              <div className="agri-faq-accordion-list">
                {questions.map(([question, answer], index) => (
                  <details className="agri-faq-row" key={question} data-faq-reveal style={{ "--faq-reveal-index": index }}>
                    <summary><span className="agri-faq-index">{String(index + 1).padStart(2, "0")}</span><span>{question}</span><ChevronDown size={18} /></summary>
                    <p>{answer}</p>
                  </details>
                ))}
              </div>
            </section>
          ))}
        </div>

        <aside className="agri-faq-contact-card" data-faq-reveal>
          <div className="agri-faq-contact-icon"><Headset size={30} /></div>
          <span>Nous sommes là pour vous</span>
          <h2>Vous n’avez pas trouvé votre réponse ?</h2>
          <p>Notre équipe peut vous aider pour une commande, un produit ou votre boutique.</p>
          <Link href="/contact">Contacter l’équipe <ArrowRight size={16} /></Link>
          <div className="agri-faq-contact-note"><Sprout size={17} />Une équipe proche des réalités agricoles du Cameroun.</div>
        </aside>
      </div>
    </main>
    </ScrollRevealEffects>
  );
}
