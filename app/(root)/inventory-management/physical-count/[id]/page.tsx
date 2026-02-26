"use client";

import { createEditPage } from "@/components/create-edit-page";
import { usePhysicalCountById } from "@/hooks/use-physical-count";
import { PcForm } from "../_components/pc-form";

export default createEditPage({
  useById: usePhysicalCountById,
  notFoundMessage: "Physical count not found",
  render: (physicalCount) => <PcForm physicalCount={physicalCount} />,
});
