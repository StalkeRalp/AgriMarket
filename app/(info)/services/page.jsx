import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  Headset,
  MapPinned,
  Sprout,
} from "lucide-react";
import ServicesShowcase from "./ServicesShowcase";
import ServicesProcess from "./ServicesProcess";

export const metadata = {
  title: "Services AgriMarket | Accompagnement des filières agricoles",
  description: "Découvrez les services AgriMarket pour trouver des produits, contacter les vendeurs, suivre vos commandes et préparer vos besoins agricoles au Cameroun.",
};

export default function ServicesPage() {
  return (
    <main className="agri-services-page">
      <header className="agri-services-hero">
        <div className="agri-services-hero-copy">
          <span className="agri-services-kicker"><Sprout size={15} /> AgriMarket · services</span>
          <h1>Des services pensés<br /><span>pour avancer ensemble.</span></h1>
          <p>De la recherche d’un produit à la préparation de votre commande, retrouvez les ressources et les interlocuteurs utiles à votre activité.</p>
          <div className="agri-services-hero-actions"><Link href="/catalogue" className="agri-services-button">Explorer le catalogue <ArrowRight size={16} /></Link><Link href="/contact" className="agri-services-secondary">Parler à notre équipe</Link></div>
        </div>
        <div className="agri-services-hero-badge"><MapPinned size={18} /><span>Au service des filières<br />agropastorales du Cameroun</span></div>
      </header>

      <ServicesShowcase />

      <ServicesProcess />

      <section className="agri-services-help"><span><Headset size={23} /></span><div><span className="agri-services-section-kicker">BESOIN D’UN ACCOMPAGNEMENT ?</span><h2>Parlons de votre activité.</h2><p>Expliquez-nous votre demande ; nous vous orienterons vers le bon parcours sur AgriMarket.</p></div><Link href="/contact">Contacter l’équipe <ArrowRight size={16} /></Link></section>
      <div className="agri-services-trust"><BadgeCheck size={19} /><span>Les disponibilités, prix, délais et services complémentaires sont à confirmer auprès du vendeur ou de l’équipe avant validation.</span></div>
    </main>
  );
}
