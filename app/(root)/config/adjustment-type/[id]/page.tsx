"use client";

import { use } from "react";
import { useAdjustmentTypeById } from "@/hooks/use-adjustment-type";
import { AdjustmentTypeForm } from "../_components/adjustment-type-form";
import { ErrorState } from "@/components/ui/error-state";

export default function EditAdjustmentTypePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const {
    data: adjustmentType,
    isLoading,
    error,
    refetch,
  } = useAdjustmentTypeById(id);

  if (isLoading)
    return (
      <div className="p-6 text-sm text-muted-foreground">Loading...</div>
    );
  if (error)
    return <ErrorState message={error.message} onRetry={() => refetch()} />;
  if (!adjustmentType)
    return <ErrorState message="Adjustment type not found" />;

  return <AdjustmentTypeForm adjustmentType={adjustmentType} />;
}
