"use client";

import { use } from "react";
import { useApprovalById } from "@/hooks/use-approval";
import { ErrorState } from "@/components/ui/error-state";
import { ApprovalDetail } from "../_components/approval-detail";

export default function ApprovalDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data: item, isLoading, error, refetch } = useApprovalById(id);

  if (isLoading)
    return (
      <div className="p-6 text-sm text-muted-foreground">Loading...</div>
    );
  if (error)
    return <ErrorState message={error.message} onRetry={() => refetch()} />;
  if (!item) return <ErrorState message="Approval item not found" />;

  return <ApprovalDetail item={item} />;
}
