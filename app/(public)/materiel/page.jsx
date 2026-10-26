import { Suspense } from "react";
import { Collection } from "@/composants/Collection";

export const metadata = {
  title: "Matériel et équipements agricoles | AgriMarket Cameroun",
  description: "Outillage, pulvérisateurs, motopompes, systèmes d'irrigation et équipements d'élevage."
};

export default function MaterielPage() {
  return (
    <Suspense>
      <Collection fixedCategory="Matériel et équipements" />
    </Suspense>
  );
}

