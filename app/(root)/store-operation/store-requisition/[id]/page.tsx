"use client";

import { use } from "react";
import { useStoreRequisitionById } from "@/hooks/use-store-requisition";
import { StoreRequisitionForm } from "../_components/store-requisition-form";
import { ErrorState } from "@/components/ui/error-state";

export default function EditStoreRequisitionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const {
    data: storeRequisition,
    isLoading,
    error,
    refetch,
  } = useStoreRequisitionById(id);

  if (isLoading)
    return (
      <div className="p-6 text-sm text-muted-foreground">Loading...</div>
    );
  if (error)
    return <ErrorState message={error.message} onRetry={() => refetch()} />;
  if (!storeRequisition)
    return <ErrorState message="Store requisition not found" />;

  return <StoreRequisitionForm storeRequisition={storeRequisition} />;
}
