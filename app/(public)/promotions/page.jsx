import { Suspense } from "react";
import { Collection } from "@/composants/Collection";
export const metadata = { title: "Promotions" };
export default function PromotionsPage() { return <Suspense><Collection promoOnly /></Suspense>; }
