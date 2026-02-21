import type { Metadata } from "next";
import { RecipeForm } from "../_components/recipe-form";

export const metadata: Metadata = { title: "New Recipe" };

export default function NewRecipePage() {
  return <RecipeForm />;
}
