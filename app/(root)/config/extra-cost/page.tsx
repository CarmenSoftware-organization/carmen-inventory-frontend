import type { Metadata } from "next";
import ExtraCostComponent from "./_components/extra-cost-component";

export const metadata: Metadata = { title: "Extra Costs" };

export default function ExtraCostPage() {
  return <ExtraCostComponent />;
}
