"use client";

import { createEditPage } from "@/components/create-edit-page";
import { useSpotCheckById } from "@/hooks/use-spot-check";
import { ScForm } from "../_components/sc-form";

export default createEditPage({
  useById: useSpotCheckById,
  notFoundMessage: "Spot check not found",
  render: (spotCheck) => <ScForm spotCheck={spotCheck} />,
});
