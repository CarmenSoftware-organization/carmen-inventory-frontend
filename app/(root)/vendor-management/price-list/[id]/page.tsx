"use client";

import { createEditPage } from "@/components/create-edit-page";
import { usePriceListById } from "@/hooks/use-price-list";
import { PriceListForm } from "../_components/price-list-form";

export default createEditPage({
  useById: usePriceListById,
  notFoundMessage: "Price list not found",
  render: (priceList) => <PriceListForm priceList={priceList} />,
});
