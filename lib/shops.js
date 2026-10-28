export function shopSlug(value = "") {
  return String(value).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

const isVisibleProduct = product => !["archived", "suspended", "pending", "draft"].includes(String(product?.status || "").toLowerCase());

export function getPublicShops(users = [], products = []) {
  const shops = new Map();
  (Array.isArray(users) ? users : []).forEach(user => {
    const profile = user?.sellerProfile;
    if (!profile?.shopName || ["suspended", "pending", "rejected"].includes(user.sellerStatus)) return;
    shops.set(String(user.id), {
      id: String(user.id),
      slug: shopSlug(profile.shopName),
      name: profile.shopName,
      description: profile.description || "Découvrez les produits de cette boutique agropastorale.",
      city: profile.city || user.city || "",
      region: profile.region || user.region || "",
      phone: profile.phone || user.phone || "",
      email: profile.email || user.email || "",
      photo: profile.profilePhoto || "",
      bannerPhoto: profile.bannerPhoto || "",
      products: [],
    });
  });

  (Array.isArray(products) ? products : []).filter(isVisibleProduct).forEach(product => {
    const id = String(product.sellerId || shopSlug(product.brand || "producteur-local"));
    let shop = shops.get(id);
    if (!shop) {
      const name = product.brand || "Producteur AgriMarket";
      shop = {
        id,
        slug: shopSlug(name),
        name,
        description: "Parcourez les offres publiées par ce vendeur sur AgriMarket.",
        city: product.city || product.location || "",
        region: product.region || "",
        phone: "",
        email: "",
        photo: "",
        bannerPhoto: "",
        products: [],
      };
      shops.set(id, shop);
    }
    shop.products.push(product);
    if (!shop.city) shop.city = product.city || product.location || "";
  });

  return [...shops.values()].sort((a,b)=>a.name.localeCompare(b.name,"fr"));
}
