"use client";

import { use } from "react";
import { useStoreRequisitionById } from "@/hooks/use-store-requisition";
import { StoreRequisitionForm } from "../_components/sr-form";
import { ErrorState } from "@/components/ui/error-state";
import { FormSkeleton } from "@/components/loader/form-skeleton";

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

  if (isLoading) return <FormSkeleton />;
  if (error)
    return <ErrorState message={error.message} onRetry={() => refetch()} />;
  if (!storeRequisition)
    return <ErrorState message="Store requisition not found" />;

  return <StoreRequisitionForm storeRequisition={storeRequisition} />;
}
