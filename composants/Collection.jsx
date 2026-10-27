"use client";

import Link from "next/link";
import { ArrowRight, BookOpen, Clock, Grid3X3, LayoutGrid, Search, SlidersHorizontal, X } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { useStore } from "@/lib/store";
import { ProductCard } from "@/composants/ProductCard";

const heroes = {
  Tous: [
    "Tout le catalogue",
    "Le marché agropastoral du Cameroun.",
    "Vivriers frais, bétail, semences certifiées, engrais et outillage au prix direct bord champ dans les 10 régions.",
    "/Images%20Agrimarket/pexels-made-by-pixels-133605980-33364793.jpg"
  ],
  "Produits vivriers et agricoles": [
    "Vivriers & Récoltes",
    "Céréales, tubercules, légumes et fruits locaux.",
    "Des récoltes fraîches et saines en direct des coopératives et producteurs locaux certifiés.",
    "/Images%20Agrimarket/pexels-nasiru-othman-447186959-36757340.jpg"
  ],
  "Élevage et produits animaux": [
    "Élevage & Animaux",
    "Volailles, bétail, provende et produits fermiers.",
    "Tout pour développer votre cheptel et optimiser vos productions animales au Cameroun.",
    "/Images%20Agrimarket/pexels-the-northern-lense-2148554063-31120512.jpg"
  ],
  "Semences, plants et pépinières": [
    "Semences & Plants",
    "Semences certifiées, rejets et pépinières fruitières.",
    "Du matériel végétal vigoureux pour démarrer vos campagnes de production sur de bonnes bases.",
    "/Images%20Agrimarket/pexels-jakubzerdzicki-28100001.jpg"
  ],
  "Intrants agricoles": [
    "Intrants & Fertilisants",
    "Engrais NPK, compost bio et amendements de sol.",
    "Des solutions homologuées pour booster la fertilité et vos rendements à l'hectare.",
    "/Images%20Agrimarket/pexels-cristianojr9-27173521.jpg"
  ],
  "Matériel et équipements": [
    "Matériel & Équipements",
    "Outillage, pulvérisateurs, motopompes et irrigation.",
    "Des équipements robustes et adaptés aux conditions des exploitations de terrain.",
    "/Images%20Agrimarket/pexels-arnaud-vigne-36746332-7164535.jpg"
  ],
  "Produits transformés": [
    "Produits transformés",
    "Farines locales, huiles pures et conserves artisanales.",
    "La valorisation des denrées du terroir pour une alimentation saine et accessible.",
    "/Images%20Agrimarket/pexels-fera-263453090-36991618.jpg"
  ],
  Nouveautés: [
    "Nouveautés agricoles",
    "Les derniers arrivages et récoltes fraîches.",
    "Découvrez les offres fraîchement publiées par nos agriculteurs et distributeurs partenaires.",
    "/Images%20Agrimarket/pexels-nasiru-othman-447186959-36757340.jpg"
  ],
  Promotions: [
    "Offres & promotions",
    "Des prix avantageux sur vos achats agropastoraux.",
    "Profitez de remises exclusives sur les semences, intrants et denrées de saison.",
    "/Images%20Agrimarket/pexels-made-by-pixels-133605980-33364793.jpg"
  ],
};

const catalogAdviceGuides = [
  {
    title: "Calendrier agricole Cameroun : Réussir la campagne maïs pluvial",
    category: "Agronomie & Semences",
    date: "Mars 2026",
    readTime: "5 min de lecture",
    excerpt: "Préparation du sol, densité optimale de semis hybride certifié et fertilisation NPK équilibrée.",
    image: "/Images%20Agrimarket/pexels-nasiru-othman-447186959-36757340.jpg",
    link: "/blog/post-1"
  },
  {
    title: "Fiche technique : Conduite d'un élevage avicole rentable en 42 jours",
    category: "Élevage & Provende",
    date: "Février 2026",
    readTime: "7 min de lecture",
    excerpt: "Gestion thermique de la poussinière, transition alimentaire démarrage-finition et prophylaxie rigoureuse.",
    image: "/Images%20Agrimarket/pexels-the-northern-lense-2148554063-31120512.jpg",
    link: "/blog/post-2"
  },
  {
    title: "Irrigation solaire : Rentabiliser 1 hectare maraîcher en saison sèche",
    category: "Irrigation & Eau",
    date: "Janvier 2026",
    readTime: "6 min de lecture",
    excerpt: "Dimensionnement d'une motopompe solaire immergée et réseau goutte-à-goutte économique pour tomates et piments.",
    image: "/Images%20Agrimarket/pexels-jakubzerdzicki-28100001.jpg",
    link: "/blog/post-3"
  }
];

