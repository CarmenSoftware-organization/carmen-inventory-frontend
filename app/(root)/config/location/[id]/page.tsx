"use client";

import { use } from "react";
import { useLocationById } from "@/hooks/use-location";
import { LocationForm } from "../_components/location-form";
import { ErrorState } from "@/components/ui/error-state";
import { FormSkeleton } from "@/components/loader/form-skeleton";

export default function EditLocationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data: location, isLoading, error, refetch } = useLocationById(id);

  if (isLoading) return <FormSkeleton />;
  if (error)
    return <ErrorState message={error.message} onRetry={() => refetch()} />;
  if (!location) return <ErrorState message="Location not found" />;

  return <LocationForm location={location} />;
}
