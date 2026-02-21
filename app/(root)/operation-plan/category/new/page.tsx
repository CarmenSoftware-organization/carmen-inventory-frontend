import type { Metadata } from "next";
import { RecipeCategoryForm } from "../_components/recipe-category-form";

export const metadata: Metadata = { title: "New Recipe Category" };

export default function NewRecipeCategoryPage() {
  return <RecipeCategoryForm />;
}
