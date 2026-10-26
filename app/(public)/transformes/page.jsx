import { Suspense } from "react";
import { Collection } from "@/composants/Collection";

export const metadata = {
  title: "Produits transformés locaux | AgriMarket Cameroun",
  description: "Farines locales, huile de palme purifiée, produits séchés et condiments artisanaux."
};

export default function TransformesPage() {
  return (
    <Suspense>
      <Collection fixedCategory="Produits transformés" />
    </Suspense>
  );
}

