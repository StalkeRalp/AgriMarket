"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { AccountShell } from "@/composants/AccountShell";
import { useStore } from "@/lib/store";
import { money, dateFr } from "@/lib/format";
import { ArrowRight, BadgeCheck, Banknote, Box, Camera, Check, CircleAlert, Clock3, ImagePlus, Package, Plus, Store, TrendingUp, Truck } from "lucide-react";

const isSeller = user => Boolean(user?.isSeller || user?.sellerProfile || user?.roles?.includes("SELLER") || user?.role === "SELLER");
const itemProductId = item => item?.productId || item?.id;
const titleMap = {
  shop: ["Ma boutique", "Présentez votre activité et gérez les informations visibles par vos clients."],
  products: ["Mes produits", "Créez, mettez à jour ou archivez les offres de votre boutique."],
  sales: ["Mes ventes", "Retrouvez les commandes qui contiennent vos produits et mettez à jour leur préparation."],
  finances: ["Mes finances", "Suivez les montants associés à vos ventes et leur état de traitement."],
  purchases: ["Mes achats", "Consultez les commandes passées depuis votre compte."],
};
const unitsByCategory = {
  "Produits vivriers et agricoles": ["kg", "g", "tonne", "sac de 25 kg", "sac de 50 kg", "caisse", "cageot", "filet", "panier", "tas", "botte", "régime", "pièce", "douzaine", "seau", "litre"],
  "Élevage et produits animaux": ["animal", "tête", "kg", "carcasse", "pièce", "cage", "plateau", "plateau de 30", "douzaine", "œuf", "litre", "sac", "carton"],
  "Semences, plants et pépinières": ["g", "kg", "sachet", "boîte", "dose", "plant", "pied", "plateau", "alvéole", "bac", "lot", "pièce"],
  "Intrants agricoles": ["sac de 25 kg", "sac de 50 kg", "kg", "tonne", "litre", "bidon de 1 L", "bidon de 5 L", "bidon de 20 L", "flacon", "sachet", "carton", "dose", "rouleau"],
  "Matériel et équipements": ["pièce", "kit", "lot", "paire", "set", "rouleau", "mètre", "journée", "heure"],
  "Produits transformés": ["g", "kg", "sachet", "paquet", "boîte", "bocal", "bouteille", "bidon", "litre", "sac", "carton", "douzaine", "pièce"],
};
const eligibleOrganizationTypes = ["cooperative", "association", "enterprise", "merchant"];
const productSteps = [
  { number: 1, title: "Produit", caption: "Description de l’offre" },
  { number: 2, title: "Prix & stock", caption: "Conditions de vente" },
  { number: 3, title: "Photos & promo", caption: "Visuels et options" },
];

function compressProductImage(file) {
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      const maxSide = 1600;
      const scale = Math.min(1, maxSide / Math.max(image.width, image.height));
      const canvas = document.createElement("canvas");
      canvas.width = Math.max(1, Math.round(image.width * scale));
      canvas.height = Math.max(1, Math.round(image.height * scale));
      canvas.getContext("2d").drawImage(image, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(objectUrl);
      resolve(canvas.toDataURL("image/jpeg", 0.8));
    };
    image.onerror = () => { URL.revokeObjectURL(objectUrl); reject(new Error(`Impossible de lire l’image ${file.name}.`)); };
    image.src = objectUrl;
  });
}

function compressShopPhoto(file, maxSize = 640) {
  return new Promise((resolve,reject)=>{
    if (!file?.type?.startsWith("image/")) return reject(new Error("Choisissez un fichier image."));
    const source = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      const size = maxSize;
      const scale = Math.min(1,size/Math.max(image.width,image.height));
      const canvas = document.createElement("canvas");
      canvas.width = Math.max(1,Math.round(image.width*scale));
      canvas.height = Math.max(1,Math.round(image.height*scale));
      const context = canvas.getContext("2d");
      if (!context) { URL.revokeObjectURL(source); return reject(new Error("Impossible de préparer cette photo.")); }
      context.drawImage(image,0,0,canvas.width,canvas.height);
      URL.revokeObjectURL(source);
      resolve(canvas.toDataURL("image/jpeg",0.78));
    };
    image.onerror = () => { URL.revokeObjectURL(source); reject(new Error("Impossible de lire cette image.")); };
    image.src = source;
  });
}

