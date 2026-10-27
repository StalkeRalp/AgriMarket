import Link from "next/link";
import {
  ArrowRight,
  Handshake,
  MapPin,
  PackageCheck,
  ShieldCheck,
  Sprout,
  Tractor,
  UsersRound,
  Wheat,
  PawPrint,
  FlaskConical,
  PackageOpen,
} from "lucide-react";
import { AGRI_CATEGORIES } from "@/lib/agriMarket";
import ScrollRevealEffects from "@/composants/ScrollRevealEffects";

export const metadata = {
  title: "À propos d’AgriMarket",
  description: "Découvrez AgriMarket, la marketplace agropastorale camerounaise qui rapproche producteurs, vendeurs et acheteurs.",
};

const categoryIcons = [Wheat, PawPrint, Sprout, FlaskConical, Tractor, PackageOpen];

const values = [
  {
    icon: Handshake,
    title: "Des échanges directs",
    description: "Une place de marché pour mettre en relation les producteurs, les vendeurs spécialisés et les acheteurs.",
  },
  {
    icon: ShieldCheck,
    title: "Des informations claires",
    description: "Les prix, unités de vente, disponibilités et modalités doivent être présentés simplement.",
  },
  {
    icon: MapPin,
    title: "Ancrés au Cameroun",
    description: "Les catégories et parcours prennent en compte la diversité des filières et des régions du pays.",
  },
];

export default function AboutPage() {
  return (
    <ScrollRevealEffects className="agri-about-motion-root" revealSelector="[data-about-reveal]" parallaxSelector="[data-about-parallax]">
    <main className="agri-about-page">
      <section className="agri-about-hero">
        <div className="agri-about-hero-parallax" aria-hidden="true"><img data-about-parallax data-scroll-speed="-0.14" src="/Images%20Agrimarket/pexels-the-northern-lense-2148554063-31120516.jpg" alt="" /></div>
        <div className="agri-about-hero-copy" data-about-reveal>
          <span className="agri-about-kicker"><Sprout size={16} /> À propos d’AgriMarket</span>
          <h1>Le marché agricole,<br /><span>plus proche de vous.</span></h1>
          <p>AgriMarket facilite la rencontre entre celles et ceux qui produisent, transforment, vendent et achètent des produits agropastoraux au Cameroun.</p>
          <div className="agri-about-hero-actions">
            <Link href="/catalogue" className="agri-about-button">Explorer le catalogue <ArrowRight size={16} /></Link>
            <Link href="/demande-produit" className="agri-about-text-link">Vendre sur AgriMarket <ArrowRight size={15} /></Link>
          </div>
        </div>
        <div className="agri-about-hero-caption" data-about-reveal><MapPin size={15} /> Des filières locales, partout au Cameroun</div>
      </section>

      <section className="agri-about-intro">
        <div className="agri-about-intro-image" data-about-reveal>
          <img data-about-parallax data-scroll-speed="-0.16" src="/Images%20Agrimarket/pexels-made-by-pixels-133605980-33364793.jpg" alt="Récolte agricole au Cameroun" />
          <span><Wheat size={17} /> Du champ à votre table</span>
        </div>
        <div className="agri-about-intro-copy" data-about-reveal>
          <span className="agri-about-section-kicker">Notre raison d’être</span>
          <h2>Faciliter les échanges qui font vivre les filières.</h2>
          <p>Dans l’agriculture, l’élevage et la transformation, trouver le bon produit, le bon interlocuteur et les bonnes informations peut prendre du temps. AgriMarket rassemble ces offres dans un espace numérique accessible sur téléphone comme sur ordinateur.</p>
          <p>Notre ambition est de rendre la découverte des produits plus simple et d’aider les vendeurs à présenter leur activité, leurs disponibilités et leurs conditions de vente.</p>
          <div className="agri-about-signature"><span><UsersRound size={19} /></span><div><strong>Un marché ouvert aux acteurs des filières</strong><small>Producteurs · Éleveurs · Transformateurs · Acheteurs</small></div></div>
        </div>
      </section>

      <section className="agri-about-values-section">
        <div className="agri-about-values-parallax agri-about-values-parallax--left" data-about-parallax data-scroll-speed="0.13" aria-hidden="true"><img src="/Images%20Agrimarket/pexels-made-by-pixels-133605980-33364793.jpg" alt="" loading="lazy" /></div>
        <div className="agri-about-values-parallax agri-about-values-parallax--right" data-about-parallax data-scroll-speed="-0.15" aria-hidden="true"><img src="/Images%20Agrimarket/pexels-the-northern-lense-2148554063-31120512.jpg" alt="" loading="lazy" /></div>
        <div className="agri-about-section-heading" data-about-reveal>
          <span className="agri-about-section-kicker">Ce qui nous guide</span>
          <h2>Une plateforme pensée pour le terrain.</h2>
          <p>Des principes simples pour rendre les échanges plus lisibles et mieux adaptés aux besoins du secteur.</p>
        </div>
        <div className="agri-about-values-grid">
          {values.map(({ icon: Icon, title, description }, index) => (
            <article className="agri-about-value-card" key={title} data-about-reveal style={{ "--about-reveal-index": index }}>
              <span className="agri-about-value-number">0{index + 1}</span>
              <span className="agri-about-value-icon"><Icon size={25} /></span>
              <h3>{title}</h3>
              <p>{description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="agri-about-categories-section" id="filieres">
        <div className="agri-about-section-heading agri-about-section-heading--row" data-about-reveal>
          <div><span className="agri-about-section-kicker">Un marché agropastoral</span><h2>Des filières réunies au même endroit.</h2></div>
          <Link href="/catalogue">Tout le catalogue <ArrowRight size={16} /></Link>
        </div>
        <div className="agri-about-categories-grid">
          {AGRI_CATEGORIES.map((category, index) => {
            const Icon = categoryIcons[index] || PackageOpen;
            return (
              <Link href={`/${category.slug}`} className="agri-about-category-card" key={category.id} data-about-reveal style={{ "--about-reveal-index": index }}>
                <img data-about-parallax data-scroll-speed={index % 2 ? "0.12" : "-0.12"} src={category.image} alt="" loading="lazy" />
                <span className="agri-about-category-shade" />
                <span className="agri-about-category-icon"><Icon size={20} /></span>
                <span className="agri-about-category-copy"><strong>{category.shortName}</strong><small>{category.description}</small></span>
                <ArrowRight className="agri-about-category-arrow" size={18} />
              </Link>
            );
          })}
        </div>
      </section>

      <section className="agri-about-cta" data-about-reveal>
        <div><span><Tractor size={19} /> Construisons un marché utile</span><h2>Vous êtes producteur, vendeur ou acheteur ?</h2><p>Parcourez les offres disponibles ou contactez notre équipe pour en savoir plus.</p></div>
        <div className="agri-about-cta-actions"><Link href="/catalogue">Découvrir les offres <ArrowRight size={16} /></Link><Link href="/contact">Nous contacter</Link></div>
      </section>
    </main>
    </ScrollRevealEffects>
  );
}
