"use client";

import { createEditPage } from "@/components/create-edit-page";
import { usePriceListTemplateById } from "@/hooks/use-price-list-template";
import { PriceListTemplateForm } from "../_components/price-list-template-form";

export default createEditPage({
  useById: usePriceListTemplateById,
  notFoundMessage: "Price list template not found",
  render: (priceListTemplate) => <PriceListTemplateForm priceListTemplate={priceListTemplate} />,
});
