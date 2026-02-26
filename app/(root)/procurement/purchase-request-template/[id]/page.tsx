"use client";

import { createEditPage } from "@/components/create-edit-page";
import { usePrtById } from "@/hooks/use-prt";
import { PrtForm } from "../_components/prt-form";

export default createEditPage({
  useById: usePrtById,
  notFoundMessage: "Template not found",
  render: (template) => <PrtForm template={template} />,
});
