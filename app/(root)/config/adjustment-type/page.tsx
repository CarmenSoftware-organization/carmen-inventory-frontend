import type { Metadata } from "next";
import AdjustmentTypeComponent from "./_components/adjustment-type-component";

export const metadata: Metadata = { title: "Adjustment Types" };

export default function AdjustmentTypePage() {
  return <AdjustmentTypeComponent />;
}
