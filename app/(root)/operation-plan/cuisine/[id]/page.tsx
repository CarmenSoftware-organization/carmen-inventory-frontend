"use client";

import { use } from "react";
import { useCuisineById } from "@/hooks/use-cuisine";
import { CuisineForm } from "../_components/cuisine-form";
import { ErrorState } from "@/components/ui/error-state";

export default function EditCuisinePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data: cuisine, isLoading, error, refetch } = useCuisineById(id);

  if (isLoading)
    return (
      <div className="p-6 text-sm text-muted-foreground">Loading...</div>
    );
  if (error)
    return <ErrorState message={error.message} onRetry={() => refetch()} />;
  if (!cuisine) return <ErrorState message="Cuisine not found" />;

  return <CuisineForm cuisine={cuisine} />;
}
