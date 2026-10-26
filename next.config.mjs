const nextConfig = {
  reactStrictMode: true,
  async redirects() {
    return [
      { source: "/product.html", has: [{ type: "query", key: "id", value: "(?<id>[^&]+)" }], destination: "/produit/:id", permanent: true },
      { source: "/article.html", has: [{ type: "query", key: "id", value: "(?<id>[^&]+)" }], destination: "/blog/:id", permanent: true },
      { source: "/confirmation.html", has: [{ type: "query", key: "id", value: "(?<id>[^&]+)" }], destination: "/confirmation/:id", permanent: true },
      { source: "/order.html", has: [{ type: "query", key: "id", value: "(?<id>[^&]+)" }], destination: "/commandes/:id", permanent: true },
      { source: "/index.html", destination: "/", permanent: true },
      { source: "/catalogue.html", destination: "/catalogue", permanent: true },
      { source: "/new-arrivals.html", destination: "/nouveautes", permanent: true },
      { source: "/product.html", destination: "/catalogue", permanent: false },
      { source: "/cart.html", destination: "/panier", permanent: true },
      { source: "/checkout.html", destination: "/commande", permanent: true },
      { source: "/login.html", destination: "/connexion", permanent: true },
      { source: "/register.html", destination: "/inscription", permanent: true },
      { source: "/wishlist.html", destination: "/favoris", permanent: true },
      { source: "/brands.html", destination: "/marques", permanent: true },
      { source: "/promotions.html", destination: "/promotions", permanent: true },
      { source: "/blog.html", destination: "/blog", permanent: true },
      { source: "/faq.html", destination: "/faq", permanent: true },
      { source: "/contact.html", destination: "/contact", permanent: true }
      ,{ source: "/about.html", destination: "/a-propos", permanent: true }
      ,{ source: "/account.html", destination: "/compte", permanent: true }
      ,{ source: "/addresses.html", destination: "/adresses", permanent: true }
      ,{ source: "/article.html", destination: "/blog", permanent: false }
      ,{ source: "/confirmation.html", destination: "/commandes", permanent: false }
      ,{ source: "/order.html", destination: "/commandes", permanent: false }
      ,{ source: "/orders.html", destination: "/commandes", permanent: true }
      ,{ source: "/payments.html", destination: "/paiements", permanent: true }
      ,{ source: "/privacy.html", destination: "/confidentialite", permanent: true }
      ,{ source: "/product-request.html", destination: "/demande-produit", permanent: true }
      ,{ source: "/returns.html", destination: "/retours", permanent: true }
      ,{ source: "/reviews.html", destination: "/avis", permanent: true }
      ,{ source: "/shipping.html", destination: "/livraison", permanent: true }
      ,{ source: "/terms.html", destination: "/conditions", permanent: true }
      ,{ source: "/track-order.html", destination: "/suivi-commande", permanent: true }
    ];
  }
};

export default nextConfig;
