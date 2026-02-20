import type { Metadata } from "next";

import PriceListTemplateComponent from "./_components/price-list-template-component";

export const metadata: Metadata = { title: "Price List Templates" };

export default function PriceListTemplatePage() {
  return <PriceListTemplateComponent />;
}
