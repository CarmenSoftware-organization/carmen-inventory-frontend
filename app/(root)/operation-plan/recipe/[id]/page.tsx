"use client";

import { use } from "react";
import { useRecipeById } from "@/hooks/use-recipe";
import { RecipeForm } from "../_components/recipe-form";
import { ErrorState } from "@/components/ui/error-state";

export default function EditRecipePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data: recipe, isLoading, error, refetch } = useRecipeById(id);

  if (isLoading)
    return (
      <div className="p-6 text-sm text-muted-foreground">Loading...</div>
    );
  if (error)
    return <ErrorState message={error.message} onRetry={() => refetch()} />;
  if (!recipe) return <ErrorState message="Recipe not found" />;

  return <RecipeForm recipe={recipe} />;
}
