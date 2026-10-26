"use client";
import { useState } from "react";
import { MapPin, Plus, Trash2 } from "lucide-react";
import { AccountShell } from "@/composants/AccountShell";
import { useStore } from "@/lib/store";
import { useRequireAuth } from "@/composants/RequireAuth";

export default function Page() {
  const { user } = useRequireAuth();
  const { addresses, setAddresses } = useStore();
  const [open, setOpen] = useState(false);
  const submit = e => {
    e.preventDefault();
    setAddresses(current => [...current, { id: `a-${Date.now()}`, ...Object.fromEntries(new FormData(e.currentTarget)) }]);
    setOpen(false);
  };
  return (
    <AccountShell title="Mes adresses">
      <div className="next-address-grid">
        {addresses.map(address => (
          <article className="content-card" key={address.id}>
            <MapPin />
            <h2>{address.label}</h2>
            <p>{address.address}<br />{address.city}<br />{address.phone}</p>
            <button className="link-btn" onClick={() => setAddresses(current => current.filter(item => item.id !== address.id))}>
              <Trash2 />Supprimer
            </button>
          </article>
        ))}
        <button className="next-add-card" onClick={() => setOpen(true)}><Plus />Ajouter une adresse</button>
      </div>
      {open && (
        <div className="next-modal">
          <button className="next-modal__overlay" onClick={() => setOpen(false)} />
          <form className="next-modal__card" onSubmit={submit}>
            <h2>Nouvelle adresse</h2>
            <label>Libellé<input required name="label" placeholder="Maison" /></label>
            <label>Ville<input required name="city" /></label>
            <label>Adresse<input required name="address" /></label>
            <label>Téléphone<input required name="phone" /></label>
            <div className="actions">
              <button type="button" className="btn btn-outline" onClick={() => setOpen(false)}>Annuler</button>
              <button className="btn btn-dark">Enregistrer</button>
            </div>
          </form>
        </div>
      )}
    </AccountShell>
  );
}
