import type { Metadata } from "next";
import { ScForm } from "../_components/sc-form";

export const metadata: Metadata = { title: "New Spot Check" };

export default function NewSpotCheckPage() {
  return <ScForm />;
}
