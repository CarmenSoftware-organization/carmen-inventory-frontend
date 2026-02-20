import type { Metadata } from "next";
import { AdjustmentTypeForm } from "../_components/adjustment-type-form";

export const metadata: Metadata = { title: "New Adjustment Type" };

export default function NewAdjustmentTypePage() {
  return <AdjustmentTypeForm />;
}
