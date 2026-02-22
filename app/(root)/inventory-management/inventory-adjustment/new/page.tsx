"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { InventoryAdjustmentForm } from "../_components/inv-adj-form";
import { ErrorState } from "@/components/ui/error-state";
import type { InventoryAdjustmentType } from "@/types/inventory-adjustment";

function NewInventoryAdjustmentContent() {
  const searchParams = useSearchParams();
  const type = searchParams.get("type") as InventoryAdjustmentType | null;

  if (!type || (type !== "stock-in" && type !== "stock-out")) {
    return <ErrorState message="Invalid adjustment type. Use ?type=stock-in or ?type=stock-out" />;
  }

  return <InventoryAdjustmentForm adjustmentType={type} />;
}

export default function NewInventoryAdjustmentPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center py-20">
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
        </div>
      }
    >
      <NewInventoryAdjustmentContent />
    </Suspense>
  );
}
