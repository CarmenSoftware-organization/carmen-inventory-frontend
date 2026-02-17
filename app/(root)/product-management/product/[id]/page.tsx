"use client";

import { use } from "react";
import { useProductById } from "@/hooks/use-product";
import { ProductForm } from "../_components/pd-form";
import { ErrorState } from "@/components/ui/error-state";

export default function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data: product, isLoading, error, refetch } = useProductById(id);

  if (isLoading)
    return <div className="p-6 text-sm text-muted-foreground">Loading...</div>;
  if (error)
    return <ErrorState message={error.message} onRetry={() => refetch()} />;
  if (!product) return <ErrorState message="Product not found" />;

  return <ProductForm product={product} />;
}
