import type { Metadata } from "next";
import CuisineComponent from "./_components/cuisine-component";

export const metadata: Metadata = { title: "Cuisines" };

export default function CuisinePage() {
  return <CuisineComponent />;
}
