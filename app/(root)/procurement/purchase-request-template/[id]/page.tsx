"use client";

import { use } from "react";
import { usePrtById } from "@/hooks/use-prt";
import { PrtForm } from "../_components/prt-form";
import { ErrorState } from "@/components/ui/error-state";
import { FormSkeleton } from "@/components/loader/form-skeleton";

export default function EditPurchaseRequestTemplatePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data: template, isLoading, error, refetch } = usePrtById(id);

  if (isLoading) return <FormSkeleton />;
  if (error)
    return <ErrorState message={error.message} onRetry={() => refetch()} />;
  if (!template) return <ErrorState message="Template not found" />;

  return <PrtForm template={template} />;
}
