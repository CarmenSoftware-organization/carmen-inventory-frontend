"use client";

import { createEditPage } from "@/components/create-edit-page";
import { usePeriodEndById } from "@/hooks/use-period-end";
import { PeForm } from "../_components/pe-form";

export default createEditPage({
  useById: usePeriodEndById,
  notFoundMessage: "Period end not found",
  render: (periodEnd) => <PeForm periodEnd={periodEnd} />,
});
