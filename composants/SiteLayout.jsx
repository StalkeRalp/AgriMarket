"use client";

import Link from "next/link";
import { ArrowRight, ArrowUp, Bell, ChevronLeft, ChevronRight, Heart, LockKeyhole, LogOut, Menu, Package, Phone, Search, ShieldCheck, ShoppingBag, Sparkles, Truck, User, UserRound, X } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
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
        <span>📍</span>
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
        <ChevronRight width={12} height={12} style={{ transform: "rotate(90deg)" }} />
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
          >
            <User width={16} height={16} />
            <span>{user.firstName || user.name || "Mon compte"}</span>
            <ChevronRight width={12} height={12} style={{ transform: "rotate(90deg)" }} />
          </button>

          {accountMenuOpen && (
            <div className="agri-account-menu" onClick={() => setAccountMenuOpen(false)}>
              <div className="agri-account-menu-header">
                <strong>{user.name || "Exploitant"}</strong>
                <small>{user.email || user.phone}</small>
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

  if (isAuthPage) {
    return <>{children}</>;
  }

  return (
    <div className="site-layout">
      {/* Topbar Verte Forêt avec Message Terroir et Raccourcis */}
      <div className="agri-topbar">
        <div className="agri-topbar-container">
          <div className="agri-topbar-message">
            <Sparkles width={13} height={13} style={{ color: "var(--agri-orange)" }} />
            <span>AgriMarket Cameroun — La place de marché agropastorale de référence • Du champ à votre table</span>
          </div>

          <div className="agri-topbar-links">
            <Link href="/suivi-commande"><Truck width={13} height={13} /> Suivi commande</Link>
            <Link href="/demande-produit">🌱 Devenir vendeur</Link>
            <Link href="/faq">FAQ</Link>
            <Link href="/contact"><Phone width={13} height={13} /> Contact (+237)</Link>
          </div>
        </div>
      </div>

      {/* Header Principal Conforme à la Maquette */}
      <header className="agri-site-header">
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
              <span className={`agri-nav-link ${pathname.startsWith("/catalogue") || ["/vivriers", "/elevage", "/semences", "/intrants", "/materiel", "/transformes"].includes(pathname) ? "active" : ""}`}>
                Catalogue
                <ChevronRight width={13} height={13} style={{ transform: "rotate(90deg)" }} />
              </span>
              <div className="agri-dropdown-menu">
                <Link href="/vivriers" className="agri-dropdown-item">🌾 Produits vivriers & récoltes</Link>
                <Link href="/elevage" className="agri-dropdown-item">🐔 Élevage & nutrition animale</Link>
                <Link href="/semences" className="agri-dropdown-item">🌱 Semences & plants certifiés</Link>
                <Link href="/intrants" className="agri-dropdown-item">🧪 Intrants & fertilisants</Link>
                <Link href="/materiel" className="agri-dropdown-item">🚜 Matériel & équipements</Link>
                <Link href="/transformes" className="agri-dropdown-item">🥫 Produits transformés locaux</Link>
                <div style={{ height: "1px", background: "#f1f5f9", margin: "4px 0" }} />
                <Link href="/catalogue" className="agri-dropdown-item" style={{ fontWeight: 700, color: "var(--agri-green)" }}>
                  Voir tout le catalogue →
                </Link>
              </div>
            </div>

            <div className="agri-nav-item">
              <span className="agri-nav-link">
                Vendeurs
                <ChevronRight width={13} height={13} style={{ transform: "rotate(90deg)" }} />
              </span>
              <div className="agri-dropdown-menu">
                <Link href="/demande-produit" className="agri-dropdown-item">🌱 Devenir vendeur partenaire</Link>
                <Link href="/catalogue?filter=coops" className="agri-dropdown-item">🏢 Coopératives & GIC agréés</Link>
                <Link href="/profil" className="agri-dropdown-item">📊 Espace exploitant / vendeur</Link>
              </div>
            </div>

            <div className="agri-nav-item">
              <span className="agri-nav-link">
                Services
                <ChevronRight width={13} height={13} style={{ transform: "rotate(90deg)" }} />
              </span>
              <div className="agri-dropdown-menu">
                <Link href="/services#transport" className="agri-dropdown-item">🚚 Transport & logistique rurale</Link>
                <Link href="/services#stockage" className="agri-dropdown-item">❄️ Silos & conservation frigorifique</Link>
                <Link href="/services#qualite" className="agri-dropdown-item">🛡️ Contrôle sanitaire & qualité</Link>
                <Link href="/services#credit" className="agri-dropdown-item">💳 Financement & facilités d'achat</Link>
              </div>
            </div>

            <div className="agri-nav-item">
              <span className={`agri-nav-link ${pathname === "/a-propos" ? "active" : ""}`}>
                À propos
                <ChevronRight width={13} height={13} style={{ transform: "rotate(90deg)" }} />
              </span>
              <div className="agri-dropdown-menu">
                <Link href="/a-propos" className="agri-dropdown-item">📖 Qui sommes-nous ?</Link>
                <Link href="/a-propos#engagements" className="agri-dropdown-item">🤝 Nos engagements filières</Link>
                <Link href="/blog" className="agri-dropdown-item">📚 Conseils & Guides agronomiques</Link>
                <Link href="/faq" className="agri-dropdown-item">❓ Foire aux questions</Link>
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
            <Link href="/vivriers" onClick={() => setIsMobileMenuOpen(false)}>Vivriers & Récoltes</Link>
            <Link href="/elevage" onClick={() => setIsMobileMenuOpen(false)}>Élevage & Ferme</Link>
            <Link href="/semences" onClick={() => setIsMobileMenuOpen(false)}>Semences & Plants</Link>
            <Link href="/intrants" onClick={() => setIsMobileMenuOpen(false)}>Intrants & Fertilisants</Link>
            <Link href="/materiel" onClick={() => setIsMobileMenuOpen(false)}>Matériel & Équipements</Link>
            <Link href="/transformes" onClick={() => setIsMobileMenuOpen(false)}>Produits Transformés</Link>
            <Link href="/demande-produit" onClick={() => setIsMobileMenuOpen(false)}>Devenir Vendeur</Link>
            <Link href="/blog" onClick={() => setIsMobileMenuOpen(false)}>Conseils Agricoles</Link>
            <Link href="/contact" onClick={() => setIsMobileMenuOpen(false)}>Contact</Link>
          </div>
        )}
      </header>

      <LogoutModal isOpen={showLogoutModal} onClose={() => setShowLogoutModal(false)} />

      {/* Main Page Content */}
      <main className="site-main">{children}</main>

      {/* Luxury Dior / Gucci Inspired Footer — rendu client-side uniquement (mounted guard)
          pour éviter définitivement les erreurs d'hydratation React dues aux extensions
          de traduction (Google Translate, DeepL...) qui modifient les text nodes après SSR. */}
      {mounted && (
        <footer className="fenty-style-footer">
          <div className="container footer-top-grid">
            <div className="footer-col-newsletter">
              <h3 className="footer-col-title">
                <span className="footer-eyebrow">AGRIMARKET — MARCHÉ AGRICOLE</span>
                Approvisionnez votre exploitation en confiance
              </h3>
              <p className="footer-desc-text">
                Recevez les dernières offres, conseils de production et solutions rurales sélectionnées pour l’agriculture, l’élevage, la pisciculture et le matériel agricole.
              </p>
              <form onSubmit={(e) => e.preventDefault()} className="footer-forms-stack">
                <div className="footer-input-box">
                  <input type="email" placeholder="Votre adresse e-mail" required />
                  <button type="submit" aria-label="Envoyer e-mail" title="S'abonner">
                    <ArrowRight width={15} height={15} />
                  </button>
                </div>
                <div className="footer-input-box">
                  <input type="tel" placeholder="Votre numéro WhatsApp (+237)" />
                  <button type="submit" aria-label="Envoyer téléphone" title="Rejoindre la communauté">
                    <ArrowRight width={15} height={15} />
                  </button>
                </div>
              </form>
              <p className="footer-disclaimer">
                En soumettant vos coordonnées, vous acceptez nos CGV et notre Politique de Confidentialité. Désinscription à tout moment.
              </p>
            </div>

            <div className="footer-col-links">
              <h4 className="footer-sub-title">CATÉGORIES AGRIPASTORALES</h4>
              <ul className="footer-menu-list">
                <li><Link href="/catalogue">Tous les produits</Link></li>
                <li><Link href="/vivriers">Vivriers & Récoltes</Link></li>
                <li><Link href="/elevage">Élevage & Animaux</Link></li>
                <li><Link href="/semences">Semences & Plants</Link></li>
                <li><Link href="/intrants">Intrants agricoles</Link></li>
                <li><Link href="/materiel">Matériel & Équipements</Link></li>
                <li><Link href="/transformes">Produits transformés</Link></li>
              </ul>
            </div>

            <div className="footer-col-links">
              <h4 className="footer-sub-title">ESPACE CLIENT</h4>
              <ul className="footer-menu-list">
                <li><Link href="/commandes">Mes commandes</Link></li>
                <li><Link href="/suivi-commande">Suivi de colis</Link></li>
                <li><Link href="/notifications">Notifications</Link></li>
                <li><Link href="/favoris">Produits favoris</Link></li>
                <li><Link href="/faq">Foire aux questions</Link></li>
                <li><Link href="/contact">Nous contacter</Link></li>
              </ul>
            </div>

            <div className="footer-col-links">
              <h4 className="footer-sub-title">ENGAGEMENTS AGRIMARKET</h4>
              <div className="footer-trust-list">
                <div className="footer-trust-item">
                  <ShieldCheck width={15} height={15} className="footer-trust-icon" />
                  <span>Produits vérifiés et fiables</span>
                </div>
                <div className="footer-trust-item">
                  <Truck width={15} height={15} className="footer-trust-icon" />
                  <span>Livraison rapide sur toute la zone</span>
                </div>
                <div className="footer-trust-item">
                  <LockKeyhole width={15} height={15} className="footer-trust-icon" />
                  <span>Paiement sécurisé MoMo, OM, CB</span>
                </div>
              </div>

              <div className="footer-brand-signature">
                <span className="footer-signature-label">AgriMarket Cameroun</span>
                <p className="footer-signature-sub">Des solutions agricoles pour chaque saison</p>
              </div>
            </div>
          </div>

          <div className="footer-divider-glow" />

          <div className="container footer-bottom-row">
            <p>© 2026 AGRIMARKET CAMEROUN — Tous droits réservés.</p>
            <div className="footer-legal-links">
              <Link href="/conditions">CGV</Link>
              <span className="footer-dot-sep">•</span>
              <Link href="/confidentialite">Confidentialité</Link>
              <span className="footer-dot-sep">•</span>
              <Link href="/a-propos">À Propos</Link>
            </div>
          </div>
        </footer>
      )}


      {/* Back To Top Floating Action Button */}
      {showBackToTop && (
        <button className="back-to-top-btn" onClick={scrollToTop} aria-label="Retour en haut">
          <ArrowUp width={18} height={18} />
        </button>
      )}
    </div>
  );
}
