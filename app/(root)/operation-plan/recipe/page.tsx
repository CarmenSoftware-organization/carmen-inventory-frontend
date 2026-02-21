import type { Metadata } from "next";
import RecipeComponent from "./_components/recipe-component";

export const metadata: Metadata = { title: "Recipes" };

export default function RecipePage() {
  return <RecipeComponent />;
}
