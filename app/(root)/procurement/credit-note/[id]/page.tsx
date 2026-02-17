"use client";

import { use } from "react";
import { useCreditNoteById } from "@/hooks/use-credit-note";
import { CnForm } from "../_components/cn-form";
import { ErrorState } from "@/components/ui/error-state";

export default function EditCreditNotePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data: creditNote, isLoading, error, refetch } = useCreditNoteById(id);

  if (isLoading)
    return (
      <div className="p-6 text-sm text-muted-foreground">Loading...</div>
    );
  if (error)
    return <ErrorState message={error.message} onRetry={() => refetch()} />;
  if (!creditNote) return <ErrorState message="Credit note not found" />;

  return <CnForm creditNote={creditNote} />;
}
