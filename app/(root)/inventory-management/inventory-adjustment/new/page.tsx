"use client";

import { useSearchParams } from "next/navigation";
import { InventoryAdjustmentForm } from "../_components/inventory-adjustment-form";
import { ErrorState } from "@/components/ui/error-state";
import type { InventoryAdjustmentType } from "@/types/inventory-adjustment";

export default function NewInventoryAdjustmentPage() {
  const searchParams = useSearchParams();
  const type = searchParams.get("type") as InventoryAdjustmentType | null;

  if (!type || (type !== "stock-in" && type !== "stock-out")) {
    return <ErrorState message="Invalid adjustment type. Use ?type=stock-in or ?type=stock-out" />;
  }

  return <InventoryAdjustmentForm adjustmentType={type} />;
}
