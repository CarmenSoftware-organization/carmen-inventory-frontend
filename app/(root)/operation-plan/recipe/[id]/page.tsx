"use client";

import { createEditPage } from "@/components/create-edit-page";
import { useRecipeById } from "@/hooks/use-recipe";
import { RecipeForm } from "../_components/recipe-form";

export default createEditPage({
  useById: useRecipeById,
  notFoundMessage: "Recipe not found",
  render: (recipe) => <RecipeForm recipe={recipe} />,
});
