"use client";

import { createEditPage } from "@/components/create-edit-page";
import { useRequestPriceListById } from "@/hooks/use-request-price-list";
import { RequestPriceListForm } from "../_components/rpl-form";

export default createEditPage({
  useById: useRequestPriceListById,
  notFoundMessage: "Request price list not found",
  render: (requestPriceList) => <RequestPriceListForm requestPriceList={requestPriceList} />,
});
