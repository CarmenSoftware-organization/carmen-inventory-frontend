import type { Metadata } from "next";
import { PcForm } from "../_components/pc-form";

export const metadata: Metadata = { title: "New Physical Count" };

export default function NewPhysicalCountPage() {
  return <PcForm />;
}
