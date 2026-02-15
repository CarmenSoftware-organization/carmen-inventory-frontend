"use client";

import { use } from "react";
import { usePurchaseRequestById } from "@/hooks/use-purchase-request";
import { PurchaseRequestForm } from "../_components/purchase-request-form";
import { ErrorState } from "@/components/ui/error-state";

export default function EditPurchaseRequestPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const {
    data: purchaseRequest,
    isLoading,
    error,
    refetch,
  } = usePurchaseRequestById(id);

  if (isLoading)
    return (
      <div className="p-6 text-sm text-muted-foreground">Loading...</div>
    );
  if (error)
    return <ErrorState message={error.message} onRetry={() => refetch()} />;
  if (!purchaseRequest)
    return <ErrorState message="Purchase request not found" />;

  return <PurchaseRequestForm purchaseRequest={purchaseRequest} />;
}
