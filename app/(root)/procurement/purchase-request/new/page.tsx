"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { PurchaseRequestForm } from "../_components/pr-form";
import { usePurchaseRequestTemplates } from "@/hooks/use-purchase-request";
import { FormSkeleton } from "@/components/loader/form-skeleton";

function NewPurchaseRequestContent() {
  const searchParams = useSearchParams();
  const templateId = searchParams.get("template_id");

  const { data: templates, isLoading } = usePurchaseRequestTemplates();

  if (templateId && isLoading) {
    return <FormSkeleton />;
  }

  const template = templateId
    ? templates?.find((t) => t.id === templateId)
    : undefined;

  return <PurchaseRequestForm template={template} />;
}

export default function NewPurchaseRequestPage() {
  return (
    <Suspense fallback={<FormSkeleton />}>
      <NewPurchaseRequestContent />
    </Suspense>
  );
}
