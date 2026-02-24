"use client";

import { Suspense, use } from "react";
import { useProductById } from "@/hooks/use-product";
import { ProductForm } from "../_components/pd-form";
import { ErrorState } from "@/components/ui/error-state";
import { FormSkeleton } from "@/components/loader/form-skeleton";

function EditProductContent({ id }: { id: string }) {
  const { data: product, isLoading, error, refetch } = useProductById(id);

  if (isLoading) return <FormSkeleton />;
  if (error)
    return <ErrorState message={error.message} onRetry={() => refetch()} />;
  if (!product) return <ErrorState message="Product not found" />;

  return <ProductForm product={product} />;
}

export default function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  return (
    <Suspense fallback={<FormSkeleton />}>
      <EditProductContent id={id} />
    </Suspense>
  );
}
