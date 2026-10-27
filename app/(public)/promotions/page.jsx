import { Suspense } from "react";
import { Collection } from "@/composants/Collection";

export const metadata = {
  title: "Promotions agricoles et offres du moment | AgriMarket",
  description: "Découvrez les prix promotionnels actuellement proposés sur les produits agricoles, l’élevage, les intrants et les équipements au Cameroun.",
};

export default function PromotionsPage() {
  return (
    <Suspense fallback={<main className="next-loading"><span /><p>Chargement des offres</p></main>}>
      <Collection promoOnly />
    </Suspense>
  );
}