export default function MyPageWorkspace({ section }) {
  const { user, products, orders, saveSellerProfile, saveSellerProduct, archiveSellerProduct, updateSellerOrderStatus } = useStore();
  const seller = isSeller(user);
  const eligibleSeller = seller && eligibleOrganizationTypes.includes(user?.sellerProfile?.organizationType);
  const ownedProducts = useMemo(() => products.filter(product => product.sellerId === user?.id), [products, user?.id]);
  const ownProductIds = useMemo(() => new Set(ownedProducts.map(product => product.id)), [ownedProducts]);
  const sales = useMemo(() => orders.map(order => {
    const items = (order.items || []).filter(item => ownProductIds.has(itemProductId(item)));
    const sellerState = order.sellerStatuses?.[user?.id];
    return items.length ? { ...order, ...(sellerState ? { status: sellerState.status, statusCode: sellerState.statusCode } : {}), sellerItems: items, sellerSubtotal: items.reduce((sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 0), 0) } : null;
  }).filter(Boolean), [orders, ownProductIds]);
  const purchases = useMemo(() => orders.filter(order => (order.customer?.email || order.email || "").toLowerCase() === (user?.email || "").toLowerCase()), [orders, user?.email]);
  const [shopForm, setShopForm] = useState({ organizationType: user?.sellerProfile?.organizationType || "", organizationName: user?.sellerProfile?.organizationName || "", registrationNumber: user?.sellerProfile?.registrationNumber || "", shopName: user?.sellerProfile?.shopName || "", description: user?.sellerProfile?.description || "", city: user?.sellerProfile?.city || user?.city || "", region: user?.sellerProfile?.region || user?.region || "", phone: user?.sellerProfile?.phone || user?.phone || "", profilePhoto: user?.sellerProfile?.profilePhoto || "", bannerPhoto: user?.sellerProfile?.bannerPhoto || "" });
  const [productForm, setProductForm] = useState({ name: "", category: "Produits vivriers et agricoles", subcategory: "", description: "", price: "", discountPercent: "", promoCode: "", unit: "kg", stock: "", minOrder: 1, images: [], saleMode: "les-deux" });
  const [editingId, setEditingId] = useState(null);
  const [formError, setFormError] = useState("");
  const [imagesBusy, setImagesBusy] = useState(false);
  const [shopPhotoBusy, setShopPhotoBusy] = useState(false);
  const [productStep, setProductStep] = useState(1);

  useEffect(() => {
    if (!user) return;
    setShopForm({ organizationType: user.sellerProfile?.organizationType || "", organizationName: user.sellerProfile?.organizationName || "", registrationNumber: user.sellerProfile?.registrationNumber || "", shopName: user.sellerProfile?.shopName || "", description: user.sellerProfile?.description || "", city: user.sellerProfile?.city || user.city || "", region: user.sellerProfile?.region || user.region || "", phone: user.sellerProfile?.phone || user.phone || "", profilePhoto: user.sellerProfile?.profilePhoto || "", bannerPhoto: user.sellerProfile?.bannerPhoto || "" });
  }, [user]);

  const saveShop = event => {
    event.preventDefault(); setFormError("");
    if (!shopForm.profilePhoto) { setFormError("Ajoutez une photo de profil pour votre boutique."); return; }
    try { saveSellerProfile(shopForm); }
    catch (error) { setFormError(error.message || "Impossible d’enregistrer la boutique."); }
  };
  const handleShopPhoto = async (event, field = "profilePhoto") => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    setFormError("");
    setShopPhotoBusy(true);
    try { const photo = await compressShopPhoto(file, field === "bannerPhoto" ? 1440 : 640); setShopForm(current=>({...current,[field]:photo})); }
    catch (error) { setFormError(error.message || "Impossible de charger la photo de la boutique."); }
    finally { setShopPhotoBusy(false); }
  };
  const validateProductStep = (step, value = productForm) => {
    if (step === 1) {
      if (!value.name.trim()) return "Saisissez le nom du produit pour continuer.";
      if (!value.category) return "Choisissez une filière pour continuer.";
      if (value.description.trim().length < 12) return "Ajoutez une description d’au moins 12 caractères.";
    }
    if (step === 2) {
      if (!(Number(value.price) > 0)) return "Indiquez un prix supérieur à zéro.";
      if (value.stock === "" || !Number.isFinite(Number(value.stock)) || Number(value.stock) < 0) return "Indiquez la quantité disponible en stock.";
      if (!(Number(value.minOrder) >= 1)) return "La commande minimum doit être d’au moins une unité.";
      if (!value.unit || !value.saleMode) return "Choisissez l’unité et le mode de vente.";
    }
    if (step === 3) {
      if (!value.images?.length) return "Ajoutez au moins une photo du produit pour le publier.";
      if (value.discountPercent && (Number(value.discountPercent) < 1 || Number(value.discountPercent) > 90)) return "La remise doit être comprise entre 1 et 90 %.";
    }
    return "";
  };
  const moveProductStep = targetStep => {
    if (targetStep > productStep) {
      for (let step = productStep; step < targetStep; step += 1) {
        const error = validateProductStep(step);
        if (error) { setFormError(error); return; }
      }
    }
    setProductStep(targetStep);
    setFormError("");
  };
  const submitProduct = event => {
    event.preventDefault(); setFormError("");
    for (let step = 1; step <= productSteps.length; step += 1) {
      const error = validateProductStep(step);
      if (error) { setProductStep(step); setFormError(error); return; }
    }
    try { saveSellerProduct(productForm, editingId); setProductForm({ name: "", category: "Produits vivriers et agricoles", subcategory: "", description: "", price: "", discountPercent: "", promoCode: "", unit: "kg", stock: "", minOrder: 1, images: [], saleMode: "les-deux" }); setEditingId(null); setProductStep(1); }
    catch (error) { setFormError(error.message || "Vérifiez les informations du produit."); }
  };
  const editProduct = product => { setEditingId(product.id); setProductStep(1); setFormError(""); setProductForm({ name: product.name || "", category: product.category || "Produits vivriers et agricoles", subcategory: product.subcategory || "", description: product.description || "", price: product.oldPrice || product.price || "", discountPercent: product.discountPercent || (product.oldPrice && product.price ? Math.round((1 - product.price / product.oldPrice) * 100) : ""), promoCode: product.promoCode || "", unit: product.unit || "kg", stock: product.stock ?? 0, minOrder: product.minOrder || 1, images: product.images?.length ? product.images : (product.image ? [product.image] : []), saleMode: product.saleMode || "les-deux" }); window.scrollTo({ top: 0, behavior: "smooth" }); };

  const resetProductForm = () => { setEditingId(null); setProductStep(1); setFormError(""); setProductForm({ name: "", category: "Produits vivriers et agricoles", subcategory: "", description: "", price: "", discountPercent: "", promoCode: "", unit: "kg", stock: "", minOrder: 1, images: [], saleMode: "les-deux" }); };
  const handleProductImages = async (event, append = true) => {
    const files = Array.from(event.target.files || []);
    event.target.value = "";
    if (!files.length) return;
    const room = 5 - (append ? productForm.images.length : 0);
    if (room <= 0) { setFormError("Vous pouvez ajouter jusqu’à 5 photos par produit."); return; }
    setFormError("");
    setImagesBusy(true);
    try {
      const compressed = await Promise.all(files.slice(0, room).map(compressProductImage));
      setProductForm(current => ({ ...current, images: [...(append ? current.images : []), ...compressed].slice(0, 5) }));
    } catch (error) { setFormError(error.message || "Impossible de charger ces images."); }
    finally { setImagesBusy(false); }
  };

  if (!user) return <AccountShell authRequired={false} title={titleMap[section]?.[0] || "Mon espace personnel"} description={titleMap[section]?.[1] || "Découvrez les outils de votre espace AgriMarket."}>
    <section className="mypage-card mypage-guest"><Store size={32}/><span className="mypage-kicker">ESPACE PERSONNEL AGRIMARKET</span><h2>Explorez votre espace</h2><p>Les pages de l’espace sont accessibles. Connectez-vous pour retrouver vos achats, gérer votre boutique, publier des produits et suivre vos ventes personnelles.</p><div className="mypage-guest-links"><Link href="/compte">Vue d’ensemble</Link><Link href="/achats">Achats</Link><Link href="/boutique">Boutique</Link><Link href="/produits">Produits</Link><Link href="/ventes">Ventes</Link><Link href="/finances">Finances</Link></div><Link className="mypage-primary" href="/connexion"><ArrowRight size={16}/> Se connecter à mon compte</Link></section>
  </AccountShell>;

  if (section === "purchases") return <AccountShell authRequired={false} title={titleMap.purchases[0]} description={titleMap.purchases[1]}>
    {purchases.length ? <div className="mypage-list">{purchases.map(order => <article className="mypage-card mypage-order" key={order.id}><div><span className="mypage-kicker">COMMANDE · {order.createdAt ? dateFr(order.createdAt) : "Date non renseignée"}</span><h2>{order.id}</h2><p>{(order.items || []).length} article(s) · {order.status || "Enregistrée"}</p></div><div className="mypage-order-end"><strong>{money(order.total || order.subtotal || 0)}</strong><Link href={`/commandes/${encodeURIComponent(order.id)}`}>Suivre la commande <ArrowRight size={15}/></Link></div></article>)}</div> : <EmptyState title="Aucun achat enregistré" text="Vos commandes passées depuis ce compte apparaîtront ici." href="/catalogue" action="Explorer le catalogue" />}
  </AccountShell>;

  const [title, description] = titleMap[section] || ["Mon espace", "Gérez votre activité AgriMarket."];
  return <AccountShell authRequired={false} title={title} description={description}>
    {!seller && section !== "shop" ? <EmptyState title="Activez votre espace vendeur" text="Créez votre boutique pour pouvoir publier des produits et recevoir des commandes." href="/boutique" action="Configurer ma boutique" /> : null}
    {seller && !eligibleSeller && ["products", "sales", "finances"].includes(section) ? <EmptyState title="Complétez les informations de votre structure" text="La publication et la gestion des ventes sont réservées aux coopératives, associations, entreprises et commerçants professionnels. Précisez le type et le nom officiel de votre structure pour activer ces outils." href="/boutique" action="Compléter ma boutique" /> : null}
    {section === "shop" && <section className="mypage-layout">
      <div className="mypage-card mypage-intro"><Store size={28}/><div><span className="mypage-kicker">BOUTIQUE PROFESSIONNELLE</span><h2>{seller ? (user.sellerProfile?.shopName || "Votre boutique") : "Créer une boutique AgriMarket"}</h2><p>Les boutiques sont ouvertes aux coopératives, associations, entreprises et commerçants professionnels du secteur agropastoral. Une fois les informations saisies, votre boutique est active et vous pouvez publier immédiatement.</p><p className="mypage-notice"><CircleAlert size={17}/> Les particuliers peuvent acheter sur la plateforme mais ne peuvent pas ouvrir une boutique personnelle.</p>{seller && <Link className="mypage-secondary shop-public-link" href={`/boutiques/${encodeURIComponent(user.id)}`}>Voir ma boutique publique <ArrowRight size={15}/></Link>}</div></div>
      <form className="mypage-card mypage-form" onSubmit={saveShop}><h2>{seller ? "Informations de la structure" : "Créer votre boutique"}</h2>{formError && <p className="mypage-form-error" role="alert">{formError}</p>}
        <div className="shop-profile-photo-editor"><span className="shop-profile-photo-preview">{shopForm.profilePhoto ? <img src={shopForm.profilePhoto} alt="Aperçu de la photo de boutique"/> : <Store size={25}/>}</span><div><strong>Photo de profil de la boutique <span>*</span></strong><small>Choisissez une image carrée ou un logo. Elle apparaîtra dans le répertoire des boutiques.</small><label className="shop-photo-upload">{shopPhotoBusy ? "Préparation…" : shopForm.profilePhoto ? "Changer la photo" : "Ajouter une photo"}<input type="file" accept="image/*" capture="environment" onChange={handleShopPhoto} disabled={shopPhotoBusy}/></label></div></div>
        <div className="shop-banner-photo-editor"><span className="shop-banner-photo-preview" style={shopForm.bannerPhoto ? {backgroundImage:`url("${shopForm.bannerPhoto}")`} : undefined}>{!shopForm.bannerPhoto && <Store size={22}/>}</span><div><strong>Photo de bannière <span className="mypage-field-optional">(facultative)</span></strong><small>Choisissez une photo horizontale pour personnaliser l’en-tête. Sans photo, la bannière adoptera un fond brun.</small><div className="shop-banner-photo-actions"><label className="shop-photo-upload">{shopPhotoBusy ? "Préparation…" : shopForm.bannerPhoto ? "Changer la bannière" : "Ajouter une bannière"}<input type="file" accept="image/*" onChange={event=>handleShopPhoto(event,"bannerPhoto")} disabled={shopPhotoBusy}/></label>{shopForm.bannerPhoto && <button type="button" className="shop-banner-remove" onClick={()=>setShopForm(current=>({...current,bannerPhoto:""}))}>Retirer</button>}</div></div></div>
        <label>Type de structure<select required value={shopForm.organizationType} onChange={e=>setShopForm({...shopForm,organizationType:e.target.value})}><option value="">Sélectionner une structure</option><option value="cooperative">Coopérative</option><option value="association">Association</option><option value="enterprise">Entreprise</option><option value="merchant">Commerçant / distributeur</option></select></label>
        <label>Nom officiel de la structure<input required value={shopForm.organizationName} onChange={e=>setShopForm({...shopForm,organizationName:e.target.value})} placeholder="Nom de la coopérative, association, entreprise ou commerce" /></label>
        <label>Identifiant officiel <span className="mypage-field-optional">(RCCM, récépissé, patente ou numéro de coopérative)</span><input required value={shopForm.registrationNumber} onChange={e=>setShopForm({...shopForm,registrationNumber:e.target.value})} placeholder="Numéro d’enregistrement" /></label>
        <label>Nom public de la boutique<input required value={shopForm.shopName} onChange={e=>setShopForm({...shopForm,shopName:e.target.value})} /></label>
        <label>Description<textarea rows="4" value={shopForm.description} onChange={e=>setShopForm({...shopForm,description:e.target.value})} placeholder="Présentez votre structure, vos filières et votre savoir-faire" /></label>
        <div className="mypage-form-grid"><label>Ville<input required value={shopForm.city} onChange={e=>setShopForm({...shopForm,city:e.target.value})} /></label><label>Région<input required value={shopForm.region} onChange={e=>setShopForm({...shopForm,region:e.target.value})} /></label></div>
        <label>Téléphone professionnel<input required type="tel" value={shopForm.phone} onChange={e=>setShopForm({...shopForm,phone:e.target.value})} /></label>
        <button className="mypage-primary" type="submit">{seller ? "Enregistrer les informations" : "Créer ma boutique"} <ArrowRight size={16}/></button>
      </form>
    </section>}
    {section === "products" && eligibleSeller && <>
      <section className="mypage-card mypage-form seller-product-editor" id="product-form">
        <div className="mypage-section-heading"><div><span className="mypage-kicker">PUBLICATION DIRECTE</span><h2>{editingId ? "Modifier le produit" : "Nouvelle offre"}</h2></div><span className="mypage-count"><Box size={16}/> {ownedProducts.length} produit(s)</span></div>
        <p className="seller-publish-note">Les produits sont publiés dans votre boutique dès l’enregistrement. Vous pourrez les modifier ou les archiver à tout moment.</p>
        {formError && <p className="mypage-form-error" role="alert">{formError}</p>}
        <nav className="seller-wizard-steps" aria-label="Étapes de publication">
          {productSteps.map(step=>{
            const locked = step.number > productStep && productSteps.slice(0,step.number-1).some(previous=>validateProductStep(previous.number));
            return <button type="button" key={step.number} className={`seller-wizard-step${productStep===step.number?" is-current":""}${productStep>step.number?" is-done":""}`} aria-current={productStep===step.number?"step":undefined} disabled={locked} onClick={()=>moveProductStep(step.number)}><span className="seller-wizard-step-number">{productStep>step.number?<Check size={15}/>:String(step.number).padStart(2,"0")}</span><span className="seller-wizard-step-copy"><strong>{step.title}</strong><small>{step.caption}</small></span></button>;
          })}
        </nav>
        <form className="mypage-product-form seller-product-form" onSubmit={submitProduct}>
          {productStep===1 && <div className="seller-wizard-panel"><div className="seller-wizard-panel-heading"><span>ÉTAPE 1 SUR 3</span><h3>Présentez votre produit</h3><p>Commencez par l’essentiel pour créer une offre facile à trouver.</p></div><div className="seller-wizard-basics"><label>Nom du produit <span>*</span><input required value={productForm.name} onChange={e=>setProductForm({...productForm,name:e.target.value})} placeholder="Ex. Maïs blanc de Foumbot"/></label><label>Filière <span>*</span><select value={productForm.category} onChange={e=>{const category=e.target.value;setProductForm(current=>({...current,category,unit:unitsByCategory[category]?.[0]||"pièce"}));}}>{Object.keys(unitsByCategory).map(category=><option key={category}>{category}</option>)}</select></label><label className="seller-product-description">Description <span>*</span><textarea required minLength={12} rows="4" value={productForm.description} onChange={e=>setProductForm({...productForm,description:e.target.value})} placeholder="Origine, variété, qualité, conditions de vente…"/><small>{productForm.description.trim().length}/12 caractères minimum</small></label></div></div>}
          {productStep===2 && <div className="seller-wizard-panel"><div className="seller-wizard-panel-heading"><span>ÉTAPE 2 SUR 3</span><h3>Définissez prix et disponibilité</h3><p>Choisissez l’unité utilisée dans votre filière et les quantités que vous pouvez fournir.</p></div><div className="seller-product-fields"><label><span className="seller-field-label">Prix unitaire (FCFA) <span>*</span></span><input required type="number" min="1" value={productForm.price} onChange={e=>setProductForm({...productForm,price:e.target.value})} placeholder="0"/></label><label><span className="seller-field-label">Unité de vente <span>*</span></span><select required value={productForm.unit} onChange={e=>setProductForm({...productForm,unit:e.target.value})}>{(unitsByCategory[productForm.category] || ["pièce"]).map(unit=><option key={unit}>{unit}</option>)}</select></label><label><span className="seller-field-label">Quantité en stock <span>*</span></span><input required type="number" min="0" value={productForm.stock} onChange={e=>setProductForm({...productForm,stock:e.target.value})} placeholder="0"/></label><label><span className="seller-field-label">Commande minimum <span>*</span></span><input required type="number" min="1" value={productForm.minOrder} onChange={e=>setProductForm({...productForm,minOrder:e.target.value})}/></label><label><span className="seller-field-label">Mode de vente <span>*</span></span><select value={productForm.saleMode} onChange={e=>setProductForm({...productForm,saleMode:e.target.value})}><option value="les-deux">Détail et gros</option><option value="detail">Détail</option><option value="gros">Gros / demi-gros</option></select></label></div></div>}
          {productStep===3 && <div className="seller-wizard-panel"><div className="seller-wizard-panel-heading"><span>ÉTAPE 3 SUR 3</span><h3>Ajoutez des photos et vos promotions</h3><p>Une photo est nécessaire pour publier. Les offres et codes promotionnels restent facultatifs.</p></div><fieldset className="seller-promo-fields"><legend>Promotion et code promo <span>(facultatif)</span></legend><p>La remise ajuste immédiatement le prix affiché. Le code promo apparaît sur la fiche produit, à communiquer au vendeur.</p><div><label>Remise (%)<input type="number" min="1" max="90" value={productForm.discountPercent} onChange={e=>setProductForm({...productForm,discountPercent:e.target.value})} placeholder="Aucune remise"/></label><label>Code promo<input maxLength="24" value={productForm.promoCode} onChange={e=>setProductForm({...productForm,promoCode:e.target.value.toUpperCase().replace(/[^A-Z0-9_-]/g,"")})} placeholder="Ex. RECOLTE10"/></label></div>{Number(productForm.discountPercent)>0 && Number(productForm.price)>0 && <small>Prix promotionnel estimé : <strong>{money(Math.round(Number(productForm.price)*(1-Math.min(90,Number(productForm.discountPercent))/100)))}</strong> au lieu de {money(Number(productForm.price))} / {productForm.unit}.</small>}</fieldset><div className="seller-image-section"><div><strong>Photos du produit <span>(1 à 5)</span></strong><small>Choisissez dans la galerie ou prenez une photo avec l’appareil. Les images sont optimisées automatiquement.</small></div><div className="seller-image-actions"><label className="seller-upload-button"><ImagePlus/><span>Choisir dans la galerie</span><input type="file" accept="image/*" multiple onChange={event=>handleProductImages(event,true)} disabled={imagesBusy}/></label><label className="seller-upload-button is-camera"><Camera/><span>Prendre une photo</span><input type="file" accept="image/*" capture="environment" onChange={event=>handleProductImages(event,true)} disabled={imagesBusy}/></label></div>{imagesBusy && <small className="seller-image-processing">Préparation des photos…</small>}{productForm.images.length>0 && <div className="seller-image-previews">{productForm.images.map((image,index)=><figure key={`${index}-${image.slice(0,30)}`}><img src={image} alt={`Aperçu ${index+1}`}/><button type="button" onClick={()=>setProductForm(current=>({...current,images:current.images.filter((_,photoIndex)=>photoIndex!==index)}))} aria-label={`Retirer la photo ${index+1}`}><Trash2/></button><figcaption>{index===0?"Photo principale":`Photo ${index+1}`}</figcaption></figure>)}</div>}</div></div>}
          <p className={`seller-wizard-validation${validateProductStep(productStep)?" has-error":""}`} role="status">{validateProductStep(productStep) || "Cette étape est complète. Vous pouvez continuer."}</p>
          <div className="mypage-form-actions seller-product-actions"><button className="mypage-secondary" type="button" onClick={()=>moveProductStep(productStep-1)} disabled={productStep===1}>Retour</button>{productStep<3 ? <button className="mypage-primary" type="button" onClick={()=>moveProductStep(productStep+1)} disabled={Boolean(validateProductStep(productStep)) || imagesBusy}>Continuer <ArrowRight size={16}/></button> : <button className="mypage-primary" type="submit" disabled={Boolean(validateProductStep(3)) || imagesBusy}><Plus size={16}/>{editingId ? "Enregistrer les modifications" : "Publier le produit"}</button>}{editingId && <button className="mypage-secondary" type="button" onClick={resetProductForm}>Annuler la modification</button>}</div>
        </form>
      </section>
      <section className="mypage-list mypage-products">{ownedProducts.length ? ownedProducts.map(product=><article className="mypage-card mypage-product-row" key={product.id}>{product.image ? <img src={product.image} alt=""/> : <div className="mypage-product-placeholder"><Package/></div>}<div className="mypage-product-main"><span className={`mypage-status ${product.status === "archived" ? "is-muted" : ""}`}>{product.status === "archived" ? "Archivé" : "Publié"}</span><h3>{product.name}</h3><p>{product.stock} {product.unit} disponibles · Minimum {product.minOrder || 1}{product.images?.length > 1 ? ` · ${product.images.length} photos` : ""}</p>{product.promoCode && <small className="seller-product-code">Code promo : {product.promoCode}</small>}</div><strong>{product.oldPrice && <del>{money(product.oldPrice)} · </del>}{money(product.price)}</strong><div className="mypage-row-actions"><button type="button" onClick={()=>editProduct(product)}>Modifier</button>{product.status !== "archived" && <button type="button" className="is-danger" onClick={()=>archiveSellerProduct(product.id)}>Archiver</button>}</div></article>) : <EmptyState title="Votre catalogue est vide" text="Ajoutez votre première offre pour démarrer." href="#product-form" action="Créer un produit"/>}</section>
    </>}
    {section === "sales" && eligibleSeller && <>{sales.length ? <div className="mypage-list">{sales.map(order=>{const next = {confirmed:["accepted","refused"],accepted:["preparing"],preparing:["ready"],ready:["shipping"],shipping:["completed"]}[order.statusCode] || []; return <article className="mypage-card mypage-sale" key={order.id}><div className="mypage-sale-head"><div><span className="mypage-kicker">VENTE · {order.createdAt ? dateFr(order.createdAt) : "Date non renseignée"}</span><h2>{order.id}</h2></div><span className="mypage-status">{order.status || "À traiter"}</span></div><div className="mypage-sale-body"><div><strong>Client</strong><span>{order.customer?.name || order.name || "Acheteur"}</span><small>{order.customer?.city || order.city || "Ville non précisée"}</small></div><div><strong>Vos articles</strong><span>{order.sellerItems.map(line=>`${line.name} × ${line.quantity}`).join(" · ")}</span></div><div><strong>Montant des lignes vendeur</strong><span>{money(order.sellerSubtotal)}</span></div></div>{order.statusCode === "pending_payment" && <p className="mypage-notice"><CircleAlert size={16}/> Paiement en attente : cette commande ne peut pas encore être acceptée.</p>}{next.length > 0 && <div className="mypage-form-actions">{next.map(status=><button key={status} className={status === "refused" ? "mypage-secondary is-danger" : "mypage-primary"} type="button" onClick={()=>updateSellerOrderStatus(order.id,status)}>{({accepted:"Accepter la commande",refused:"Refuser",preparing:"Commencer la préparation",ready:"Marquer comme prête",shipping:"Confier à la livraison",completed:"Confirmer la fin de livraison"})[status]} <ArrowRight size={15}/></button>)}</div>}</article>})}</div> : <EmptyState title="Aucune vente pour le moment" text="Les commandes contenant un de vos produits apparaîtront ici." href="/produits" action="Gérer mes produits"/>}</>}
    {section === "finances" && eligibleSeller && <FinanceSummary sales={sales}/>}
  </AccountShell>;
}

