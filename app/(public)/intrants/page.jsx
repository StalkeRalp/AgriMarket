import { Suspense } from "react";
import { Collection } from "@/composants/Collection";

export const metadata = {
  title: "Intrants agricoles & Fertilisants | AgriMarket Cameroun",
  description: "Engrais minéraux NPK, fertilisants bio, compost et solutions phytosanitaires homologuées."
};

export default function IntrantsPage() {
  return (
    <Suspense>
      <Collection fixedCategory="Intrants agricoles" />
    </Suspense>
  );
}