export function Collection({ newOnly = false, promoOnly = false, fixedCategory = null }) {
  const params = useSearchParams();
  const { products } = useStore();

  const initialCategory = fixedCategory || params.get("category") || "Tous";
  const [query, setQuery] = useState(params.get("q") || "");
  const [category, setCategory] = useState(initialCategory);
  const [brand, setBrand] = useState("Tous");
  const [saleMode, setSaleMode] = useState("Tous"); // "Tous", "detail", "gros"
  const [stockOnly, setStockOnly] = useState(false);
  const [sort, setSort] = useState("featured");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [gridCols, setGridCols] = useState(3); // 3 or 4 columns
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;

  const categories = ["Tous", ...new Set(products.map((p) => p.category))];
  const brands = ["Tous", ...new Set(products.map((p) => p.brand))];
  // fixedCategory chooses the first view when entering a category route;
  // the category ribbon remains interactive so shoppers can switch sections.
  const activeCategory = category;
  const hero = newOnly ? heroes.Nouveautés : heroes[activeCategory] || heroes.Tous;

  const items = useMemo(() => {
    return products
      .filter((product) => {
        if (["archived", "suspended", "pending", "draft"].includes(String(product.status || "").toLowerCase())) return false;
        const text = [product.name, product.brand, product.category, product.reference, product.shortDescription, product.location, product.unit]
          .join(" ")
          .toLowerCase();
        const matchesSaleMode = saleMode === "Tous" 
          ? true 
          : product.saleMode === saleMode || product.saleMode === "les-deux";

        return (
          (!newOnly || product.new) &&
          (!promoOnly || product.promo) &&
          (activeCategory === "Tous" || product.category === activeCategory) &&
          (brand === "Tous" || product.brand === brand) &&
          matchesSaleMode &&
          (!stockOnly || product.stock > 0) &&
          (!query || text.includes(query.toLowerCase()))
        );
      })
      .sort((a, b) =>
        sort === "price-asc"
          ? a.price - b.price
          : sort === "price-desc"
          ? b.price - a.price
          : sort === "rating"
          ? b.rating - a.rating
          : Number(b.featured) - Number(a.featured)
      );
  }, [products, newOnly, promoOnly, activeCategory, brand, saleMode, stockOnly, query, sort]);

  const totalPages = Math.ceil(items.length / itemsPerPage);
  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return items.slice(start, start + itemsPerPage);
  }, [items, currentPage, itemsPerPage]);

  const resetAllFilters = () => {
    setCategory("Tous");
    setBrand("Tous");
    setSaleMode("Tous");
    setStockOnly(false);
    setQuery("");
    setCurrentPage(1);
  };

  const hasActiveFilters = activeCategory !== "Tous" || brand !== "Tous" || saleMode !== "Tous" || stockOnly || query !== "";

  return (
    <main className="collection-page">
      {/* Breadcrumbs */}
      <nav className="collection-breadcrumb container">
        <Link href="/">Accueil</Link>
        <span>/</span>
        <Link href="/catalogue">Catalogue</Link>
        <span>/</span>
        <strong>{hero[0]}</strong>
      </nav>

      {/* Hero Banner Full-Bleed 100vw Réduit */}
      <header className="collection-hero collection-hero-fullbleed">
        <div className="collection-hero__content">
          <p className="eyebrow">{hero[0]}</p>
          <h1>{hero[1]}</h1>
          <p>{hero[2]}</p>
          <a href="#results" className="agri-catalogue-hero-cta">
            <span>Explorer les offres ({items.length})</span>
            <ArrowRight width={14} height={14} />
          </a>
        </div>
        <div className="collection-hero__media">
          <img src={hero[3]} alt={hero[0]} />
        </div>
      </header>

      {/* Category Pills Ribbon */}
      <section className="container category-pills-strip">
        {categories.map((cat) => (
          <button
            key={cat}
            className={`pill-tab ${activeCategory === cat ? "active" : ""}`}
            onClick={() => {
              setCategory(cat);
              setCurrentPage(1);
            }}
          >
            {cat}
          </button>
        ))}
      </section>

      {/* Main Catalog Layout */}
      <section className="collection-layout container" id="results">
        <button
          className={`collection-filter-overlay ${filtersOpen ? "is-open" : ""}`}
          onClick={() => setFiltersOpen(false)}
          aria-label="Fermer les filtres"
        />

        {/* Filters Sidebar */}
        <aside className={`collection-sidebar ${filtersOpen ? "is-open" : ""}`}>
          <div className="collection-sidebar__head">
            <strong>Filtres & Préférences</strong>
            <button onClick={() => setFiltersOpen(false)}>
              <X />
            </button>
          </div>

          <div className="collection-sidebar__body">
            <label className="collection-search">
              <Search />
              <input
                value={query}
                onChange={(event) => {
                  setQuery(event.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Rechercher maïs, plantain, engrais..."
              />
            </label>

            <details className="collection-filter-group" open>
              <summary>Catégories agropastorales</summary>
              <div>
                {categories.map((value) => (
                  <label className="collection-check" key={value}>
                    <input
                      type="radio"
                      name="category"
                      checked={category === value}
                      onChange={() => {
                        setCategory(value);
                        setCurrentPage(1);
                      }}
                    />
                    <span />
                    {value}
                  </label>
                ))}
              </div>
            </details>

            <details className="collection-filter-group" open>
              <summary>Mode de commercialisation</summary>
              <div>
                {[
                  { value: "Tous", label: "Tous les modes" },
                  { value: "detail", label: "Vente au détail" },
                  { value: "gros", label: "Vente en gros / Demi-gros" }
                ].map((mode) => (
                  <label className="collection-check" key={mode.value}>
                    <input
                      type="radio"
                      name="saleMode"
                      checked={saleMode === mode.value}
                      onChange={() => {
                        setSaleMode(mode.value);
                        setCurrentPage(1);
                      }}
                    />
                    <span />
                    {mode.label}
                  </label>
                ))}
              </div>
            </details>

            <details className="collection-filter-group" open>
              <summary>Producteurs & Coopératives</summary>
              <div>
                {brands.map((value) => (
                  <label className="collection-check" key={value}>
                    <input
                      type="radio"
                      name="brand"
                      checked={brand === value}
                      onChange={() => {
                        setBrand(value);
                        setCurrentPage(1);
                      }}
                    />
                    <span />
                    {value}
                  </label>
                ))}
              </div>
            </details>

            <details className="collection-filter-group" open>
              <summary>Disponibilité</summary>
              <div>
                <label className="collection-check">
                  <input
                    type="checkbox"
                    checked={stockOnly}
                    onChange={(event) => {
                      setStockOnly(event.target.checked);
                      setCurrentPage(1);
                    }}
                  />
                  <span />
                  En stock uniquement
                </label>
              </div>
            </details>
          </div>

          <div className="collection-sidebar__footer">
            <button className="collection-reset" onClick={resetAllFilters}>
              Tout effacer
            </button>
            <button className="btn-pill-primary" onClick={() => setFiltersOpen(false)}>
              Voir les résultats ({items.length})
            </button>
          </div>
        </aside>

        {/* Results Area */}
        <div className="collection-results">
          <div className="collection-mobile-tools">
            <button onClick={() => setFiltersOpen(true)}>
              <SlidersHorizontal /> Filtrer les résultats
            </button>
          </div>

          {/* Results Bar Header */}
          <header className="collection-results__head">
            <p>
              <strong>{items.length}</strong> produit{items.length > 1 ? "s" : ""} trouvé{items.length > 1 ? "s" : ""}
            </p>

            <div className="results-controls-right">
              {/* Grid switcher */}
              <div className="grid-switcher-btns">
                <button
                  className={`grid-btn ${gridCols === 3 ? "active" : ""}`}
                  onClick={() => setGridCols(3)}
                  title="Grille 3 colonnes"
                >
                  <Grid3X3 width={16} />
                </button>
                <button
                  className={`grid-btn ${gridCols === 4 ? "active" : ""}`}
                  onClick={() => setGridCols(4)}
                  title="Grille 4 colonnes"
                >
                  <LayoutGrid width={16} />
                </button>
              </div>

              <label className="sort-label">
                Trier par :
                <select value={sort} onChange={(event) => setSort(event.target.value)}>
                  <option value="featured">Sélection ITEXAL</option>
                  <option value="price-asc">Prix : croissant</option>
                  <option value="price-desc">Prix : décroissant</option>
                  <option value="rating">Avis clients</option>
                </select>
              </label>
            </div>
          </header>

          {/* Active Filter Badges Bar */}
          {hasActiveFilters && (
            <div className="active-filter-chips-bar">
              <span className="chips-title">Filtres actifs :</span>
              {query && (
                <button className="filter-chip-badge" onClick={() => setQuery("")}>
                  Recherche: "{query}" <X width={12} />
                </button>
              )}
              {activeCategory !== "Tous" && (
                <button className="filter-chip-badge" onClick={() => setCategory("Tous")}>
                  Catégorie: {activeCategory} <X width={12} />
                </button>
              )}
              {brand !== "Tous" && (
                <button className="filter-chip-badge" onClick={() => setBrand("Tous")}>
                  Marque: {brand} <X width={12} />
                </button>
              )}
              {stockOnly && (
                <button className="filter-chip-badge" onClick={() => setStockOnly(false)}>
                  En stock <X width={12} />
                </button>
              )}
              <button className="clear-all-chip" onClick={resetAllFilters}>
                Tout effacer
              </button>
            </div>
          )}

          {/* Products Grid */}
          {paginatedItems.length ? (
            <>
              <div className={`product-grid collection-product-grid ${gridCols === 4 ? "grid-4cols" : "grid-3cols"}`}>
                {paginatedItems.map((product) => (
                  <ProductCard product={product} key={product.id} />
                ))}
              </div>

              {/* Pagination Bar */}
              {totalPages > 1 && (
                <div className="pagination-bar">
                  <button
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    className="pagination-btn"
                  >
                    « Précédent
                  </button>
                  <div className="pagination-pages">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        className={`page-number ${currentPage === page ? "active" : ""}`}
                        onClick={() => setCurrentPage(page)}
                      >
                        {page}
                      </button>
                    ))}
                  </div>
                  <button
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    className="pagination-btn"
                  >
                    Suivant »
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="empty-state-card">
              <h2>Aucun produit ne correspond à votre recherche</h2>
              <p>Essayez de modifier ou de réinitialiser vos filtres pour découvrir d'autres offres agropastorales.</p>
              <button className="agri-catalogue-hero-cta" onClick={resetAllFilters}>
                <span>Réinitialiser les filtres</span>
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Guides & Conseils Agricoles */}
      <section className="collection-journal" aria-label="Conseils agronomiques et fiches techniques">
        <div className="container" style={{ maxWidth: "1540px", margin: "0 auto", padding: "0 24px" }}>
          <div className="agri-catalog-advice-head">
            <div>
              <div className="agri-section-sub-kicker">
                <BookOpen width={14} height={14} />
                <span>CONSEILS &amp; FICHES TECHNIQUES</span>
              </div>
              <h2>Guides &amp; Bonnes Pratiques pour Producteurs &amp; Acheteurs</h2>
              <p>Des fiches pratiques élaborées avec nos agronomes et partenaires de terrain pour rentabiliser vos cultures, soigner vos élevages et sécuriser vos récoltes au Cameroun.</p>
            </div>
            <Link href="/blog" className="agri-see-all-link">
              <span>Tous les guides agronomiques</span>
              <ArrowRight width={14} height={14} />
            </Link>
          </div>

          <div className="agri-catalog-advice-grid">
            {catalogAdviceGuides.map((guide) => (
              <Link key={guide.title} href={guide.link} className="agri-catalog-advice-card">
                <div className="agri-catalog-advice-media">
                  <img src={guide.image} alt={guide.title} loading="lazy" />
                  <span className="agri-catalog-advice-tag">{guide.category}</span>
                </div>
                <div className="agri-catalog-advice-body">
                  <div className="agri-catalog-advice-meta">
                    <span className="agri-catalog-advice-time">
                      <Clock width={12} height={12} />
                      {guide.readTime}
                    </span>
                    <span className="agri-catalog-advice-date">{guide.date}</span>
                  </div>
                  <h3>{guide.title}</h3>
                  <p>{guide.excerpt}</p>
                  <span className="agri-catalog-advice-cta">
                    <span>Consulter la fiche technique</span>
                    <ArrowRight width={13} height={13} className="agri-advice-arrow" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

