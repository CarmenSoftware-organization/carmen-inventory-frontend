"use client";

import { use } from "react";
import { usePurchaseOrderById } from "@/hooks/use-purchase-order";
import { PoForm } from "../_components/po-form";
import { ErrorState } from "@/components/ui/error-state";

export default function EditPurchaseOrderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data: purchaseOrder, isLoading, error, refetch } =
    usePurchaseOrderById(id);

  if (isLoading)
    return (
      <div className="p-6 text-sm text-muted-foreground">Loading...</div>
    );
  if (error)
    return <ErrorState message={error.message} onRetry={() => refetch()} />;
  if (!purchaseOrder)
    return <ErrorState message="Purchase order not found" />;

  return <PoForm purchaseOrder={purchaseOrder} />;
}
