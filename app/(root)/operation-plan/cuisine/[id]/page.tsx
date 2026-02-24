"use client";

import { use } from "react";
import { useCuisineById } from "@/hooks/use-cuisine";
import { CuisineForm } from "../_components/cuisine-form";
import { ErrorState } from "@/components/ui/error-state";
import { FormSkeleton } from "@/components/loader/form-skeleton";

export default function EditCuisinePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data: cuisine, isLoading, error, refetch } = useCuisineById(id);

  if (isLoading) return <FormSkeleton />;
  if (error)
    return <ErrorState message={error.message} onRetry={() => refetch()} />;
  if (!cuisine) return <ErrorState message="Cuisine not found" />;

  return <CuisineForm cuisine={cuisine} />;
}
