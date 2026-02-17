"use client";

import { use } from "react";
import { useSpotCheckById } from "@/hooks/use-spot-check";
import { ScForm } from "../_components/sc-form";
import { ErrorState } from "@/components/ui/error-state";

export default function EditSpotCheckPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data: spotCheck, isLoading, error, refetch } = useSpotCheckById(id);

  if (isLoading)
    return (
      <div className="p-6 text-sm text-muted-foreground">Loading...</div>
    );
  if (error)
    return <ErrorState message={error.message} onRetry={() => refetch()} />;
  if (!spotCheck) return <ErrorState message="Spot check not found" />;

  return <ScForm spotCheck={spotCheck} />;
}
