"use client";

import { use } from "react";
import { usePriceListById } from "@/hooks/use-price-list";
import { PriceListForm } from "../_components/price-list-form";
import { ErrorState } from "@/components/ui/error-state";

export default function EditPriceListPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data: priceList, isLoading, error, refetch } = usePriceListById(id);

  if (isLoading)
    return (
      <div className="p-6 text-sm text-muted-foreground">Loading...</div>
    );
  if (error)
    return <ErrorState message={error.message} onRetry={() => refetch()} />;
  if (!priceList) return <ErrorState message="Price list not found" />;

  return <PriceListForm priceList={priceList} />;
}
