"use client";

import { use } from "react";
import { useGoodsReceiveNoteById } from "@/hooks/use-goods-receive-note";
import { GrnForm } from "../_components/grn-form";
import { ErrorState } from "@/components/ui/error-state";
import { FormSkeleton } from "@/components/loader/form-skeleton";

export default function EditGoodsReceiveNotePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data: goodsReceiveNote, isLoading, error, refetch } = useGoodsReceiveNoteById(id);

  if (isLoading) return <FormSkeleton />;
  if (error)
    return <ErrorState message={error.message} onRetry={() => refetch()} />;
  if (!goodsReceiveNote) return <ErrorState message="Goods receive note not found" />;

  return <GrnForm goodsReceiveNote={goodsReceiveNote} />;
}
