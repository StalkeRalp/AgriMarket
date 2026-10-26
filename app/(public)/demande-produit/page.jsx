"use client";

import { useStore } from "@/lib/store";

export default function Page() {
  const { setProductRequests, notify } = useStore();

  const submit = (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.currentTarget));
    setProductRequests((current) => [{ id: `rq-${Date.now()}`, createdAt: new Date().toISOString(), status: "Nouvelle", ...data }, ...current]);
    e.currentTarget.reset();
    notify("Demande de produit enregistrée");
  };

  return (
    <main>
      <section className="page-hero">
        <div className="container">
          <p className="eyebrow">Produit introuvable ?</p>
          <h1>Dites-nous ce que vous cherchez.</h1>
        </div>
      </section>

      <section className="section container">
        <form className="content-card form-grid next-request-form" onSubmit={submit}>
          <div className="form-group"><label>Votre nom</label><input required name="name" /></div>
          <div className="form-group"><label>E-mail</label><input required type="email" name="email" /></div>
          <div className="form-group"><label>Produit recherché</label><input required name="product" /></div>
          <div className="form-group">
            <label>Catégorie</label>
            <select name="category">
              <option>Intrants agricoles</option>
              <option>Élevage</option>
              <option>Pisciculture</option>
              <option>Matériel agricole</option>
              <option>Services logistiques</option>
              <option>Vétérinaire</option>
            </select>
          </div>
          <div className="form-group full"><label>Précisions</label><textarea name="details" /></div>
          <button className="btn btn-dark">Envoyer la demande</button>
        </form>
      </section>
    </main>
  );
}
