"use client";

import { 
  ArrowRight, 
  ArrowUp, 
  Bell, 
  Bird,
  BookOpen,
  Boxes,
  Building2,
  ChevronLeft, 
  ChevronRight, 
  CreditCard,
  FlaskConical,
  Handshake,
  Heart, 
  HelpCircle,
  LockKeyhole, 
  LogOut, 
  MapPin,
  Menu, 
  Music2,
  Package, 
  Search, 
  ShieldCheck, 
  ShoppingBag, 
  Snowflake,
  Sprout,
  Tractor,
  Truck, 
  User, 
  UserRound, 
  Wheat,
  X
} from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";

const FacebookIcon = ({ width = 16, height = 16 }) => (
  <svg width={width} height={height} viewBox="0 0 24 24" fill="currentColor">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
);

const InstagramIcon = ({ width = 16, height = 16 }) => (
  <svg width={width} height={height} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
  </svg>
);

const YoutubeIcon = ({ width = 16, height = 16 }) => (
  <svg width={width} height={height} viewBox="0 0 24 24" fill="currentColor">
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
  </svg>
);
import { useStore } from "@/lib/store";
import { money } from "@/lib/format";
import { LogoutModal } from "@/composants/LogoutModal";

function HeaderActionButtons({ setShowLogoutModal, isSearchOpen, setIsSearchOpen, searchQuery, setSearchQuery, handleSearchSubmit, searchResults }) {
  const [mounted, setMounted] = useState(false);
  const [selectedCity, setSelectedCity] = useState("Yaoundé");
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const { user, wishlist, orders, itemCount, unreadNotificationsCount } = useStore();

  useEffect(() => {
    setMounted(true);
  }, []);

  const ordersCount = orders ? orders.length : 0;

  return (
    <div className="agri-header-actions">
      {/* Sélecteur de ville / région */}
      <div className="agri-city-picker" title="Sélectionner votre ville de livraison">
        <MapPin width={14} height={14} style={{ color: "var(--agri-green)", flexShrink: 0 }} />
        <select 
          value={selectedCity} 
          onChange={(e) => setSelectedCity(e.target.value)}
          aria-label="Ville de livraison"
        >
          <option value="Yaoundé">Yaoundé</option>
          <option value="Douala">Douala</option>
          <option value="Bafoussam">Bafoussam</option>
          <option value="Garoua">Garoua</option>
          <option value="Bertoua">Bertoua</option>
          <option value="Bamenda">Bamenda</option>
          <option value="Ebolowa">Ebolowa</option>
          <option value="Maroua">Maroua</option>
          <option value="Buéa">Buéa</option>
          <option value="Ngaoundéré">Ngaoundéré</option>
        </select>
      </div>

      {/* Bouton Recherche Rapide */}
      <div className="agri-search-toggle-wrap" style={{ position: "relative" }}>
        <button
          type="button"
          className={`agri-icon-btn ${isSearchOpen ? "active" : ""}`}
          onClick={() => setIsSearchOpen(!isSearchOpen)}
          aria-label="Rechercher sur AgriMarket"
          title="Rechercher"
        >
          <Search width={18} height={18} />
        </button>

        {isSearchOpen && (
          <div className="agri-header-search-flyout">
            <form onSubmit={handleSearchSubmit} className="agri-search-flyout-form">
              <Search width={16} height={16} className="flyout-search-icon" />
              <input
                type="text"
                placeholder="Maïs sec, poulet, semences, NPK..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
              />
              {searchQuery && (
                <button type="button" onClick={() => setSearchQuery("")} className="flyout-clear-btn">
                  <X width={14} height={14} />
                </button>
              )}
              <button type="submit" className="flyout-submit-btn">OK</button>
            </form>

            {searchQuery.trim().length >= 2 && (
              <div className="search-results-overlay">
                {searchResults.length > 0 ? (
                  <>
                    <div className="results-header">
                      <span>Produits trouvés ({searchResults.length})</span>
                    </div>
                    <div className="results-list">
                      {searchResults.map((p) => (
                        <Link 
                          key={p.id} 
                          href={`/produit/${p.slug || p.id}`}
                          className="search-result-item"
                          onClick={() => { setSearchQuery(""); setIsSearchOpen(false); }}
                        >
                          <img src={p.image} alt={p.name} className="result-thumb" />
                          <div className="result-info">
                            <span className="result-brand">{p.brand}</span>
                            <h4 className="result-title">{p.name}</h4>
                            <strong className="result-price">{money ? money(p.price) : `${p.price} FCFA`}</strong>
                          </div>
                        </Link>
                      ))}
                    </div>
                    <button type="button" onClick={handleSearchSubmit} className="view-all-results-btn">
                      Voir tous les résultats pour "{searchQuery}" <ArrowRight width={14} />
                    </button>
                  </>
                ) : (
                  <div className="no-results-box">
                    <span>Aucun produit trouvé pour "{searchQuery}"</span>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Bouton Favoris / Wishlist */}
      <Link href="/favoris" className="agri-icon-btn" aria-label="Favoris" title="Mes favoris">
        <Heart width={18} height={18} />
        {mounted && wishlist && wishlist.length > 0 && (
          <span className="agri-cart-badge">{wishlist.length}</span>
        )}
      </Link>

      {/* Bouton Panier */}
      <Link href="/panier" className="agri-icon-btn agri-cart-btn" aria-label="Panier d'achat" title="Mon panier">
        <ShoppingBag width={18} height={18} />
        {mounted && itemCount > 0 && (
          <span className="agri-cart-badge">{itemCount}</span>
        )}
      </Link>

      {/* Compte Utilisateur / Connexion */}
      {mounted && user ? (
        <div className="agri-account-dropdown-wrap" style={{ position: "relative" }}>
          <button 
            type="button" 
            className="agri-account-btn"
            onClick={() => setAccountMenuOpen(!accountMenuOpen)}
            style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}
          >
            {user.avatar ? (
              <img 
                src={user.avatar} 
                alt={user.firstName || user.name || "Profil"} 
                style={{ width: "24px", height: "24px", borderRadius: "50%", objectFit: "cover", border: "2px solid var(--agri-green)", flexShrink: 0 }}
              />
            ) : (
              <User width={16} height={16} />
            )}
            <span style={{ maxWidth: "110px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {user.firstName || user.name || "Mon compte"}
            </span>
            <ChevronRight width={12} height={12} style={{ transform: "rotate(90deg)" }} />
          </button>

          {accountMenuOpen && (
            <div className="agri-account-menu" onClick={() => setAccountMenuOpen(false)}>
              <div className="agri-account-menu-header" style={{ display: "flex", alignItems: "center", gap: "10px", padding: "14px 16px" }}>
                {user.avatar ? (
                  <img 
                    src={user.avatar} 
                    alt="Photo profil" 
                    style={{ width: "36px", height: "36px", borderRadius: "50%", objectFit: "cover", border: "2px solid var(--agri-green)", flexShrink: 0 }} 
                  />
                ) : (
                  <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: "var(--agri-green)", color: "#fff", display: "grid", placeItems: "center", fontWeight: "bold" }}>
                    {(user.firstName || user.name || "U").charAt(0).toUpperCase()}
                  </div>
                )}
                <div style={{ minWidth: 0 }}>
                  <strong style={{ display: "block", fontSize: "13px", color: "var(--agri-dark)", textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }}>
                    {user.name || `${user.firstName || ""} ${user.lastName || ""}`.trim() || "Exploitant"}
                  </strong>
                  <small style={{ color: "#64748b", fontSize: "11px", display: "block", textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }}>
                    {user.email || user.phone || "AgriMarket"}
                  </small>
                </div>
              </div>
              <Link href="/profil" className="agri-account-menu-item">
                <User width={14} height={14} /> Mon profil & exploitation
              </Link>
              <Link href="/commandes" className="agri-account-menu-item">
                <Package width={14} height={14} /> Mes commandes ({ordersCount})
              </Link>
              <Link href="/notifications" className="agri-account-menu-item">
                <Bell width={14} height={14} /> Notifications {unreadNotificationsCount > 0 && `(${unreadNotificationsCount})`}
              </Link>
              <button 
                type="button" 
                className="agri-account-menu-item logout"
                onClick={() => setShowLogoutModal(true)}
              >
                <LogOut width={14} height={14} /> Déconnexion
              </button>
            </div>
          )}
        </div>
      ) : (
        <Link href="/connexion" className="agri-account-btn" title="Se connecter ou créer un compte">
          <User width={16} height={16} />
          <span>Mon compte</span>
          <ChevronRight width={12} height={12} style={{ transform: "rotate(90deg)" }} />
        </Link>
      )}
    </div>
  );
}

function AgriMarketFooter({ mounted }) {
  if (!mounted) return null;

  return (
    <footer className="fenty-style-footer agri-footer-modern">
      <div className="agri-footer-features">
        <div className="agri-footer-features-inner">
          <div className="agri-footer-feature"><Tractor width={26} /><p>Une plateforme camerounaise au service des filières agropastorales</p></div>
          <div className="agri-footer-feature"><ShieldCheck width={26} /><p>Des informations claires pour commander en confiance</p></div>
          <div className="agri-footer-feature"><UserRound width={26} /><p>Une mise en relation entre producteurs et acheteurs</p></div>
          <Link href="/catalogue" className="agri-footer-feature-cta">Explorer le catalogue <ArrowRight width={16} /></Link>
        </div>
      </div>
      <div className="container agri-footer-shell">
        <div className="agri-footer-social-bar">
          <span className="agri-footer-social-label">Suivez-nous</span>
          <div className="agri-footer-social-icons">
            <a href="https://facebook.com" target="_blank" rel="noreferrer" aria-label="Facebook" className="social-btn social-fb"><FacebookIcon width={16} height={16} /></a>
            <a href="https://x.com" target="_blank" rel="noreferrer" aria-label="X" className="social-btn social-x"><X width={16} height={16} /></a>
            <a href="https://instagram.com" target="_blank" rel="noreferrer" aria-label="Instagram" className="social-btn social-ig"><InstagramIcon width={16} height={16} /></a>
            <a href="https://youtube.com" target="_blank" rel="noreferrer" aria-label="YouTube" className="social-btn social-yt"><YoutubeIcon width={16} height={16} /></a>
            <a href="https://tiktok.com" target="_blank" rel="noreferrer" aria-label="TikTok" className="social-btn social-tk"><Music2 width={16} height={16} /></a>
          </div>
        </div>

        <div className="agri-footer-grid">
          <div className="agri-footer-brand-block">
            <div className="agri-footer-logo">
              <img src="/logo/AgriMarket_logo.png" alt="AgriMarket Logo" />
              <div className="agri-footer-brand-text"><strong>AgriMarket</strong><span>Du champ à votre table</span></div>
            </div>
            <div className="agri-footer-contact"><a href="tel:+237670000000">+237 670 000 000</a><a href="mailto:support@agrimarket.cm">support@agrimarket.cm</a></div>
          </div>

          <div className="agri-footer-column"><h4>Pages</h4><ul><li><Link href="/">Accueil</Link></li><li><Link href="/catalogue">Catalogue</Link></li><li><Link href="/services">Services</Link></li><li><Link href="/blog">Conseils agricoles</Link></li><li><Link href="/contact">Contact</Link></li><li><Link href="/faq">FAQ</Link></li></ul></div>
          <div className="agri-footer-column"><h4>Mon compte</h4><ul><li><Link href="/connexion">Connexion</Link></li><li><Link href="/profil">Profil</Link></li><li><Link href="/commandes">Mes commandes</Link></li><li><Link href="/favoris">Favoris</Link></li><li><Link href="/notifications">Notifications</Link></li></ul></div>
          <div className="agri-footer-column"><h4>Catégories</h4><ul><li><Link href="/vivriers">Vivriers & récoltes</Link></li><li><Link href="/elevage">Élevage & nutrition</Link></li><li><Link href="/semences">Semences & plants</Link></li><li><Link href="/intrants">Intrants & engrais</Link></li><li><Link href="/materiel">Matériel & équipements</Link></li><li><Link href="/transformes">Produits transformés</Link></li></ul></div>
        </div>

        <div className="agri-footer-divider" />
        <div className="agri-footer-bottom"><p>© 2026 AgriMarket Cameroun. Tous droits réservés.</p><div className="agri-footer-legal"><Link href="/conditions">CGV</Link><span>•</span><Link href="/confidentialite">Confidentialité</Link><span>•</span><Link href="/a-propos">À propos</Link></div></div>
      </div>
    </footer>
  );
}

export function SiteLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const { products } = useStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 350);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleSearchSubmit = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/catalogue?q=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchOpen(false);
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const searchResults = searchQuery.trim().length >= 2 && products
    ? products.filter(p => 
        p.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.brand?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category?.toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 5)
    : [];

  const isAuthPage = ["/inscription", "/connexion", "/mot-de-passe-oublie", "/reinitialisation-mot-de-passe", "/verification-otp"].includes(pathname);
  const isHome = pathname === "/";
  const isContact = pathname === "/contact";

  if (isAuthPage) {
    return <>{children}<AgriMarketFooter mounted={mounted} /></>;
  }

  return (
    <div className={`site-layout ${isHome ? "is-home-layout" : ""} ${isContact ? "is-contact-layout" : ""}`}>
      {/* Navigation principale, directement au sommet de la page */}
      <header className={`agri-site-header ${isHome ? "is-home-glass" : ""}`}>
        <div className="agri-header-container">
          {/* Logo AgriMarket */}
          <Link href="/" className="agri-header-logo">
            <img src="/logo/AgriMarket_logo.png" alt="AgriMarket Logo" />
            <div className="agri-logo-tagline">
              <strong>AgriMarket</strong>
              <span>Du champ à votre table</span>
            </div>
          </Link>

          {/* Navigation Centrale avec Menus Déroulants */}
          <nav className="agri-nav-menu">
            <div className="agri-nav-item">
              <Link href="/" className={`agri-nav-link ${pathname === "/" ? "active" : ""}`}>
                Accueil
              </Link>
            </div>

            <div className="agri-nav-item">
              <Link href="/catalogue" className={`agri-nav-link ${pathname.startsWith("/catalogue") ? "active" : ""}`}>
                Catalogue
                <ChevronRight width={13} height={13} style={{ transform: "rotate(90deg)" }} />
              </Link>
              <div className="agri-dropdown-menu">
                <Link href="/vivriers" className="agri-dropdown-item">
                  <span style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}>
                    <Wheat width={14} height={14} style={{ color: "var(--agri-green)" }} /> Produits vivriers & récoltes
                  </span>
                </Link>
                <Link href="/elevage" className="agri-dropdown-item">
                  <span style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}>
                    <Bird width={14} height={14} style={{ color: "var(--agri-green)" }} /> Élevage & nutrition animale
                  </span>
                </Link>
                <Link href="/semences" className="agri-dropdown-item">
                  <span style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}>
                    <Sprout width={14} height={14} style={{ color: "var(--agri-green)" }} /> Semences & plants certifiés
                  </span>
                </Link>
                <Link href="/intrants" className="agri-dropdown-item">
                  <span style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}>
                    <FlaskConical width={14} height={14} style={{ color: "var(--agri-green)" }} /> Intrants & fertilisants
                  </span>
                </Link>
                <Link href="/materiel" className="agri-dropdown-item">
                  <span style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}>
                    <Tractor width={14} height={14} style={{ color: "var(--agri-green)" }} /> Matériel & équipements
                  </span>
                </Link>
                <Link href="/transformes" className="agri-dropdown-item">
                  <span style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}>
                    <Boxes width={14} height={14} style={{ color: "var(--agri-green)" }} /> Produits transformés locaux
                  </span>
                </Link>
                <div style={{ height: "1px", background: "#f1f5f9", margin: "4px 0" }} />
                <Link href="/catalogue" className="agri-dropdown-item" style={{ fontWeight: 700, color: "var(--agri-green)" }}>
                  Voir tout le catalogue →
                </Link>
              </div>
            </div>

            <div className="agri-nav-item">
              <Link href="/a-propos#filieres" className={`agri-nav-link ${["/vivriers", "/elevage", "/semences", "/intrants", "/materiel", "/transformes"].includes(pathname) ? "active" : ""}`}>
                Filières
                <ChevronRight width={13} height={13} style={{ transform: "rotate(90deg)" }} />
              </Link>
              <div className="agri-dropdown-menu">
                <Link href="/catalogue" className="agri-dropdown-item">
                  <span style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}>
                    <Sprout width={14} height={14} style={{ color: "var(--agri-green)" }} /> Découvrir les produits
                  </span>
                </Link>
                <Link href="/catalogue?filter=coops" className="agri-dropdown-item">
                  <span style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}>
                    <Building2 width={14} height={14} style={{ color: "var(--agri-green)" }} /> Produits des coopératives
                  </span>
                </Link>
                <Link href="/a-propos" className="agri-dropdown-item">
                  <span style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}>
                    <Wheat width={14} height={14} style={{ color: "var(--agri-green)" }} /> Nos filières agricoles
                  </span>
                </Link>
              </div>
            </div>

            <div className="agri-nav-item">
              <Link href="/services" className={`agri-nav-link ${pathname.startsWith("/services") ? "active" : ""}`}>
                Services
                <ChevronRight width={13} height={13} style={{ transform: "rotate(90deg)" }} />
              </Link>
              <div className="agri-dropdown-menu">
                <Link href="/services#transport" className="agri-dropdown-item">
                  <span style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}>
                    <Truck width={14} height={14} style={{ color: "var(--agri-green)" }} /> Transport & logistique rurale
                  </span>
                </Link>
                <Link href="/services#stockage" className="agri-dropdown-item">
                  <span style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}>
                    <Snowflake width={14} height={14} style={{ color: "var(--agri-green)" }} /> Silos & conservation frigorifique
                  </span>
                </Link>
                <Link href="/services#qualite" className="agri-dropdown-item">
                  <span style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}>
                    <ShieldCheck width={14} height={14} style={{ color: "var(--agri-green)" }} /> Contrôle sanitaire & qualité
                  </span>
                </Link>
                <Link href="/services#credit" className="agri-dropdown-item">
                  <span style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}>
                    <CreditCard width={14} height={14} style={{ color: "var(--agri-green)" }} /> Financement & facilités d'achat
                  </span>
                </Link>
              </div>
            </div>

            <div className="agri-nav-item">
              <Link href="/a-propos" className={`agri-nav-link ${pathname === "/a-propos" ? "active" : ""}`}>
                À propos
                <ChevronRight width={13} height={13} style={{ transform: "rotate(90deg)" }} />
              </Link>
              <div className="agri-dropdown-menu">
                <Link href="/a-propos" className="agri-dropdown-item">
                  <span style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}>
                    <BookOpen width={14} height={14} style={{ color: "var(--agri-green)" }} /> Qui sommes-nous ?
                  </span>
                </Link>
                <Link href="/a-propos#engagements" className="agri-dropdown-item">
                  <span style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}>
                    <Handshake width={14} height={14} style={{ color: "var(--agri-green)" }} /> Nos engagements filières
                  </span>
                </Link>
                <Link href="/blog" className="agri-dropdown-item">
                  <span style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}>
                    <BookOpen width={14} height={14} style={{ color: "var(--agri-green)" }} /> Conseils & Guides agronomiques
                  </span>
                </Link>
                <Link href="/faq" className="agri-dropdown-item">
                  <span style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}>
                    <HelpCircle width={14} height={14} style={{ color: "var(--agri-green)" }} /> Foire aux questions
                  </span>
                </Link>
              </div>
            </div>

            <div className="agri-nav-item">
              <Link href="/contact" className={`agri-nav-link ${pathname === "/contact" ? "active" : ""}`}>
                Contact
              </Link>
            </div>
          </nav>

          {/* Boutons d'action Droite */}
          <HeaderActionButtons 
            setShowLogoutModal={setShowLogoutModal} 
            isSearchOpen={isSearchOpen}
            setIsSearchOpen={setIsSearchOpen}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            handleSearchSubmit={handleSearchSubmit}
            searchResults={searchResults}
          />

          {/* Bouton Burger Mobile */}
          <button
            className="mobile-menu-toggle"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Menu"
            style={{ display: "none" }}
          >
            {isMobileMenuOpen ? <X width={24} /> : <Menu width={24} />}
          </button>
        </div>

        {/* Menu Mobile Tiroir */}
        {isMobileMenuOpen && (
          <div className="agri-mobile-drawer">
            <Link href="/" onClick={() => setIsMobileMenuOpen(false)}>Accueil</Link>
            <Link href="/catalogue" onClick={() => setIsMobileMenuOpen(false)}>Catalogue Complet</Link>
            <Link href="/a-propos#filieres" onClick={() => setIsMobileMenuOpen(false)}>Filières</Link>
            <Link href="/vivriers" onClick={() => setIsMobileMenuOpen(false)}>Vivriers & Récoltes</Link>
            <Link href="/elevage" onClick={() => setIsMobileMenuOpen(false)}>Élevage & Ferme</Link>
            <Link href="/semences" onClick={() => setIsMobileMenuOpen(false)}>Semences & Plants</Link>
            <Link href="/intrants" onClick={() => setIsMobileMenuOpen(false)}>Intrants & Fertilisants</Link>
            <Link href="/materiel" onClick={() => setIsMobileMenuOpen(false)}>Matériel & Équipements</Link>
            <Link href="/transformes" onClick={() => setIsMobileMenuOpen(false)}>Produits Transformés</Link>
            <Link href="/services" onClick={() => setIsMobileMenuOpen(false)}>Services agricoles</Link>
            <Link href="/a-propos" onClick={() => setIsMobileMenuOpen(false)}>À propos</Link>
            <Link href="/blog" onClick={() => setIsMobileMenuOpen(false)}>Conseils Agricoles</Link>
            <Link href="/faq" onClick={() => setIsMobileMenuOpen(false)}>FAQ</Link>
            <Link href="/contact" onClick={() => setIsMobileMenuOpen(false)}>Contact</Link>
          </div>
        )}
      </header>

      <LogoutModal isOpen={showLogoutModal} onClose={() => setShowLogoutModal(false)} />

      {/* Main Page Content */}
      <main className="site-main">{children}</main>

      <AgriMarketFooter mounted={mounted} />


      {/* Back To Top Floating Action Button */}
      {showBackToTop && (
        <button className="back-to-top-btn" onClick={scrollToTop} aria-label="Retour en haut">
          <ArrowUp width={18} height={18} />
        </button>
      )}
    </div>
  );
}
