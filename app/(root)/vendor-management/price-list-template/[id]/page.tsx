"use client";

import { use } from "react";
import { usePriceListTemplateById } from "@/hooks/use-price-list-template";
import { PriceListTemplateForm } from "../_components/price-list-template-form";
import { ErrorState } from "@/components/ui/error-state";

export default function EditPriceListTemplatePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const {
    data: priceListTemplate,
    isLoading,
    error,
    refetch,
  } = usePriceListTemplateById(id);

  if (isLoading)
    return (
      <div className="p-6 text-sm text-muted-foreground">Loading...</div>
    );
  if (error)
    return <ErrorState message={error.message} onRetry={() => refetch()} />;
  if (!priceListTemplate)
    return <ErrorState message="Price list template not found" />;

  return <PriceListTemplateForm priceListTemplate={priceListTemplate} />;
}
