"use client";

import { use } from "react";
import { useGoodsReceiveNoteById } from "@/hooks/use-goods-receive-note";
import { GrnForm } from "../_components/grn-form";
import { ErrorState } from "@/components/ui/error-state";

export default function EditGoodsReceiveNotePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data: goodsReceiveNote, isLoading, error, refetch } = useGoodsReceiveNoteById(id);

  if (isLoading)
    return (
      <div className="p-6 text-sm text-muted-foreground">Loading...</div>
    );
  if (error)
    return <ErrorState message={error.message} onRetry={() => refetch()} />;
  if (!goodsReceiveNote) return <ErrorState message="Goods receive note not found" />;

  return <GrnForm goodsReceiveNote={goodsReceiveNote} />;
}
