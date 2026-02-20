"use client";

import { use } from "react";
import { useRecipeCategoryById } from "@/hooks/use-recipe-category";
import { RecipeCategoryForm } from "../_components/recipe-category-form";
import { ErrorState } from "@/components/ui/error-state";

export default function EditRecipeCategoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const {
    data: category,
    isLoading,
    error,
    refetch,
  } = useRecipeCategoryById(id);

  if (isLoading)
    return (
      <div className="p-6 text-sm text-muted-foreground">Loading...</div>
    );
  if (error)
    return <ErrorState message={error.message} onRetry={() => refetch()} />;
  if (!category) return <ErrorState message="Recipe category not found" />;

  return <RecipeCategoryForm category={category} />;
}
