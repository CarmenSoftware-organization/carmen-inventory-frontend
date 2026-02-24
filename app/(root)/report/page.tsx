import { Metadata } from "next";
import ReportComponent from "./_components/report-component";

export const metadata: Metadata = { title: "Report" };

export default function ReportPage() {
  return <ReportComponent />;
}
