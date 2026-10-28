export function calculatePromoDiscount(code, lines) {
  const normalizedCode = String(code || "").trim().toUpperCase();
  if (!normalizedCode || !Array.isArray(lines)) return { valid: false, discount: 0, products: [] };

  const eligibleLines = lines.filter(({ product }) =>
    String(product?.promoCode || "").trim().toUpperCase() === normalizedCode &&
    Number(product?.discountPercent) > 0
  );

  if (!eligibleLines.length) return { valid: false, discount: 0, products: [] };

  const discount = eligibleLines.reduce((sum, { product, quantity }) => {
    const percent = Math.min(90, Math.max(0, Number(product.discountPercent) || 0));
    return sum + Math.round(Number(product.price) * Number(quantity) * percent / 100);
  }, 0);

  return { valid: discount > 0, discount, products: eligibleLines.map(({ product }) => product.name) };
}
