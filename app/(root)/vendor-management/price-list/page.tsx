import type { Metadata } from "next";

import PriceListComponent from "./_components/price-list-component";

export const metadata: Metadata = { title: "Price Lists" };

export default function PriceListPage() {
  return <PriceListComponent />;
}
