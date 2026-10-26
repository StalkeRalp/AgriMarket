export const AGRI_MARKET = {
  name: "AgriMarket",
  shortName: "AM",
  region: "Cameroun",
  currency: "XAF",
  currencySymbol: "FCFA",
  slogan: "Le marché agricole digital du Cameroun",
  description: "Marketplace agropastorale dédiée à la commercialisation des récoltes, du bétail, des intrants, des semences et des équipements au Cameroun.",
  supportEmail: "contact@agrimarket.cm",
  supportPhone: "+237 6 00 00 00 00",
};

/**
 * Catégories officielles issues du Cahier des Charges AgriMarket V1.0 (Section 5)
 */
export const AGRI_CATEGORIES = [
  {
    id: "cat-vivriers",
    slug: "vivriers",
    name: "Produits vivriers et agricoles",
    shortName: "Vivriers & Récoltes",
    description: "Céréales, tubercules, légumineuses, fruits et légumes frais des terroirs camerounais.",
    icon: "Wheat",
    image: "https://images.pexels.com/photos/162809/pexels-photo-162809.jpeg?auto=compress&w=900",
    subcategories: [
      "Céréales (maïs, riz, mil, sorgho)",
      "Tubercules et racines (manioc, macabo, igname, patate douce)",
      "Légumineuses (haricots, soja, niébé, arachides)",
      "Fruits (banane, plantain, mangue, avocat, ananas)",
      "Légumes (tomate, oignon, piment, gombo, légumes-feuilles)"
    ]
  },
  {
    id: "cat-elevage",
    slug: "elevage",
    name: "Élevage et produits animaux",
    shortName: "Élevage & Animaux",
    description: "Volailles, bétail, petits ruminants, porcins, alimentation animale et produits de la ferme.",
    icon: "PawPrint",
    image: "https://images.pexels.com/photos/247431/pexels-photo-247431.jpeg?auto=compress&w=900",
    subcategories: [
      "Volailles (poulets de chair, pondeuses, poussins)",
      "Bétail et ruminants (chèvres, moutons, porcs, bovins)",
      "Aliments et nutrition animale",
      "Produits de la ferme (œufs frais, miel, lait)"
    ]
  },
  {
    id: "cat-semences",
    slug: "semences",
    name: "Semences, plants et pépinières",
    shortName: "Semences & Plants",
    description: "Semences certifiées, plants maraîchers, rejets de bananiers-plantains et pépinières fruitières.",
    icon: "Sprout",
    image: "https://images.pexels.com/photos/1054658/pexels-photo-1054658.jpeg?auto=compress&w=900",
    subcategories: [
      "Semences vivrières et maraîchères certifiées",
      "Rejets de plantain et boutures sélectionnées",
      "Plants d'arbres fruitiers et pépinières"
    ]
  },
  {
    id: "cat-intrants",
    slug: "intrants",
    name: "Intrants agricoles",
    shortName: "Intrants & Fertilisants",
    description: "Engrais minéraux, amendements organiques, composts et solutions phytosanitaires homologuées.",
    icon: "Layers",
    image: "https://images.pexels.com/photos/2132250/pexels-photo-2132250.jpeg?auto=compress&w=900",
    subcategories: [
      "Engrais minéraux (NPK, Urée)",
      "Fertilisants bio, compost et fientes",
      "Traitements phytosanitaires homologués"
    ]
  },
  {
    id: "cat-materiel",
    slug: "materiel",
    name: "Matériel et équipements",
    shortName: "Matériel & Outils",
    description: "Outillage manuel, pulvérisateurs, motopompes, irrigation et équipements agricoles.",
    icon: "Wrench",
    image: "https://images.pexels.com/photos/2252584/pexels-photo-2252584.jpeg?auto=compress&w=900",
    subcategories: [
      "Outillage manuel et de récolte",
      "Systèmes d'irrigation, tuyaux et motopompes",
      "Équipements d'élevage et de transformation"
    ]
  },
  {
    id: "cat-transformes",
    slug: "transformes",
    name: "Produits transformés",
    shortName: "Produits transformés",
    description: "Farines locales, huiles végétales de palme et d'arachide, séchage et conserves artisanales.",
    icon: "PackageCheck",
    image: "https://images.pexels.com/photos/4158/field-sunset-harvest.jpg?auto=compress&w=900",
    subcategories: [
      "Farines locales (manioc, maïs, patate douce)",
      "Huiles végétales pures (palme raffinée, arachide)",
      "Produits séchés et condiments artisanaux"
    ]
  }
];

export const AGRI_UNITS = [
  { value: "kg", label: "Kilogramme (kg)" },
  { value: "sac_50kg", label: "Sac de 50 kg" },
  { value: "sac_100kg", label: "Sac de 100 kg" },
  { value: "tonne", label: "Tonne" },
  { value: "regime", label: "Régime" },
  { value: "cageot", label: "Cageot" },
  { value: "panier", label: "Panier" },
  { value: "litre", label: "Litre (L)" },
  { value: "carton", label: "Carton" },
  { value: "piece", label: "Pièce" },
  { value: "alvéole", label: "Alvéole (30 œufs)" },
  { value: "seau", label: "Seau de 15L" }
];

export const CAMEROON_REGIONS = [
  "Adamaoua",
  "Centre",
  "Est",
  "Extrême-Nord",
  "Littoral",
  "Nord",
  "Nord-Ouest",
  "Ouest",
  "Sud",
  "Sud-Ouest"
];

export const AGRI_BRANDS = [
  { id: "brand-foumbot", name: "Coopérative Maraîchère de Foumbot", location: "Foumbot (Ouest)" },
  { id: "brand-obala", name: "GIC Vivrier d'Obala", location: "Obala (Centre)" },
  { id: "brand-bafoussam", name: "Ferme Avicole des Hauts Plateaux", location: "Bafoussam (Ouest)" },
  { id: "brand-agricam", name: "AgriCam Intrants & Fertilisants", location: "Douala (Littoral)" },
  { id: "brand-nordagro", name: "Céréales & Légumineuses du Nord", location: "Garoua (Nord)" },
  { id: "brand-terroirbio", name: "Transformation Bio Cameroun", location: "Yaoundé (Centre)" }
];

export const AGRI_DEFAULT_USERS = [
  {
    id: "u-admin-agrimarket",
    firstName: "Admin",
    lastName: "AgriMarket",
    email: "admin@agrimarket.cm",
    phone: "+237 600 000 000",
    role: "ADMIN",
    password: "admin123",
  },
  {
    id: "u-vendeur-foumbot",
    firstName: "Jean",
    lastName: "Njoya",
    email: "vendeur@foumbot-coop.cm",
    phone: "+237 677 112 233",
    role: "CLIENT",
    isSeller: true,
    sellerProfile: {
      shopName: "Coopérative Maraîchère de Foumbot",
      city: "Foumbot",
      region: "Ouest",
      description: "Producteur de tomates fraîches, oignons, piments et légumes de saison en direct des exploitations de Foumbot.",
      phone: "+237 677 112 233"
    },
    password: "vendeur123",
  },
  {
    id: "u-demo-agrimarket",
    firstName: "Acheteur",
    lastName: "AgriMarket",
    email: "acheteur@agrimarket.cm",
    phone: "+237 699 000 000",
    role: "CLIENT",
    isSeller: false,
    password: "demo123",
  },
];
