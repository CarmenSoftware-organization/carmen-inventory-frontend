import type { Metadata } from "next";

import { PriceListForm } from "../_components/price-list-form";

export const metadata: Metadata = { title: "New Price List" };

export default function NewPriceListPage() {
  return <PriceListForm />;
}
