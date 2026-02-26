"use client";

import { createEditPage } from "@/components/create-edit-page";
import { usePurchaseOrderById } from "@/hooks/use-purchase-order";
import { PoForm } from "../_components/po-form";

export default createEditPage({
  useById: usePurchaseOrderById,
  notFoundMessage: "Purchase order not found",
  render: (purchaseOrder) => <PoForm purchaseOrder={purchaseOrder} />,
});
