"use client";

import { use } from "react";
import { useLocationById } from "@/hooks/use-location";
import { LocationForm } from "../_components/location-form";
import { ErrorState } from "@/components/ui/error-state";

export default function EditLocationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data: location, isLoading, error, refetch } = useLocationById(id);

  if (isLoading)
    return (
      <div className="p-6 text-sm text-muted-foreground">Loading...</div>
    );
  if (error)
    return <ErrorState message={error.message} onRetry={() => refetch()} />;
  if (!location) return <ErrorState message="Location not found" />;

  return <LocationForm location={location} />;
}
