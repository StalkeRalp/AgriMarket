"use client";

import { useEffect, useState } from "react";
import { Building2, Check, Home, MapPin, MapPinned, Pencil, Plus, ShieldCheck, Trash2, BriefcaseBusiness } from "lucide-react";
import { AccountShell } from "@/composants/AccountShell";
import { AddressMapPicker } from "@/composants/AddressMapPicker";
import { useStore } from "@/lib/store";

const emptyForm = {
  label: "Maison",
  address: "",
  additionalInfo: "",
  city: "",
  region: "",
  phone: "",
  latitude: "",
  longitude: "",
  isDefault: false,
};

const labels = [
  { value: "Maison", icon: Home },
  { value: "Travail", icon: Building2 },
  { value: "Autre", icon: BriefcaseBusiness },
];

export default function Page() {
  const { user, addresses = [], setAddresses, hydrated } = useStore();
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [formError, setFormError] = useState("");

  useEffect(() => {
    if (!user?.phone) return;
    setForm(current => ({ ...current, phone: current.phone || user.phone }));
  }, [user?.phone]);

  const setField = (key, value) => setForm(current => ({ ...current, [key]: value }));

  const startNewAddress = () => {
    setEditingId(null);
    setForm({ ...emptyForm, phone: user?.phone || "", isDefault: addresses.length === 0 });
    setFormError("");
    document.getElementById("address-editor")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const editAddress = address => {
    setEditingId(address.id);
    setForm({ ...emptyForm, ...address, isDefault: Boolean(address.isDefault) });
    setFormError("");
    document.getElementById("address-editor")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const saveAddress = event => {
    event.preventDefault();
    setFormError("");
    const existingDefault = addresses.some(address => address.isDefault && address.id !== editingId);
    const address = {
      ...form,
      id: editingId || `address-${Date.now()}`,
      label: form.label.trim(),
      address: form.address.trim(),
      additionalInfo: form.additionalInfo.trim(),
      city: form.city.trim(),
      region: form.region.trim(),
      phone: form.phone.trim(),
      isDefault: Boolean(form.isDefault || !existingDefault),
    };
    if (!address.address || !address.city || !address.phone) {
      setFormError("Complétez l’adresse, la ville et le numéro de téléphone pour enregistrer ce lieu de livraison.");
      return;
    }
    setAddresses(current => {
      const next = current.filter(item => item.id !== editingId);
      return [address, ...next].map(item => ({ ...item, isDefault: address.isDefault ? item.id === address.id : Boolean(item.isDefault) }));
    });
    setEditingId(null);
    setForm({ ...emptyForm, phone: user?.phone || "", isDefault: false });
  };

  const markDefault = id => setAddresses(current => current.map(address => ({ ...address, isDefault: address.id === id })));
  const removeAddress = id => setAddresses(current => {
    const next = current.filter(address => address.id !== id);
    if (current.find(address => address.id === id)?.isDefault && next.length) next[0] = { ...next[0], isDefault: true };
    return next;
  });

  const chooseMapLocation = location => setForm(current => ({
    ...current,
    address: location.address || current.address,
    additionalInfo: location.additionalInfo || current.additionalInfo,
    city: location.city || current.city,
    region: location.region || current.region,
    latitude: location.latitude,
    longitude: location.longitude,
  }));

  if (!hydrated || !user) return <AccountShell title="Mes adresses" description="Enregistrez vos lieux de livraison et choisissez votre adresse principale." />;

  return (
    <AccountShell title="Mes adresses" description="Enregistrez vos lieux de livraison et choisissez votre adresse principale.">
      <div className="address-book-page">
        <section className="address-book-intro">
          <div className="address-book-intro-mark"><MapPinned aria-hidden="true"/></div>
          <div>
            <span className="address-page-kicker">LIVRAISON · CAMEROUN</span>
            <h2>Où souhaitez-vous recevoir vos commandes ?</h2>
            <p>Placez le repère sur la carte pour choisir précisément votre domicile, votre exploitation ou votre point de réception.</p>
          </div>
          <span className="address-count"><strong>{addresses.length}</strong> adresse{addresses.length > 1 ? "s" : ""}</span>
        </section>

        <div className="address-workspace">
          <section className="address-map-column">
            <div className="address-panel-heading"><div><span className="address-page-kicker">01 · LOCALISER</span><h3>Choisir le point sur la carte</h3></div><span className="address-map-region">Cameroun</span></div>
            <AddressMapPicker coordinates={form.latitude && form.longitude ? { latitude: form.latitude, longitude: form.longitude } : null} onSelect={chooseMapLocation}/>
            <div className="address-location-readout">
              <MapPin aria-hidden="true"/>
              <div><strong>{form.address || "Aucun point choisi"}</strong><span>{[form.city, form.region].filter(Boolean).join(", ") || "Recherchez un lieu ou sélectionnez un point sur la carte"}</span></div>
              {form.latitude && form.longitude && <Check aria-label="Position sélectionnée" className="address-location-check"/>}
            </div>
          </section>

          <section className="address-editor" id="address-editor">
            <div className="address-panel-heading"><div><span className="address-page-kicker">02 · ENREGISTRER</span><h3>{editingId ? "Modifier l’adresse" : "Détails de livraison"}</h3></div><MapPin aria-hidden="true"/></div>
            <form onSubmit={saveAddress}>
              <fieldset className="address-label-options"><legend>Nommer cette adresse</legend>{labels.map(({ value, icon: Icon })=><button key={value} type="button" className={form.label === value ? "is-selected" : ""} onClick={()=>setField("label",value)}><Icon aria-hidden="true"/>{value}</button>)}</fieldset>
              <label className="address-field">Adresse et repère <span>*</span><input required value={form.address} onChange={event=>setField("address",event.target.value)} placeholder="Quartier, rue, repère connu" autoComplete="street-address"/></label>
              <label className="address-field">Complément d’adresse<input value={form.additionalInfo} onChange={event=>setField("additionalInfo",event.target.value)} placeholder="Immeuble, portail, indications pour le livreur"/></label>
              <div className="address-field-row">
                <label className="address-field">Ville <span>*</span><input required value={form.city} onChange={event=>setField("city",event.target.value)} placeholder="Douala" autoComplete="address-level2"/></label>
                <label className="address-field">Région<input value={form.region} onChange={event=>setField("region",event.target.value)} placeholder="Littoral" autoComplete="address-level1"/></label>
              </div>
              <label className="address-field">Téléphone de réception <span>*</span><input required type="tel" value={form.phone} onChange={event=>setField("phone",event.target.value)} placeholder="+237 6XX XX XX XX" autoComplete="tel"/></label>
              <label className="address-default-toggle"><input type="checkbox" checked={Boolean(form.isDefault)} onChange={event=>setField("isDefault",event.target.checked)}/><span><strong>Définir comme adresse principale</strong><small>Utilisée par défaut lors de vos prochaines commandes.</small></span></label>
              {formError && <p className="address-form-error" role="alert">{formError}</p>}
              <div className="address-form-actions"><button type="submit" className="address-save-button">{editingId ? "Enregistrer les modifications" : <><Plus aria-hidden="true"/> Enregistrer cette adresse</>}</button>{editingId && <button type="button" className="address-cancel-button" onClick={startNewAddress}>Annuler</button>}</div>
            </form>
          </section>
        </div>

        <section className="address-saved-section">
          <div className="address-saved-heading"><div><span className="address-page-kicker">VOS LIEUX DE RÉCEPTION</span><h2>Adresses enregistrées</h2></div><span>{addresses.length} au total</span></div>
          {addresses.length ? <div className="address-saved-grid">{addresses.map(address=><article className={`address-saved-card${address.isDefault ? " is-default" : ""}`} key={address.id}>
            <div className="address-saved-card-top"><span className="address-saved-icon">{address.label === "Maison" ? <Home/> : address.label === "Travail" ? <Building2/> : <MapPin/>}</span><div><h3>{address.label || "Autre"}</h3>{address.isDefault && <span className="address-primary-badge"><Check/> Adresse principale</span>}</div><button type="button" className="address-edit-button" onClick={()=>editAddress(address)} aria-label={`Modifier l’adresse ${address.label}`}><Pencil/></button></div>
            <p>{address.address}{address.additionalInfo && <><br/><span>{address.additionalInfo}</span></>}<br/>{[address.city,address.region].filter(Boolean).join(", ")}</p>
            <div className="address-saved-card-bottom"><span>{address.phone}</span><div>{!address.isDefault && <button type="button" onClick={()=>markDefault(address.id)}>Définir par défaut</button>}<button type="button" className="address-remove-button" onClick={()=>removeAddress(address.id)} aria-label={`Supprimer l’adresse ${address.label}`}><Trash2/></button></div></div>
            {Number.isFinite(Number(address.latitude)) && Number.isFinite(Number(address.longitude)) && address.latitude !== "" && <a className="address-open-map" href={`https://www.google.com/maps/search/?api=1&query=${address.latitude},${address.longitude}`} target="_blank" rel="noreferrer">Voir l’emplacement sur Google Maps <MapPin/></a>}
          </article>)}</div> : <div className="address-empty-state"><MapPin/><div><strong>Pas encore d’adresse enregistrée</strong><p>Choisissez un emplacement sur la carte et ajoutez vos coordonnées de livraison.</p></div></div>}
        </section>

        <p className="address-privacy-note"><ShieldCheck aria-hidden="true"/> Vos coordonnées restent associées à votre compte et servent à préparer vos livraisons.</p>
      </div>
    </AccountShell>
  );
}
