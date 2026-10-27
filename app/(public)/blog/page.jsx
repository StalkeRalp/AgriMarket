"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  ArrowRight,
  BookOpen,
  CalendarDays,
  Clock3,
  Search,
  Sprout,
} from "lucide-react";
import { BLOG_POSTS } from "@/lib/data/blog";

function categoryOf(post) {
  if (post.category) return post.category;
  const text = `${post.title || ""} ${post.excerpt || ""}`.toLowerCase();
  if (/avicole|élevage|poulet|poussinière|provende/.test(text)) return "Élevage";
  if (/maïs|plantain|bananeraie|semis|fertilisation|culture/.test(text)) return "Cultures";
  return "Conseils pratiques";
}

function formatDate(value) {
  if (!value) return "Conseils AgriMarket";
  const date = new Date(`${value}T12:00:00`);
  return Number.isNaN(date.getTime())
    ? "Conseils AgriMarket"
    : new Intl.DateTimeFormat("fr-CM", { day: "numeric", month: "long", year: "numeric" }).format(date);
}

export default function BlogPage() {
  const [activeCategory, setActiveCategory] = useState("Tous les articles");
  const [query, setQuery] = useState("");
  const categories = ["Tous les articles", "Cultures", "Élevage", "Conseils pratiques"];

  const filteredPosts = useMemo(() => {
    const term = query.trim().toLocaleLowerCase("fr");
    return BLOG_POSTS.filter((post) => {
      const matchesCategory = activeCategory === "Tous les articles" || categoryOf(post) === activeCategory;
      const matchesQuery = !term || `${post.title} ${post.excerpt} ${post.content} ${categoryOf(post)}`
        .toLocaleLowerCase("fr").includes(term);
      return matchesCategory && matchesQuery;
    });
  }, [activeCategory, query]);

  return (
    <main className="agri-editorial-page">
      <section className="agri-blog-hero">
        <div className="agri-blog-hero-inner">
          <span className="agri-editorial-kicker"><Sprout size={15} /> Le journal AgriMarket</span>
          <h1>Des idées qui font<br /><span>grandir vos projets.</span></h1>
          <p>Conseils de terrain, pratiques agricoles et repères utiles pour les producteurs et éleveurs du Cameroun.</p>
          <a href="#articles" className="agri-editorial-hero-link">Découvrir les articles <ArrowRight size={17} /></a>
        </div>
        <div className="agri-blog-hero-note"><BookOpen size={18} /><span>Des ressources pour mieux produire, vendre et faire grandir votre activité.</span></div>
      </section>

      <section className="agri-blog-content" id="articles">
        <div className="agri-blog-toolbar">
          <div>
            <span className="agri-editorial-eyebrow">À lire et à partager</span>
            <h2>Conseils & actualités</h2>
          </div>
          <label className="agri-blog-search">
            <Search size={17} />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Rechercher un conseil…"
              aria-label="Rechercher un article"
            />
          </label>
        </div>

        <div className="agri-blog-filters" aria-label="Filtrer les articles">
          {categories.map((category) => (
            <button
              key={category}
              type="button"
              className={activeCategory === category ? "is-active" : ""}
              onClick={() => setActiveCategory(category)}
              aria-pressed={activeCategory === category}
            >
              {category}
            </button>
          ))}
        </div>

        {filteredPosts.length ? (
          <div className="agri-blog-grid">
            {filteredPosts.map((post) => (
              <Link href={`/blog/${post.id}`} className="agri-blog-card" key={post.id}>
                <div className="agri-blog-card-image">
                  <img src={post.image} alt={post.title} loading="lazy" />
                  <span>{categoryOf(post)}</span>
                </div>
                <div className="agri-blog-card-copy">
                  <div className="agri-blog-meta"><span><CalendarDays size={13} />{formatDate(post.date)}</span><span><Clock3 size={13} />{post.readTime || "5 min"}</span></div>
                  <h3>{post.title}</h3>
                  <p>{post.excerpt}</p>
                  <span className="agri-blog-read-link">Lire le conseil <ArrowRight size={16} /></span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="agri-blog-empty">
            <BookOpen size={30} />
            <h3>Aucun article pour cette recherche</h3>
            <p>Essayez un autre mot-clé ou choisissez une autre rubrique.</p>
            <button type="button" onClick={() => { setQuery(""); setActiveCategory("Tous les articles"); }}>Voir tous les articles</button>
          </div>
        )}

        <aside className="agri-blog-cta">
          <div><span className="agri-editorial-eyebrow">Besoin d’un conseil ?</span><h2>Notre équipe est là pour vous orienter.</h2></div>
          <Link href="/contact">Parler à AgriMarket <ArrowRight size={17} /></Link>
        </aside>
      </section>
    </main>
  );
}
