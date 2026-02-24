"use client";

import { use } from "react";
import { useRequestPriceListById } from "@/hooks/use-request-price-list";
import { RequestPriceListForm } from "../_components/rpl-form";
import { ErrorState } from "@/components/ui/error-state";
import { FormSkeleton } from "@/components/loader/form-skeleton";

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

  if (isLoading) return <FormSkeleton />;
  if (error)
    return <ErrorState message={error.message} onRetry={() => refetch()} />;
  if (!requestPriceList)
    return <ErrorState message="Request price list not found" />;

  return <RequestPriceListForm requestPriceList={requestPriceList} />;
}