function FinanceSummary({sales}) {
  const activeSales = sales.filter(order=>!["refused","cancelled","canceled","failed"].includes(String(order.statusCode||"").toLowerCase()));
  const completedOrders = activeSales.filter(order=>["completed","delivered"].includes(String(order.statusCode||"").toLowerCase()));
  const inProgressOrders = activeSales.filter(order=>!["completed","delivered"].includes(String(order.statusCode||"").toLowerCase()));
  const gross = activeSales.reduce((sum,order)=>sum+order.sellerSubtotal,0);
  const completed = completedOrders.reduce((sum,order)=>sum+order.sellerSubtotal,0);
  const inProgress = inProgressOrders.reduce((sum,order)=>sum+order.sellerSubtotal,0);
  const cancelledOrders = sales.filter(order=>["refused","cancelled","canceled","failed"].includes(String(order.statusCode||"").toLowerCase()));
  const months = useMemo(()=>{
    const now = new Date();
    return Array.from({length:6},(_,index)=>{
      const date = new Date(now.getFullYear(),now.getMonth()-(5-index),1);
      const key = `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,"0")}`;
      const amount = activeSales.filter(order=>{
        const created = new Date(order.createdAt || order.date || "");
        return !Number.isNaN(created.getTime()) && `${created.getFullYear()}-${String(created.getMonth()+1).padStart(2,"0")}`===key;
      }).reduce((sum,order)=>sum+order.sellerSubtotal,0);
      return {key,label:new Intl.DateTimeFormat("fr-FR",{month:"short"}).format(date).replace(".",""),amount};
    });
  },[activeSales]);
  const maxMonthAmount = Math.max(1,...months.map(month=>month.amount));
  const topProducts = useMemo(()=>{
    const totals = new Map();
    activeSales.forEach(order=>order.sellerItems.forEach(item=>{
      const key = itemProductId(item);
      const current = totals.get(key) || {name:item.name || "Produit",quantity:0,revenue:0};
      current.quantity += Number(item.quantity)||0;
      current.revenue += (Number(item.price)||0)*(Number(item.quantity)||0);
      totals.set(key,current);
    }));
    return [...totals.values()].sort((a,b)=>b.revenue-a.revenue).slice(0,5);
  },[activeSales]);
  const recentSales = [...sales].sort((a,b)=>new Date(b.createdAt||0)-new Date(a.createdAt||0)).slice(0,6);

  return <div className="finance-dashboard">
    <div className="mypage-notice finance-disclaimer"><CircleAlert size={18}/><span>Vue calculée à partir des commandes associées à vos produits. Les commandes refusées ou annulées sont exclues. Le portefeuille, les commissions et les retraits ne sont pas activés : ces indicateurs ne représentent pas un solde disponible.</span></div>
    <section className="finance-kpis" aria-label="Indicateurs financiers">
      <article className="mypage-card finance-kpi"><span><Banknote size={18}/> Chiffre d’affaires enregistré</span><strong>{money(gross)}</strong><small>{activeSales.length} commande(s) valides ou en traitement</small></article>
      <article className="mypage-card finance-kpi"><span><BadgeCheck size={18}/> Commandes terminées</span><strong>{money(completed)}</strong><small>{completedOrders.length} livraison(s) terminée(s)</small></article>
      <article className="mypage-card finance-kpi"><span><Clock3 size={18}/> En cours</span><strong>{money(inProgress)}</strong><small>{inProgressOrders.length} commande(s) à traiter ou livrer</small></article>
      <article className="mypage-card finance-kpi"><span><CircleAlert size={18}/> Annulées / refusées</span><strong>{cancelledOrders.length}</strong><small>Exclues du chiffre d’affaires affiché</small></article>
    </section>

    <section className="finance-main-grid">
      <article className="mypage-card finance-chart-card">
        <div className="finance-section-heading"><div><span className="mypage-kicker">ÉVOLUTION</span><h2>Ventes des 6 derniers mois</h2></div><TrendingUp size={20}/></div>
        {activeSales.length ? <div className="finance-chart" role="img" aria-label={`Graphique des ventes mensuelles : ${months.map(month=>`${month.label} ${money(month.amount)}`).join(", ")}`}>
          {months.map(month=><div className="finance-chart-column" key={month.key}><strong>{month.amount ? money(month.amount) : "—"}</strong><div className="finance-chart-track"><span style={{height:`${month.amount ? Math.max(5,month.amount/maxMonthAmount*100) : 0}%`}}/></div><small>{month.label}</small></div>)}
        </div> : <div className="finance-chart-empty"><Banknote size={24}/><p>Le graphique apparaîtra après vos premières commandes.</p></div>}
        <p className="finance-chart-caption">Montants des lignes de vos produits, regroupés par date de commande. Les valeurs ne tiennent pas compte des frais de livraison.</p>
      </article>
      <article className="mypage-card finance-top-products">
        <div className="finance-section-heading"><div><span className="mypage-kicker">CATALOGUE</span><h2>Produits les plus vendus</h2></div><Box size={20}/></div>
        {topProducts.length ? <ol>{topProducts.map((product,index)=><li key={`${product.name}-${index}`}><span className="finance-rank">{index+1}</span><div><strong>{product.name}</strong><small>{product.quantity} unité(s) vendue(s)</small></div><b>{money(product.revenue)}</b></li>)}</ol> : <p className="finance-empty-copy">Aucune vente produit à afficher pour le moment.</p>}
      </article>
    </section>

    <section className="mypage-card finance-transactions">
      <div className="finance-section-heading"><div><span className="mypage-kicker">SUIVI</span><h2>Activité récente</h2></div><Link href="/ventes">Gérer les ventes <ArrowRight size={15}/></Link></div>
      {recentSales.length ? <div className="finance-table-wrap"><table><thead><tr><th>Commande</th><th>Date</th><th>Articles</th><th>État</th><th>Montant vendeur</th></tr></thead><tbody>{recentSales.map(order=><tr key={order.id}><td><strong>{order.id}</strong><small>{order.customer?.name || order.name || "Acheteur"}</small></td><td>{order.createdAt ? dateFr(order.createdAt) : "—"}</td><td>{order.sellerItems.length} article(s)</td><td><span className="mypage-status">{order.status || "Enregistrée"}</span></td><td><strong>{money(order.sellerSubtotal)}</strong></td></tr>)}</tbody></table></div> : <p className="finance-empty-copy">Les commandes liées à vos produits apparaîtront ici.</p>}
    </section>
    <div className="mypage-card mypage-finance-note"><h2>Revenu net et disponibilité</h2><p>Le taux de commission et le circuit de reversement doivent être confirmés par AgriMarket et le prestataire de paiement. Le chiffre d’affaires présenté est brut ; votre revenu net estimé et votre solde retirable seront affichés lorsque ces règles seront configurées.</p></div>
  </div>;
}

function EmptyState({title,text,href,action}) { return <div className="mypage-card mypage-empty"><Package size={30}/><h2>{title}</h2><p>{text}</p><Link className="mypage-primary" href={href}>{action}<ArrowRight size={16}/></Link></div>; }
