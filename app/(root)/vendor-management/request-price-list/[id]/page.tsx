"use client";

import { use } from "react";
import { useRequestPriceListById } from "@/hooks/use-request-price-list";
import { RequestPriceListForm } from "../_components/request-price-list-form";
import { ErrorState } from "@/components/ui/error-state";

export default function EditRequestPriceListPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const {
    data: requestPriceList,
    isLoading,
    error,
    refetch,
  } = useRequestPriceListById(id);

  if (isLoading)
    return (
      <div className="p-6 text-sm text-muted-foreground">Loading...</div>
    );
  if (error)
    return <ErrorState message={error.message} onRetry={() => refetch()} />;
  if (!requestPriceList)
    return <ErrorState message="Request price list not found" />;

  return <RequestPriceListForm requestPriceList={requestPriceList} />;
}
