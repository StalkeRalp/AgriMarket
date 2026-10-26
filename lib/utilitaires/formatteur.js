export const money = value => new Intl.NumberFormat("fr-FR", { style: "currency", currency: "XAF", maximumFractionDigits: 0 }).format(Number(value || 0));
export const dateFr = value => new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium" }).format(new Date(value));
