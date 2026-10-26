"use client";

import { useState } from "react";
import { useStore } from "@/lib/store";

export function ProductEditor({ id = null }) {
  const { products, setProducts } = useStore();
  const product = id ? products.find(p => p.id === id) : null;
  const [form, setForm] = useState(product || { name: "", price: 0, stock: 0 });

  const handleSave = () => {
    if (id) {
      setProducts(products.map(p => (p.id === id ? form : p)));
    } else {
      setProducts([...products, { ...form, id: `p-${Date.now()}` }]);
    }
  };

  return (
    <div className="product-editor">
      <h2>{id ? "Éditer" : "Nouveau"} produit</h2>
      <form onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
        <input placeholder="Nom" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <input type="number" placeholder="Prix" value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} />
        <input type="number" placeholder="Stock" value={form.stock} onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })} />
        <button type="submit" className="btn btn-dark">Enregistrer</button>
      </form>
    </div>
  );
}

export default ProductEditor;
