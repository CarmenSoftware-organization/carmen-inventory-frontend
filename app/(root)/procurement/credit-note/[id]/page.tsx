"use client";

import { createEditPage } from "@/components/create-edit-page";
import { useCreditNoteById } from "@/hooks/use-credit-note";
import { CnForm } from "../_components/cn-form";

export default createEditPage({
  useById: useCreditNoteById,
  notFoundMessage: "Credit note not found",
  render: (creditNote) => <CnForm creditNote={creditNote} />,
});
