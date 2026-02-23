"use client";

import { use } from "react";
import { useWastageReportById } from "@/hooks/use-wastage-report";
import { WastageReportForm } from "../_components/wr-form";
import { ErrorState } from "@/components/ui/error-state";

export default function EditWastageReportPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data: wastageReport, isLoading, error, refetch } =
    useWastageReportById(id);

  if (isLoading)
    return (
      <div className="p-6 text-sm text-muted-foreground">Loading...</div>
    );
  if (error)
    return <ErrorState message={error.message} onRetry={() => refetch()} />;
  if (!wastageReport)
    return <ErrorState message="Wastage report not found" />;

  return <WastageReportForm wastageReport={wastageReport} />;
}
