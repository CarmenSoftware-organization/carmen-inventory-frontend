"use client";

import { use } from "react";
import { useInventoryAdjustmentById } from "@/hooks/use-inventory-adjustment";
import { InventoryAdjustmentForm } from "../_components/inv-adj-form";
import { ErrorState } from "@/components/ui/error-state";

export default function EditInventoryAdjustmentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const {
    data: inventoryAdjustment,
    isLoading,
    error,
    refetch,
  } = useInventoryAdjustmentById(id);

  if (isLoading)
    return (
      <div className="p-6 text-sm text-muted-foreground">Loading...</div>
    );
  if (error)
    return <ErrorState message={error.message} onRetry={() => refetch()} />;
  if (!inventoryAdjustment)
    return <ErrorState message="Inventory adjustment not found" />;

  return (
    <InventoryAdjustmentForm
      adjustmentType={inventoryAdjustment.type}
      inventoryAdjustment={inventoryAdjustment}
    />
  );
}
