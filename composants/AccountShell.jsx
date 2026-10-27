"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useStore } from "@/lib/store";
import { LogoutModal } from "@/composants/LogoutModal";

const buyerTabs = [
	{ href: "/compte", label: "Mon Compte" },
	{ href: "/profil", label: "Mon Profil & Paramètres" },
	{ href: "/achats", label: "Mes achats" },
	{ href: "/favoris", label: "Mes Favoris" },
	{ href: "/adresses", label: "Mes Adresses" },
	{ href: "/avis", label: "Mes Avis" },
];

const sellerTabs = [
	{ href: "/boutique", label: "Ma boutique" },
	{ href: "/produits", label: "Mes produits" },
	{ href: "/ventes", label: "Mes ventes" },
	{ href: "/finances", label: "Mes finances" },
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
	const tabs = [...buyerTabs, ...(isSeller ? sellerTabs : [{ href: "/boutique", label: "Ouvrir une boutique" }])];
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
		<main className="orders-page">
			{/* Luxury Breadcrumb matching Commandes/Blog */}
			<nav className="collection-breadcrumb container">
				<Link href="/">Accueil</Link>
				<span>/</span>
				<Link href="/compte">Mon Compte</Link>
				<span>/</span>
				<strong>{title}</strong>
			</nav>

			{/* Hero Header matching Commandes/Blog */}
			<header className="orders-hero container">
				<div className="orders-hero__inner">
					<span className="eyebrow">AGRI MARKET CAMEROUN</span>
					<h1>{title}</h1>
					<p>{description}</p>
				</div>
			</header>

			{/* Sub-Navigation Filter Tabs matching Commandes/Blog */}
			<div className="container">
				<div
					className="orders-filter-bar"
					style={{
						overflowX: "auto",
						flexWrap: "nowrap",
						whiteSpace: "nowrap",
					}}
				>
					{tabs.map((tab) => {
						const isActive = pathname === tab.href;
						return (
							<Link
								key={tab.href}
								href={tab.href}
								className={`orders-tab ${
									isActive ? "is-active" : ""
								}`}
							>
								{tab.label}
							</Link>
						);
					})}
					<button
						className="orders-tab"
						style={{ color: "#eb4d4b", marginLeft: "auto" }}
						onClick={() => setShowLogoutModal(true)}
					>
						Déconnexion
					</button>
				</div>

				{/* Content Body */}
				<div>{children}</div>
			</div>

			{/* Logout Confirmation Modal */}
			<LogoutModal
				isOpen={showLogoutModal}
				onClose={() => setShowLogoutModal(false)}
			/>
		</main>
	);
}
