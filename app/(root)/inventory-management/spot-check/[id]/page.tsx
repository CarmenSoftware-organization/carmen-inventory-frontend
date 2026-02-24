"use client";

import { use } from "react";
import { useSpotCheckById } from "@/hooks/use-spot-check";
import { ScForm } from "../_components/sc-form";
import { ErrorState } from "@/components/ui/error-state";
import { FormSkeleton } from "@/components/loader/form-skeleton";

export default function EditSpotCheckPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data: spotCheck, isLoading, error, refetch } = useSpotCheckById(id);

  if (isLoading) return <FormSkeleton />;
  if (error)
    return <ErrorState message={error.message} onRetry={() => refetch()} />;
  if (!spotCheck) return <ErrorState message="Spot check not found" />;

  return <ScForm spotCheck={spotCheck} />;
}
