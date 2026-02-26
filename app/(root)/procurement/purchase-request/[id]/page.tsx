"use client";

import { createEditPage } from "@/components/create-edit-page";
import { usePurchaseRequestById } from "@/hooks/use-purchase-request";
import { PurchaseRequestForm } from "../_components/pr-form";

export default createEditPage({
  useById: usePurchaseRequestById,
  notFoundMessage: "Purchase request not found",
  render: (purchaseRequest) => <PurchaseRequestForm purchaseRequest={purchaseRequest} />,
});
