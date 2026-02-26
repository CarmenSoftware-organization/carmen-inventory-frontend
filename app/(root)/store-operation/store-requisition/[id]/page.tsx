"use client";

import { createEditPage } from "@/components/create-edit-page";
import { useStoreRequisitionById } from "@/hooks/use-store-requisition";
import { StoreRequisitionForm } from "../_components/sr-form";

export default createEditPage({
  useById: useStoreRequisitionById,
  notFoundMessage: "Store requisition not found",
  render: (storeRequisition) => <StoreRequisitionForm storeRequisition={storeRequisition} />,
});
