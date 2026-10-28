"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { LocateFixed, MapPin, Search } from "lucide-react";

const CAMEROON_CENTER = { lat: 5.9631, lng: 10.1591 };

function loadGoogleMaps(apiKey) {
  if (window.google?.maps) return Promise.resolve(window.google.maps);
  if (window.__agrimarketMapsPromise) return window.__agrimarketMapsPromise;

  window.__agrimarketMapsPromise = new Promise((resolve, reject) => {
    const existing = document.getElementById("agrimarket-google-maps");
    if (existing) {
      existing.addEventListener("load", () => resolve(window.google.maps), { once: true });
      existing.addEventListener("error", reject, { once: true });
      return;
    }
    const script = document.createElement("script");
    script.id = "agrimarket-google-maps";
    script.async = true;
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(apiKey)}&loading=async&language=fr&region=CM&v=weekly`;
    script.onload = () => window.google?.maps ? resolve(window.google.maps) : reject(new Error("Google Maps n’a pas pu être initialisé."));
    script.onerror = () => reject(new Error("La carte Google Maps n’a pas pu être chargée."));
    document.head.appendChild(script);
  });
  return window.__agrimarketMapsPromise;
}

function locationParts(result) {
  if (result?.address) {
    const address = result.address;
    const city = address.city || address.town || address.village || address.municipality || address.city_district || address.county || "";
    const region = address.state || address.state_district || address.region || "";
    const building = address.building || address.house_name || "";
    const houseNumber = address.house_number || "";
    const road = address.road || address.pedestrian || address.residential || "";
    const neighborhood = address.neighbourhood || address.suburb || address.quarter || "";
    const addressLine = [[houseNumber, road].filter(Boolean).join(" "), neighborhood].filter(Boolean).join(", ");
    return {
      address: addressLine || building || result.display_name || "",
      additionalInfo: building,
      city,
      region,
    };
  }
  const components = result?.address_components || [];
  const find = (...types) => components.find(part => types.some(type => part.types.includes(type)))?.long_name || "";
  const city = components.find(part => part.types.includes("locality"))
    || components.find(part => part.types.includes("postal_town"))
    || components.find(part => part.types.includes("administrative_area_level_2"))
    || components.find(part => part.types.includes("administrative_area_level_1"));
  const region = components.find(part => part.types.includes("administrative_area_level_1"));
  const premise = find("premise", "establishment", "point_of_interest");
  const subpremise = find("subpremise");
  const street = [find("street_number"), find("route")].filter(Boolean).join(" ");
  const neighborhood = find("neighborhood", "sublocality_level_1", "sublocality");
  return {
    address: result?.formatted_address || [premise, street, neighborhood, city?.long_name].filter(Boolean).join(", "),
    additionalInfo: [premise, subpremise].filter(Boolean).join(", "),
    city: city?.long_name || "",
    region: region?.long_name || "",
  };
}

export function AddressMapPicker({ coordinates, onSelect }) {
  const mapNode = useRef(null);
  const mapObject = useRef(null);
  const markerObject = useRef(null);
  const reverseGeocodeRef = useRef(null);
  const onSelectRef = useRef(onSelect);
  const [query, setQuery] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [mapReady, setMapReady] = useState(false);
  const [locating, setLocating] = useState(false);
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  useEffect(() => { onSelectRef.current = onSelect; }, [onSelect]);

  const publishLocation = useCallback((position, result) => {
    const lat = typeof position.lat === "function" ? position.lat() : position.lat;
    const lng = typeof position.lng === "function" ? position.lng() : position.lng;
    onSelectRef.current?.({
      latitude: Number(lat.toFixed(6)),
      longitude: Number(lng.toFixed(6)),
      ...locationParts(result),
    });
  }, []);

  useEffect(() => {
    if (!apiKey) {
      setLoading(false);
      setError("La clé Google Maps n’est pas configurée. Ajoutez NEXT_PUBLIC_GOOGLE_MAPS_API_KEY dans .env.local puis redémarrez le serveur.");
      return;
    }
    let cancelled = false;
    loadGoogleMaps(apiKey).then(maps => {
      if (cancelled || !mapNode.current) return;
      const map = new maps.Map(mapNode.current, {
        center: CAMEROON_CENTER,
        zoom: 6,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
        clickableIcons: false,
        gestureHandling: "greedy",
      });
      const marker = new maps.Marker({ map, position: null, draggable: true, title: "Position de livraison" });
      mapObject.current = map;
      markerObject.current = marker;
      const reverseGeocode = async position => {
        marker.setPosition(position);
        map.panTo(position);
        try {
          const params = new URLSearchParams({ format: "jsonv2", lat: String(position.lat()), lon: String(position.lng()), zoom: "18", addressdetails: "1" });
          const response = await fetch(`https://nominatim.openstreetmap.org/reverse?${params}`, { headers: { "Accept-Language": "fr" } });
          const result = response.ok ? await response.json() : null;
          publishLocation(position, result);
          if (!result?.address) setError("Le point GPS est enregistré, mais son adresse détaillée n’est pas répertoriée. Vous pouvez compléter les champs manuellement.");
          else setError("");
        } catch {
          publishLocation(position, null);
          setError("Le point GPS est enregistré, mais le service d’adresse est momentanément indisponible. Complétez l’adresse manuellement.");
        }
      };
      reverseGeocodeRef.current = reverseGeocode;
      map.addListener("click", event => event.latLng && reverseGeocode(event.latLng));
      marker.addListener("dragend", event => event.latLng && reverseGeocode(event.latLng));
      setMapReady(true);
      setLoading(false);
    }).catch(() => {
      if (!cancelled) {
        setError("Impossible de charger Google Maps. Vérifiez la clé, l’API Maps JavaScript et la facturation du projet Google Cloud.");
        setLoading(false);
      }
    });
    return () => { cancelled = true; };
  }, [apiKey, publishLocation]);

  useEffect(() => {
    if (!mapReady || !mapObject.current || !markerObject.current || !coordinates?.latitude || !coordinates?.longitude) return;
    const position = { lat: Number(coordinates.latitude), lng: Number(coordinates.longitude) };
    markerObject.current.setPosition(position);
    mapObject.current.setCenter(position);
    mapObject.current.setZoom(16);
  }, [mapReady, coordinates?.latitude, coordinates?.longitude]);

  const searchAddress = event => {
    event.preventDefault();
    if (!query.trim()) return;
    setError("");
    const params = new URLSearchParams({ format: "jsonv2", q: `${query.trim()}, Cameroun`, countrycodes: "cm", addressdetails: "1", limit: "1" });
    fetch(`https://nominatim.openstreetmap.org/search?${params}`, { headers: { "Accept-Language": "fr" } }).then(response => response.ok ? response.json() : []).then(results => {
      if (!results?.[0]) {
        setError("Cette adresse n’a pas été trouvée. Essayez avec le quartier, la ville ou un lieu proche.");
        return;
      }
      const result = results[0];
      const position = { lat: Number(result.lat), lng: Number(result.lon) };
      markerObject.current?.setPosition(position);
      mapObject.current?.setCenter(position);
      mapObject.current?.setZoom(16);
      publishLocation(position, result);
    }).catch(() => setError("La recherche d’adresse est momentanément indisponible. Vous pouvez placer le repère directement sur la carte."));
  };

  const locateMe = () => {
    if (!navigator.geolocation) {
      setError("La géolocalisation n’est pas disponible sur cet appareil.");
      return;
    }
    setError("");
    setLocating(true);
    navigator.geolocation.getCurrentPosition(position => {
      const point = { lat: position.coords.latitude, lng: position.coords.longitude };
      if (mapObject.current) {
        mapObject.current.setCenter(point);
        mapObject.current.setZoom(18);
      }
      if (reverseGeocodeRef.current && window.google?.maps?.LatLng) reverseGeocodeRef.current(new window.google.maps.LatLng(point.lat, point.lng));
      else {
        markerObject.current?.setPosition(point);
        publishLocation(point, null);
      }
      setLocating(false);
    }, () => {
      setLocating(false);
      setError("Votre position n’a pas pu être obtenue. Autorisez la localisation précise dans les réglages du navigateur, puis réessayez.");
    }, { enableHighAccuracy: true, maximumAge: 0, timeout: 20000 });
  };

  return (
    <section className="address-map-picker" aria-label="Choisir une adresse de livraison sur la carte">
      <div className="address-map-toolbar">
        <form className="address-map-search" onSubmit={searchAddress}>
          <Search aria-hidden="true" />
          <input value={query} onChange={event => setQuery(event.target.value)} placeholder="Rechercher un quartier, une rue, un lieu…" aria-label="Rechercher une adresse" />
          <button type="submit" aria-label="Rechercher sur la carte"><Search/><span>Rechercher</span></button>
        </form>
        <button className="address-map-locate" type="button" onClick={locateMe} disabled={locating}><LocateFixed/><span>{locating ? "Localisation…" : "Ma position"}</span></button>
      </div>
      <div className="address-map-canvas-wrap">
        <div className="address-map-canvas" ref={mapNode} role="application" aria-label="Carte interactive Google Maps" />
        {loading && <div className="address-map-loading"><span className="address-map-spinner"/>Chargement de la carte…</div>}
        {error && <div className="address-map-message" role="status"><MapPin/><span>{error}</span></div>}
        <span className="address-map-hint"><MapPin/> Cliquez sur la carte ou déplacez le repère pour préciser le point de livraison</span>
      </div>
    </section>
  );
}
