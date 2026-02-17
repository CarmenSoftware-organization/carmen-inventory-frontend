"use client";

import { use } from "react";
import { usePhysicalCountById } from "@/hooks/use-physical-count";
import { PcForm } from "../_components/pc-form";
import { ErrorState } from "@/components/ui/error-state";

export default function EditPhysicalCountPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data: physicalCount, isLoading, error, refetch } =
    usePhysicalCountById(id);

  if (isLoading)
    return (
      <div className="p-6 text-sm text-muted-foreground">Loading...</div>
    );
  if (error)
    return <ErrorState message={error.message} onRetry={() => refetch()} />;
  if (!physicalCount)
    return <ErrorState message="Physical count not found" />;

  return <PcForm physicalCount={physicalCount} />;
}
