"use client";

import { 
  ArrowRight, 
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
  LayoutDashboard,
  Mail,
  LogOut, 
  MapPin,
  Menu, 
  MessageCircle,
  Package, 
  Phone,
  Search, 
  ShieldCheck, 
  ShoppingBag, 
  Smartphone,
  Snowflake,
  Sprout,
  Tractor,
  Truck, 
  User, 
  Wheat,
  X
} from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";

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

      {mounted && user && (
        <a href="/compte" className="agri-icon-btn mypage-header-link" aria-label="Ouvrir mon espace personnel" title="Mon espace personnel">
          <LayoutDashboard width={18} height={18} />
        </a>
      )}

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
              <a href="/compte" className="agri-account-menu-item">
                <User width={14} height={14} /> Mon espace personnel
              </a>
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
      <div className="agri-footer-shell">
        <div className="agri-footer-grid">
          <section className="agri-footer-brand-block">
            <Link href="/" className="agri-footer-logo" aria-label="AgriMarket, accueil">
              <img src="/logo/logo1.png" alt="AgriMarket — Du champ à votre table" />
            </Link>
            <p className="agri-footer-description">Des produits agricoles de qualité, des producteurs locaux et un marché plus proche de votre quotidien.</p>
            <h3 className="agri-footer-social-title">Suivez AgriMarket</h3>
            <div className="agri-footer-social-icons">
              <a href="https://facebook.com" target="_blank" rel="noreferrer" aria-label="AgriMarket sur Facebook"><img src="/icones/facebook.jpeg" alt="" /></a>
              <a href="https://instagram.com" target="_blank" rel="noreferrer" aria-label="AgriMarket sur Instagram"><img src="/icones/instagram.jpeg" alt="" /></a>
              <a href="https://youtube.com" target="_blank" rel="noreferrer" aria-label="AgriMarket sur YouTube"><img src="/icones/youtube.jpeg" alt="" /></a>
              <a href="https://tiktok.com" target="_blank" rel="noreferrer" aria-label="AgriMarket sur TikTok"><img src="/icones/TIKTOK.jpeg" alt="" /></a>
              <a href="https://wa.me/237670000000" target="_blank" rel="noreferrer" aria-label="Contacter AgriMarket sur WhatsApp"><img src="/icones/whatsApp.jpeg" alt="" /></a>
            </div>
          </section>

          <nav className="agri-footer-column" aria-label="Liens rapides">
            <h2>Liens rapides</h2>
            <ul><li><Link href="/">Accueil</Link></li><li><Link href="/catalogue">Nos produits</Link></li><li><Link href="/services">Services</Link></li><li><Link href="/a-propos">À propos</Link></li><li><Link href="/faq">FAQ</Link></li><li><Link href="/contact">Contact</Link></li></ul>
          </nav>

          <nav className="agri-footer-column" aria-label="Catégories de produits">
            <h2>Catégories</h2>
            <ul>
              <li><Link href="/vivriers"><Sprout />Produits vivriers</Link></li>
              <li><Link href="/elevage"><Bird />Élevage</Link></li>
              <li><Link href="/semences"><Wheat />Semences & plants</Link></li>
              <li><Link href="/intrants"><FlaskConical />Intrants agricoles</Link></li>
              <li><Link href="/materiel"><Tractor />Matériel agricole</Link></li>
              <li><Link href="/transformes"><Package />Produits transformés</Link></li>
            </ul>
          </nav>

          <section className="agri-footer-column agri-footer-contact-column">
            <h2>Contactez-nous</h2>
            <ul>
              <li><span className="agri-footer-contact-icon"><MapPin /></span><span>Yaoundé, Cameroun<small>Au service des filières locales</small></span></li>
              <li><span className="agri-footer-contact-icon"><Phone /></span><a href="tel:+237670000000">+237 670 000 000<small>Lun – Sam, 8h – 18h</small></a></li>
              <li><span className="agri-footer-contact-icon"><MessageCircle /></span><a href="https://wa.me/237670000000" target="_blank" rel="noreferrer">WhatsApp<small>Écrivez à notre équipe</small></a></li>
              <li><span className="agri-footer-contact-icon"><Mail /></span><a href="mailto:support@agrimarket.cm">support@agrimarket.cm<small>Réponse sous 24h</small></a></li>
            </ul>
          </section>

          <section className="agri-footer-column agri-footer-app-column">
            <h2>AgriMarket partout avec vous</h2>
            <p>Retrouvez les produits, vos commandes et les services agricoles depuis votre téléphone.</p>
            <button type="button" className="agri-footer-app-link" onClick={() => window.dispatchEvent(new Event("agrimarket:request-install"))}>
              <Smartphone /><span>Installer l’application<small>Ajouter AgriMarket à votre téléphone</small></span><ArrowRight />
            </button>
          </section>
        </div>

        <div className="agri-footer-bottom">
          <p>© {new Date().getFullYear()} AgriMarket Cameroun. Tous droits réservés.</p>
          <div className="agri-footer-bottom-mark" aria-hidden="true"><span /><Sprout /><span /></div>
          <nav className="agri-footer-legal" aria-label="Informations légales"><Link href="/conditions">Conditions d’utilisation</Link><Link href="/confidentialite">Confidentialité</Link><Link href="/a-propos">À propos</Link></nav>
        </div>
      </div>
    </footer>
  );
}

