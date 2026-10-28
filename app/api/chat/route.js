import { NextResponse } from "next/server";

export const runtime = "nodejs";

const systemPrompt = `Tu es l'assistant d'aide d'AgriMarket, une marketplace agropastorale pour le Cameroun. Réponds en français, en quelques phrases claires et pratiques. Le site public permet de parcourir les produits, fiches, catalogue, panier, commandes, livraison/retrait et FAQ. L'espace personnel permet aux acheteurs de suivre achats, adresses, profil et notifications ; les vendeurs gèrent boutique, produits, ventes et finances de base. Un compte peut être acheteur et vendeur. Paiements, frais et disponibilité dépendent des options réellement présentées pendant la commande. Les prix et stocks ci-dessous sont un instantané du catalogue, vérifie toujours les unités et le stock fourni. Si une information n'est pas dans le contexte, dis-le clairement et dirige vers la page Contact. N'invente jamais prix, stock, disponibilité, statut de commande, politique ou données personnelles. Tu n'as pas accès aux comptes ni au suivi privé d'une commande : demande de consulter l'espace personnel et de contacter l'équipe avec la référence. Pour les conseils agricoles, reste général, tiens compte des conditions locales et ne prescris pas de produit phytosanitaire ou vétérinaire.`;

function helpCenterAnswer(question) {
  const text = question.toLowerCase();
  if (/bonjour|salut|bonsoir|hello/.test(text)) return "Bonjour ! Je peux vous aider pour les commandes, les paiements, la livraison, votre compte ou la vente de produits.";
  if (/commande|acheter|panier/.test(text)) return "Pour commander, ajoutez les produits au panier, puis renseignez vos coordonnées, le mode de livraison ou de retrait et le moyen de paiement. Vous retrouverez ensuite la commande dans votre espace personnel.";
  if (/livraison|livrer|retrait|transport/.test(text)) return "Les options et les frais dépendent de la zone et du vendeur. Consultez les choix présentés au moment de la commande. Vous pouvez aussi suivre le statut depuis votre espace personnel.";
  if (/paiement|payer|mtn|orange money|mobile money/.test(text)) return "Les moyens disponibles sont affichés à l’étape de paiement. Suivez les instructions et attendez la confirmation de la commande ; une capture d’écran ne suffit pas à confirmer un paiement.";
  if (/vendeur|boutique|vendre|produit/.test(text)) return "Pour vendre, ouvrez votre espace personnel et complétez les informations de votre boutique. Vous pourrez ensuite publier vos produits et gérer les commandes reçues.";
  if (/compte|profil|mot de passe|connexion|connecter/.test(text)) return "Connectez-vous puis ouvrez Profil & paramètres dans votre espace personnel pour modifier vos coordonnées et les paramètres du compte.";
  return "Je n’ai pas assez d’informations pour répondre précisément. Consultez la FAQ ou contactez l’équipe AgriMarket depuis la page Contact pour obtenir de l’aide.";
}

export async function POST(request) {
  try {
    const body = await request.json();
    const messages = Array.isArray(body?.messages) ? body.messages : [];
    const conversation = messages
      .filter(message => ["user", "assistant"].includes(message?.role) && typeof message?.content === "string")
      .slice(-8)
      .map(message => ({ role: message.role, content: message.content.trim().slice(0, 1500) }))
      .filter(message => message.content);
    const lastUserMessage = [...conversation].reverse().find(message => message.role === "user");
    const catalog = Array.isArray(body?.catalog) ? body.catalog.slice(0, 80).map(product => ({
      name: String(product?.name || "").slice(0, 100),
      category: String(product?.category || "").slice(0, 70),
      description: String(product?.description || "").slice(0, 220),
      price: Number.isFinite(Number(product?.price)) ? Number(product.price) : null,
      unit: String(product?.unit || "").slice(0, 30),
      stock: Number.isFinite(Number(product?.stock)) ? Number(product.stock) : null,
      location: String(product?.location || "").slice(0, 80),
      seller: String(product?.brand || "").slice(0, 80),
      saleMode: String(product?.saleMode || "").slice(0, 30),
      discountPercent: Number.isFinite(Number(product?.discountPercent)) ? Number(product.discountPercent) : 0,
    })).filter(product => product.name) : [];
    const catalogContext = catalog.length
      ? `\n\nCatalogue public reçu du site (les prix sont en FCFA et par unité indiquée) :\n${JSON.stringify(catalog)}`
      : "\n\nAucun catalogue n'a été transmis pour cette question : n'avance aucune information produit spécifique.";

    if (!lastUserMessage) return NextResponse.json({ error: "Écrivez votre question pour commencer." }, { status: 400 });
    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json({ reply: helpCenterAnswer(lastUserMessage.content), mode: "help-center" });
    }

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${process.env.GROQ_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: process.env.GROQ_MODEL || "openai/gpt-oss-20b",
        messages: [{ role: "system", content: `${systemPrompt}${catalogContext}` }, ...conversation],
        max_tokens: 350,
        temperature: 0.4,
      }),
      signal: AbortSignal.timeout(20000),
    });
    if (!response.ok) return NextResponse.json({ error: "L’assistant est momentanément indisponible. Réessayez ou contactez notre équipe." }, { status: 502 });
    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content?.trim();
    if (!reply) return NextResponse.json({ error: "Je n’ai pas pu préparer une réponse. Réessayez." }, { status: 502 });
    return NextResponse.json({ reply, mode: "ai" });
  } catch {
    return NextResponse.json({ error: "Impossible d’envoyer votre message pour le moment. Vérifiez votre connexion et réessayez." }, { status: 400 });
  }
}
