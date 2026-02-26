"use client";

import { createEditPage } from "@/components/create-edit-page";
import { useAdjustmentTypeById } from "@/hooks/use-adjustment-type";
import { AdjustmentTypeForm } from "../_components/adjustment-type-form";

export default createEditPage({
  useById: useAdjustmentTypeById,
  notFoundMessage: "Adjustment type not found",
  render: (adjustmentType) => <AdjustmentTypeForm adjustmentType={adjustmentType} />,
});
