"use client";

import { createEditPage } from "@/components/create-edit-page";
import { useRecipeCategoryById } from "@/hooks/use-recipe-category";
import { RecipeCategoryForm } from "../_components/recipe-category-form";

export default createEditPage({
  useById: useRecipeCategoryById,
  notFoundMessage: "Recipe category not found",
  render: (category) => <RecipeCategoryForm category={category} />,
});