export function SiteLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const { products, user } = useStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [routeLoading, setRouteLoading] = useState("idle");
  const routeLoadingTimer = useRef(null);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => { setIsMobileMenuOpen(false); }, [pathname]);

  useEffect(() => {
    const startNavigation = event => {
      if (event.defaultPrevented || (event.button !== undefined && event.button !== 0) || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const anchor = event.target instanceof Element ? event.target.closest("a[href]") : null;
      if (!anchor || anchor.target === "_blank" || anchor.hasAttribute("download")) return;
      const destination = new URL(anchor.href, window.location.href);
      const current = new URL(window.location.href);
      if (destination.origin !== current.origin || (destination.pathname === current.pathname && destination.search === current.search)) return;
      setRouteLoading("loading");
      window.clearTimeout(routeLoadingTimer.current);
      routeLoadingTimer.current = window.setTimeout(() => setRouteLoading("idle"), 10000);
    };
    const startHistoryNavigation = () => {
      setRouteLoading("loading");
      window.clearTimeout(routeLoadingTimer.current);
      routeLoadingTimer.current = window.setTimeout(() => setRouteLoading("idle"), 10000);
    };
    document.addEventListener("click", startNavigation, true);
    window.addEventListener("popstate", startHistoryNavigation);
    return () => {
      document.removeEventListener("click", startNavigation, true);
      window.removeEventListener("popstate", startHistoryNavigation);
      window.clearTimeout(routeLoadingTimer.current);
    };
  }, []);

  useEffect(() => {
    if (routeLoading === "idle") return;
    setRouteLoading("complete");
    window.clearTimeout(routeLoadingTimer.current);
    routeLoadingTimer.current = window.setTimeout(() => setRouteLoading("idle"), 280);
    return () => window.clearTimeout(routeLoadingTimer.current);
  }, [pathname]);

  const handleSearchSubmit = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/catalogue?q=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchOpen(false);
    }
  };

  const searchResults = searchQuery.trim().length >= 2 && products
    ? products.filter(p => !["archived", "suspended", "pending", "draft"].includes(String(p.status || "").toLowerCase()) && (
        p.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.brand?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category?.toLowerCase().includes(searchQuery.toLowerCase())
      )).slice(0, 5)
    : [];

  const isAuthPage = ["/inscription", "/connexion", "/mot-de-passe-oublie", "/reinitialisation-mot-de-passe", "/verification-otp"].includes(pathname);
  const isHome = pathname === "/";
  const isContact = pathname === "/contact";

  if (isAuthPage) {
    return <><RouteLoadingIndicator status={routeLoading} />{children}<AgriMarketFooter mounted={mounted} /></>;
  }

  return (
    <div className={`site-layout ${isHome ? "is-home-layout" : ""} ${isContact ? "is-contact-layout" : ""}`}>
      <RouteLoadingIndicator status={routeLoading} />
      {/* Navigation principale, directement au sommet de la page */}
      <header className={`agri-site-header ${isHome ? "is-home-glass" : ""}`}>
        <div className="agri-header-container">
          {/* Logo AgriMarket */}
          <div className="agri-header-brand-group">
            <Link href="/" className="agri-header-logo">
              <img src="/logo/logo1.png" alt="AgriMarket — Du champ à votre table" />
              <div className="agri-logo-tagline">
                <strong>AgriMarket</strong>
                <span>Du champ à votre table</span>
              </div>
            </Link>
            {!isHome && <PageDirectionButtons router={router} placement="header" />}
          </div>

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
            {mounted && user && <div className="agri-nav-item">
              <a href="/compte" className={`agri-nav-link ${pathname.startsWith("/compte") || ["/profil", "/boutique", "/produits", "/ventes", "/finances", "/achats"].includes(pathname) ? "active" : ""}`}>
                Mon espace
              </a>
            </div>}
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
            aria-label={isMobileMenuOpen ? "Fermer le menu" : "Ouvrir le menu"}
            aria-expanded={isMobileMenuOpen}
            aria-controls="agri-mobile-navigation"
            style={{ display: "none" }}
          >
            {isMobileMenuOpen ? <X width={24} /> : <Menu width={24} />}
          </button>
        </div>

        {/* Menu Mobile Tiroir */}
        {isMobileMenuOpen && (
          <nav className="agri-mobile-drawer" id="agri-mobile-navigation" aria-label="Navigation mobile">
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
            <a href={mounted && user ? "/compte" : "/connexion"} onClick={() => setIsMobileMenuOpen(false)}>{mounted && user ? "Mon espace personnel" : "Mon compte"}</a>
          </nav>
        )}
      </header>

      <LogoutModal isOpen={showLogoutModal} onClose={() => setShowLogoutModal(false)} />

      {/* Main Page Content */}
      <main className="site-main">{children}</main>

      <AgriMarketFooter mounted={mounted} />


    </div>
  );
}

function PageDirectionButtons({ router, placement = "floating" }) {
  const goBack = () => {
    if (typeof window !== "undefined" && window.history.length > 1) router.back();
    else router.push("/");
  };

  return (
    <nav className={`page-direction-controls ${placement === "header" ? "is-header-controls" : ""}`} aria-label="Navigation entre les pages">
      <button type="button" onClick={goBack} aria-label="Revenir à la page précédente" title="Page précédente">
        <ChevronLeft width={19} height={19} />
      </button>
      <button type="button" onClick={() => router.forward()} aria-label="Avancer vers la page suivante" title="Page suivante">
        <ChevronRight width={19} height={19} />
      </button>
    </nav>
  );
}

function RouteLoadingIndicator({ status }) {
  if (status === "idle") return null;
  return <div className={`site-route-progress is-${status}`} role="status" aria-label={status === "complete" ? "Page chargée" : "Chargement de la page"}><span /></div>;
}
