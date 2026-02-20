import type { Metadata } from "next";
import RecipeCategoryComponent from "./_components/recipe-category-component";

export const metadata: Metadata = { title: "Recipe Categories" };

export default function RecipeCategoryPage() {
  return <RecipeCategoryComponent />;
}
