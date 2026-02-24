"use client";

import { use } from "react";
import { usePurchaseRequestById } from "@/hooks/use-purchase-request";
import { PurchaseRequestForm } from "../_components/pr-form";
import { ErrorState } from "@/components/ui/error-state";
import { FormSkeleton } from "@/components/loader/form-skeleton";

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

  if (isLoading) return <FormSkeleton />;
  if (error)
    return <ErrorState message={error.message} onRetry={() => refetch()} />;
  if (!purchaseRequest)
    return <ErrorState message="Purchase request not found" />;

  return <PurchaseRequestForm purchaseRequest={purchaseRequest} />;
}
