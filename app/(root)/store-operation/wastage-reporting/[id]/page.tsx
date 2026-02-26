"use client";

import { createEditPage } from "@/components/create-edit-page";
import { useWastageReportById } from "@/hooks/use-wastage-report";
import { WastageReportForm } from "../_components/wr-form";

export default createEditPage({
  useById: useWastageReportById,
  notFoundMessage: "Wastage report not found",
  render: (wastageReport) => <WastageReportForm wastageReport={wastageReport} />,
});
