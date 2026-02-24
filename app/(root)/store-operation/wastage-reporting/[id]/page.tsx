"use client";

import { use } from "react";
import { useWastageReportById } from "@/hooks/use-wastage-report";
import { WastageReportForm } from "../_components/wr-form";
import { ErrorState } from "@/components/ui/error-state";
import { FormSkeleton } from "@/components/loader/form-skeleton";

export default function EditWastageReportPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data: wastageReport, isLoading, error, refetch } =
    useWastageReportById(id);

  if (isLoading) return <FormSkeleton />;
  if (error)
    return <ErrorState message={error.message} onRetry={() => refetch()} />;
  if (!wastageReport)
    return <ErrorState message="Wastage report not found" />;

  return <WastageReportForm wastageReport={wastageReport} />;
}
