import type { Metadata } from "next";
import CategoryComponent from "./_components/category-component";

export const metadata: Metadata = { title: "Categories" };

export default function CategoryPage() {
  return <CategoryComponent />;
}
