"use client";

import Link from "next/link";
import { useState } from "react";
import { useStore } from "@/lib/store";
import { Check, Plus, Trash2, ArrowRight, Star, ShoppingBag } from "lucide-react";

export default function ComparateurPage() {
  const { products, addToCart } = useStore();
  const [selectedIds, setSelectedIds] = useState(["p1", "p2", "p9"]);

  const selectedProducts = selectedIds.map((id) => products.find((p) => p.id === id)).filter(Boolean);

  const addSlot = (e) => {
    const val = e.target.value;
    if (val && !selectedIds.includes(val) && selectedIds.length < 4) {
      setSelectedIds([...selectedIds, val]);
    }
  };

  const removeSlot = (id) => {
    setSelectedIds(selectedIds.filter((pId) => pId !== id));
  };

  const availableToSelect = products.filter((p) => !selectedIds.includes(p.id));

  return (
    <main className="section-padded container">
      {/* Breadcrumb */}
      <nav className="collection-breadcrumb" style={{ marginBottom: "24px" }}>
        <Link href="/">Accueil</Link>
        <span>/</span>
        <strong>Comparateur de Produits</strong>
      </nav>

      <header className="dior-section-header" style={{ marginBottom: "36px" }}>
        <div className="dior-title-group">
          <span className="dior-eyebrow-tag">ANALYSE & COMPARATIF HAUTE COUTURE</span>
          <h2 className="dior-serif-heading">Comparateur de Soins & Cosmétiques</h2>
        </div>
        <p style={{ color: "#665e6a", maxWidth: "680px", margin: "12px 0 0" }}>
          Comparez jusqu'à 4 produits côte à côte sur leur composition, prix, contenance, avantages et type de peau pour composer votre routine idéale.
        </p>
      </header>

      {/* Selector Bar */}
      {selectedIds.length < 4 && (
        <div
          style={{
            background: "#f0f7f2",
            border: "1px solid #d1e7dd",
            padding: "16px 24px",
            marginBottom: "32px",
            display: "flex",
            alignItems: "center",
            gap: "16px",
            flexWrap: "wrap",
          }}
        >
          <span style={{ fontWeight: 600, fontSize: "14px", textTransform: "uppercase", letterSpacing: "0.08em", color: "#0b5d33" }}>
            Ajouter un produit au comparateur ({selectedIds.length}/4) :
          </span>
          <select
            onChange={addSlot}
            value=""
            style={{
              padding: "10px 16px",
              border: "1px solid #c2dbcf",
              background: "#fff",
              fontSize: "14px",
              fontFamily: "inherit",
              cursor: "pointer",
              minWidth: "260px",
              borderRadius: "0px",
            }}
          >
            <option value="" disabled>
              -- Sélectionner un produit --
            </option>
            {availableToSelect.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.brand}) — {p.price.toLocaleString("fr-FR")} FCFA
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Comparison Grid */}
      {selectedProducts.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 20px", border: "1px dashed #d1e7dd" }}>
          <p style={{ color: "#4b5563", marginBottom: "16px" }}>Aucun produit sélectionné pour la comparaison.</p>
          <Link href="/catalogue" className="btn-pill-primary">
            Parcourir le catalogue <ArrowRight width={16} />
          </Link>
        </div>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              minWidth: "750px",
              background: "#fff",
              border: "1px solid #e2e8f0",
            }}
          >
            <thead>
              <tr>
                <th
                  style={{
                    width: "220px",
                    background: "#f0f7f2",
                    padding: "20px",
                    textAlign: "left",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    fontSize: "12px",
                    letterSpacing: "0.1em",
                    color: "#07331e",
                    borderRight: "1px solid #e2e8f0",
                    borderBottom: "2px solid #0b5d33",
                  }}
                >
                  Caractéristiques
                </th>
                {selectedProducts.map((product) => (
                  <th
                    key={product.id}
                    style={{
                      padding: "20px",
                      textAlign: "center",
                      verticalAlign: "top",
                      borderRight: "1px solid #e2e8f0",
                      borderBottom: "2px solid #0b5d33",
                      position: "relative",
                      background: "#fff",
                    }}
                  >
                    <button
                      onClick={() => removeSlot(product.id)}
                      style={{
                        position: "absolute",
                        top: "12px",
                        right: "12px",
                        background: "none",
                        border: "none",
                        color: "#94a3b8",
                        cursor: "pointer",
                        padding: "4px",
                      }}
                      title="Retirer"
                    >
                      <Trash2 width={16} height={16} />
                    </button>

                    <div style={{ height: "180px", marginBottom: "16px", display: "flex", justifyContent: "center" }}>
                      <img
                        src={product.image}
                        alt={product.name}
                        style={{ height: "100%", objectFit: "contain", border: "1px solid #e2e8f0" }}
                      />
                    </div>

                    <span style={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.1em", color: "#64748b", display: "block" }}>
                      {product.brand}
                    </span>
                    <h3 style={{ fontSize: "16px", fontWeight: 700, margin: "6px 0", color: "#111827" }}>
                      {product.name}
                    </h3>
                    <div style={{ fontSize: "18px", fontWeight: 700, color: "#0b5d33", margin: "10px 0" }}>
                      {product.price.toLocaleString("fr-FR")} FCFA
                      {product.oldPrice && (
                        <span style={{ fontSize: "13px", textDecoration: "line-through", color: "#999", marginLeft: "8px" }}>
                          {product.oldPrice.toLocaleString("fr-FR")} FCFA
                        </span>
                      )}
                    </div>

                    <button
                      onClick={() => addToCart(product.id, 1)}
                      className="btn-pill-primary"
                      style={{ width: "100%", fontSize: "13px", padding: "10px 14px", marginTop: "8px", background: "var(--agri-green)", borderRadius: 0 }}
                    >
                      <ShoppingBag width={14} height={14} /> Ajouter au panier
                    </button>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {/* Note / Avis */}
              <tr>
                <td style={tdHeaderStyle}>Note Client & Avis</td>
                {selectedProducts.map((p) => (
                  <td key={p.id} style={tdContentStyle}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "4px" }}>
                      <Star width={16} height={16} fill="#e5b869" color="#e5b869" />
                      <strong>{p.rating}</strong> / 5 ({p.reviews} avis)
                    </div>
                  </td>
                ))}
              </tr>

              {/* Catégorie */}
              <tr>
                <td style={tdHeaderStyle}>Catégorie</td>
                {selectedProducts.map((p) => (
                  <td key={p.id} style={tdContentStyle}>
                    {p.category}
                  </td>
                ))}
              </tr>

              {/* Contenance / Taille */}
              <tr>
                <td style={tdHeaderStyle}>Contenance / Format</td>
                {selectedProducts.map((p) => (
                  <td key={p.id} style={{ ...tdContentStyle, fontWeight: 600 }}>
                    {p.size || "Format Standard"}
                  </td>
                ))}
              </tr>

              {/* Composition */}
              <tr>
                <td style={tdHeaderStyle}>Composition Principale</td>
                {selectedProducts.map((p) => (
                  <td key={p.id} style={tdContentStyle}>
                    {p.composition || "Ingrédients d'origine naturelle & actifs dermatologiques"}
                  </td>
                ))}
              </tr>

              {/* Bénéfices / Avantages */}
              <tr>
                <td style={tdHeaderStyle}>Bénéfices Clés</td>
                {selectedProducts.map((p) => (
                  <td key={p.id} style={{ ...tdContentStyle, textAlign: "left", paddingLeft: "24px" }}>
                    <ul style={{ margin: 0, paddingLeft: "16px", fontSize: "13px", lineHeight: "1.6" }}>
                      {(p.benefits || ["Hydratation longue durée", "Teint sublimé"]).map((b, idx) => (
                        <li key={idx}>{b}</li>
                      ))}
                    </ul>
                  </td>
                ))}
              </tr>

              {/* Statut Stock */}
              <tr>
                <td style={tdHeaderStyle}>Disponibilité Stock</td>
                {selectedProducts.map((p) => (
                  <td key={p.id} style={tdContentStyle}>
                    {p.stock > 0 ? (
                      <span style={{ color: "#2e7d32", fontWeight: 600, display: "inline-flex", alignItems: "center", gap: "4px" }}>
                        <Check width={14} height={14} /> En stock ({p.stock} dispo)
                      </span>
                    ) : (
                      <span style={{ color: "#d32f2f" }}>Rupture temporaire</span>
                    )}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}

const tdHeaderStyle = {
  background: "#f0f7f2",
  padding: "16px 20px",
  fontWeight: 600,
  fontSize: "13px",
  color: "#07331e",
  borderRight: "1px solid #e2e8f0",
  borderBottom: "1px solid #e2e8f0",
};

const tdContentStyle = {
  padding: "16px 20px",
  textAlign: "center",
  fontSize: "14px",
  color: "#1e293b",
  borderRight: "1px solid #e2e8f0",
  borderBottom: "1px solid #e2e8f0",
};
