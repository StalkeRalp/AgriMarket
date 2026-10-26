import { Suspense } from "react";
import { Collection } from "@/composants/Collection";

export const metadata = {
  title: "Semences, plants et pépinières | AgriMarket Cameroun",
  description: "Semences certifiées, rejets de bananier plantain PIF, boutures et pépinières."
};

export default function SemencesPage() {
  return (
    <Suspense>
      <Collection fixedCategory="Semences, plants et pépinières" />
    </Suspense>
  );
}

