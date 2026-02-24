"use client";

import { use } from "react";
import { usePhysicalCountById } from "@/hooks/use-physical-count";
import { PcForm } from "../_components/pc-form";
import { ErrorState } from "@/components/ui/error-state";
import { FormSkeleton } from "@/components/loader/form-skeleton";

export default function EditPhysicalCountPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data: physicalCount, isLoading, error, refetch } =
    usePhysicalCountById(id);

  if (isLoading) return <FormSkeleton />;
  if (error)
    return <ErrorState message={error.message} onRetry={() => refetch()} />;
  if (!physicalCount)
    return <ErrorState message="Physical count not found" />;

  return <PcForm physicalCount={physicalCount} />;
}
