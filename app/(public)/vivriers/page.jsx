import { Suspense } from "react";
import { Collection } from "@/composants/Collection";

export const metadata = {
  title: "Produits vivriers et agricoles | AgriMarket Cameroun",
  description: "Céréales, tubercules, plantain, fruits et légumes frais en direct des exploitations camerounaises."
};

export default function VivriersPage() {
  return (
    <Suspense>
      <Collection fixedCategory="Produits vivriers et agricoles" />
    </Suspense>
  );
}

