"use client";

import { use } from "react";
import { usePeriodEndById } from "@/hooks/use-period-end";
import { PeForm } from "../_components/pe-form";
import { ErrorState } from "@/components/ui/error-state";
import { FormSkeleton } from "@/components/loader/form-skeleton";

export default function EditPeriodEndPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data: periodEnd, isLoading, error, refetch } = usePeriodEndById(id);

  if (isLoading) return <FormSkeleton />;
  if (error)
    return <ErrorState message={error.message} onRetry={() => refetch()} />;
  if (!periodEnd) return <ErrorState message="Period end not found" />;

  return <PeForm periodEnd={periodEnd} />;
}
