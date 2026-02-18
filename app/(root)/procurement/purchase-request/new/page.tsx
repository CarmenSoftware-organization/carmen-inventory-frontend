"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { PurchaseRequestForm } from "../_components/pr-form";
import { usePurchaseRequestTemplates } from "@/hooks/use-purchase-request";

function NewPurchaseRequestContent() {
  const searchParams = useSearchParams();
  const templateId = searchParams.get("template_id");

  const { data: templates, isLoading } = usePurchaseRequestTemplates();

  if (templateId && isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const template = templateId
    ? templates?.find((t) => t.id === templateId)
    : undefined;

  return <PurchaseRequestForm template={template} />;
}

export default function NewPurchaseRequestPage() {
  return (
    <Suspense>
      <NewPurchaseRequestContent />
    </Suspense>
  );
}
