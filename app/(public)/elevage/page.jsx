import { Suspense } from "react";
import { Collection } from "@/composants/Collection";

export const metadata = {
  title: "Élevage et produits animaux | AgriMarket Cameroun",
  description: "Volailles, bétail, alimentation animale et produits de la ferme au Cameroun."
};

export default function ElevagePage() {
  return (
    <Suspense>
      <Collection fixedCategory="Élevage et produits animaux" />
    </Suspense>
  );
}

