"use client";

import { use, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useInventoryAdjustmentById } from "@/hooks/use-inventory-adjustment";
import { InventoryAdjustmentForm } from "../_components/inv-adj-form";
import { ErrorState } from "@/components/ui/error-state";
import type { InventoryAdjustmentType } from "@/types/inventory-adjustment";
import { FormSkeleton } from "@/components/loader/form-skeleton";

const EditInventoryAdjustmentContent = ({ id }: { id: string }) => {
  const searchParams = useSearchParams();
  const type = searchParams.get("type") as InventoryAdjustmentType | null;

  if (!type || (type !== "stock-in" && type !== "stock-out")) {
    return (
      <ErrorState message="Invalid adjustment type. Use ?type=stock-in or ?type=stock-out" />
    );
  }

  return <EditContent id={id} type={type} />;
};

const EditContent = ({
  id,
  type,
}: {
  id: string;
  type: InventoryAdjustmentType;
}) => {
  const {
    data: inventoryAdjustment,
    isLoading,
    error,
    refetch,
  } = useInventoryAdjustmentById(id, type);

  if (!type) return <ErrorState message="Invalid adjustment type" />;
  if (isLoading) return <FormSkeleton />;
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
};

export default function EditInventoryAdjustmentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  return (
    <Suspense>
      <EditInventoryAdjustmentContent id={id} />
    </Suspense>
  );
}
