"use client";

import { use } from "react";
import { useSearchParams } from "next/navigation";
import { useInventoryAdjustmentById } from "@/hooks/use-inventory-adjustment";
import { InventoryAdjustmentForm } from "../_components/inv-adj-form";
import { ErrorState } from "@/components/ui/error-state";
import type { InventoryAdjustmentType } from "@/types/inventory-adjustment";

const VALID_TYPES = new Set<string>(["stock-in", "stock-out"]);

export default function EditInventoryAdjustmentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const searchParams = useSearchParams();
  const rawType = searchParams.get("type");
  const type = rawType && VALID_TYPES.has(rawType)
    ? (rawType as InventoryAdjustmentType)
    : undefined;

  const {
    data: inventoryAdjustment,
    isLoading,
    error,
    refetch,
  } = useInventoryAdjustmentById(id, type);

  if (!type)
    return <ErrorState message="Invalid adjustment type" />;
  if (isLoading)
    return <div className="p-6 text-sm text-muted-foreground">Loading...</div>;
  if (error)
    return <ErrorState message={error.message} onRetry={() => refetch()} />;
  if (!inventoryAdjustment)
    return <ErrorState message="Inventory adjustment not found" />;

  return (
    <InventoryAdjustmentForm
      adjustmentType={type}
      inventoryAdjustment={inventoryAdjustment}
    />
  );
}
