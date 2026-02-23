import type { Metadata } from "next";
import { WastageReportForm } from "../_components/wr-form";

export const metadata: Metadata = { title: "New Wastage Report" };

export default function NewWastageReportPage() {
  return <WastageReportForm />;
}
