import "./globals.css";
import Script from "next/script";
import { StoreProvider } from "@/lib/store";
import { SiteLayout } from "@/composants/SiteLayout";
import { PWAInstallBanner } from "@/composants/PWAInstallBanner";

const logo = "/logo/logo.png";

export const metadata = {
  title: { default: "AgriMarket", template: "%s — AgriMarket" },
  description: "Marketplace agropastorale du Cameroun — intrants, matériel, élevage, pisciculture et services ruraux.",
  keywords: ["AgriMarket", "agriculture", "Cameroun", "élevage", "intrants", "pisciculture", "services ruraux"],
  authors: [{ name: "AgriMarket" }],
  manifest: "/manifest.json",
  themeColor: "#1f7a3a",
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 5,
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "AgriMarket",
  },
  icons: {
    icon: logo,
    shortcut: logo,
    apple: logo,
  },
  openGraph: {
    type: "website",
    locale: "fr_CM",
    url: "https://agrimarket.cm",
    siteName: "AgriMarket",
    title: "AgriMarket — Marché agricole du Cameroun",
    description: "Acheter, vendre et gérer les besoins agricoles, d’élevage et de logistique rurale.",
    images: [{ url: logo, width: 512, height: 512, alt: "AgriMarket" }],
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <head>
        {/* PWA Meta Tags */}
        <link rel="manifest" href="/manifest.json" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="AgriMarket" />
        <link rel="apple-touch-icon" href="/logo/logo.png" />
        <meta name="msapplication-TileColor" content="#1f7a3a" />
        <meta name="msapplication-TileImage" content="/logo/logo.png" />
        {/* Google Fonts */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body>
        <StoreProvider>
          <SiteLayout>{children}</SiteLayout>
          {/* Bannière d'installation PWA personnalisée */}
          <PWAInstallBanner />
        </StoreProvider>
        {/* Service Worker Registration using Next.js Script component */}
        <Script
          id="pwa-sw-register"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              (() => {
                if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
                  const isProduction = window.location.hostname !== 'localhost' && !window.location.hostname.includes('127.0.0.1');

                  if (!isProduction) {
                    navigator.serviceWorker.getRegistrations().then(function(registrations) {
                      return Promise.all(registrations.map(function(registration) {
                        return registration.unregister();
                      }));
                    }).catch(function(err) {
                      console.warn('[PWA] Impossible de supprimer le service worker de dev :', err);
                    });
                    return;
                  }

                  window.addEventListener('load', function() {
                    navigator.serviceWorker.register('/sw.js')
                      .then(function(reg) {
                        console.log('[PWA] Service Worker enregistré :', reg.scope);
                      })
                      .catch(function(err) {
                        console.warn('[PWA] Service Worker échoué :', err);
                      });
                  });
                }
              })();
            `
          }}
        />
      </body>
    </html>
  );
}
