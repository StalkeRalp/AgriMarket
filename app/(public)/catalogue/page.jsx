import { Suspense } from "react";
import { Collection } from "@/composants/Collection";
export const metadata = { title: "La boutique" };
export default function CataloguePage() { return <Suspense><Collection /></Suspense>; }
