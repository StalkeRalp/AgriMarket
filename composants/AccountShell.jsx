"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useStore } from "@/lib/store";
import { LogoutModal } from "@/composants/LogoutModal";
import { Activity, Box, ChevronRight, CircleHelp, LayoutDashboard, LogOut, MapPin, PackageCheck, Settings2, Store, Truck, UserRound, WalletCards } from "lucide-react";

const buyerTabs = [
	{ href: "/compte", label: "Vue d’ensemble", icon: LayoutDashboard },
	{ href: "/achats", label: "Mes achats", icon: PackageCheck },
	{ href: "/historique-livraisons", label: "Mes livraisons", icon: Truck },
	{ href: "/adresses", label: "Mes adresses", icon: MapPin },
	{ href: "/avis", label: "Mes avis", icon: CircleHelp },
];

const sellerTabs = [
	{ href: "/boutique", label: "Ma boutique", icon: Store },
	{ href: "/produits", label: "Mes produits", icon: Box },
	{ href: "/ventes", label: "Mes ventes", icon: Activity },
	{ href: "/finances", label: "Finances", icon: WalletCards },
];

export function AccountShell({
	children,
	authRequired = true,
	title = "Mon Profil & Paramètres",
	description =
		"Modifiez vos informations personnelles, votre activité agricole et vos préférences de sécurité et notifications.",
}) {
	const pathname = usePathname();
	const router = useRouter();
	const { user, hydrated } = useStore();
	const isSeller = Boolean(user?.isSeller || user?.sellerProfile || user?.roles?.includes("SELLER") || user?.role === "SELLER");
	const displayName = user?.firstName || user?.name?.split(" ")[0] || "Visiteur";
	const [showLogoutModal, setShowLogoutModal] = useState(false);

	useEffect(() => {
		if (authRequired && hydrated && !user) {
			router.push("/connexion");
		}
	}, [authRequired, user, hydrated, router]);

	if (!hydrated) {
		return (
			<div
				className="orders-page"
				style={{
					minHeight: "50vh",
					display: "grid",
					placeItems: "center",
				}}
			>
				<p style={{ color: "#6a625a", fontSize: "15px" }}>
					Chargement de votre session...
				</p>
			</div>
		);
	}

	if (authRequired && !user) return null;

	return (
		<main className="orders-page account-premium-page">
			<div className="account-premium-frame container">
			<nav className="collection-breadcrumb account-premium-breadcrumb">
				<Link href="/">Accueil</Link>
				<ChevronRight aria-hidden="true" />
				<Link href="/compte">Mon Compte</Link>
				<ChevronRight aria-hidden="true" />
				<strong>{title}</strong>
			</nav>
			<div className="account-premium-grid">
				<aside className="account-premium-sidebar" aria-label="Navigation de l’espace personnel">
					<div className="account-premium-user">
						<span className="account-premium-avatar">{displayName.slice(0, 1).toUpperCase()}</span>
						<div><strong>{user?.name || user?.firstName || "Mon espace"}</strong><span>{isSeller ? "Espace acheteur et vendeur" : user ? "Espace acheteur" : "Navigation de l’espace"}</span></div>
					</div>
					<nav className="account-premium-nav">
						<p className="account-premium-nav-label">MON ESPACE</p>
						{buyerTabs.map((tab) => {
							const Icon = tab.icon;
							return <Link key={tab.href} href={tab.href} className={pathname === tab.href ? "is-active" : ""} aria-current={pathname === tab.href ? "page" : undefined}><Icon aria-hidden="true"/><span>{tab.label}</span><ChevronRight aria-hidden="true" className="account-premium-nav-arrow"/></Link>;
						})}
						<p className="account-premium-nav-label account-premium-nav-label--seller">{isSeller ? "MON ACTIVITÉ VENDEUR" : "DÉVELOPPER MON ACTIVITÉ"}</p>
						{(isSeller ? sellerTabs : [{ href: "/boutique", label: "Créer ma boutique", icon: Store }]).map((tab) => {
							const Icon = tab.icon;
							return <Link key={tab.href} href={tab.href} className={pathname === tab.href ? "is-active" : ""} aria-current={pathname === tab.href ? "page" : undefined}><Icon aria-hidden="true"/><span>{tab.label}</span><ChevronRight aria-hidden="true" className="account-premium-nav-arrow"/></Link>;
						})}
						<Link href="/profil" className="account-premium-settings"><Settings2 aria-hidden="true"/><span>Profil & paramètres</span></Link>
						{user && <button type="button" className="account-premium-logout" onClick={() => setShowLogoutModal(true)}><LogOut aria-hidden="true"/><span>Déconnexion</span></button>}
					</nav>
					<div className="account-premium-help"><span><UserRound aria-hidden="true"/></span><div><strong>Besoin d’aide ?</strong><Link href="/contact">Contacter AgriMarket <ChevronRight aria-hidden="true"/></Link></div></div>
				</aside>
				<section className="account-premium-main">
					<header className="account-premium-heading"><div><span className="eyebrow">ESPACE PERSONNEL · AGRIMARKET</span><h1>{title}</h1><p>{description}</p></div><div className="account-premium-heading-user"><span>{displayName.slice(0, 1).toUpperCase()}</span><div><strong>{displayName}</strong><small>{isSeller ? "Acheteur · Vendeur" : user ? "Acheteur" : "Mode invité"}</small></div></div></header>
					<div className="account-premium-content">{children}</div>
				</section>
			</div>
			</div>

			{/* Logout Confirmation Modal */}
			<LogoutModal
				isOpen={showLogoutModal}
				onClose={() => setShowLogoutModal(false)}
			/>
		</main>
	);
}
