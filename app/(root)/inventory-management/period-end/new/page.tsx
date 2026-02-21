import type { Metadata } from "next";
import { PeForm } from "../_components/pe-form";

export const metadata: Metadata = { title: "New Period End" };

export default function NewPeriodEndPage() {
  return <PeForm />;
}
