import type { Metadata } from "next";

import { PriceListTemplateForm } from "../_components/price-list-template-form";

export const metadata: Metadata = { title: "New Price List Template" };

export default function NewPriceListTemplatePage() {
  return <PriceListTemplateForm />;
}
