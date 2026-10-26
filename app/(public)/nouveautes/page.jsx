import { Suspense } from "react";
import { Collection } from "@/composants/Collection";
export const metadata = { title: "Nouveautés" };
export default function NewPage() { return <Suspense><Collection newOnly /></Suspense>; }
