"use client";

import { use, useMemo } from "react";
import { useWorkflowById } from "@/hooks/use-workflow";
import { useUser } from "@/hooks/use-user";
import { useProduct } from "@/hooks/use-product";
import { ErrorState } from "@/components/ui/error-state";
import { FormSkeleton } from "@/components/loader/form-skeleton";
import { WfDetail } from "../_components/wf-detail";

export default function EditWorkflowPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const {
    data: workflow,
    isLoading: wfLoading,
    error: wfError,
    refetch: wfRefetch,
  } = useWorkflowById(id);
  const { data: userData, isLoading: userLoading } = useUser();
  const { data: productData, isLoading: productLoading } = useProduct();

  const isLoading = wfLoading || userLoading || productLoading;

  const users = userData?.data ?? [];
  const products = useMemo(
    () =>
      (productData?.data ?? []).map((p) => ({
        id: p.id,
        code: p.code,
        name: p.name,
        local_name: p.local_name,
        description: p.description,
        product_status_type: p.product_status_type,
        inventory_unit: {
          id: p.inventory_unit?.id ?? "",
          name: p.inventory_unit?.name ?? "",
        },
        product_item_group: {
          id: p.product_item_group?.id ?? "",
          name: p.product_item_group?.name ?? "",
        },
        product_sub_category: {
          id: p.product_sub_category?.id ?? "",
          name: p.product_sub_category?.name ?? "",
        },
        product_category: {
          id: p.product_category?.id ?? "",
          name: p.product_category?.name ?? "",
        },
      })),
    [productData],
  );

  if (isLoading) return <FormSkeleton />;
  if (wfError)
    return (
      <ErrorState message={wfError.message} onRetry={() => wfRefetch()} />
    );
  if (!workflow) return <ErrorState message="Workflow not found" />;

  return <WfDetail workflow={workflow} users={users} products={products} />;
}
