import type { Metadata } from "next";
import { CuisineForm } from "../_components/cuisine-form";

export const metadata: Metadata = { title: "New Cuisine" };

export default function NewCuisinePage() {
  return <CuisineForm />;
}
