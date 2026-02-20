"use client";

import { Suspense, use } from "react";
import { Loader2 } from "lucide-react";
import { useProductById } from "@/hooks/use-product";
import { ProductForm } from "../_components/pd-form";
import { ErrorState } from "@/components/ui/error-state";

function EditProductContent({ id }: { id: string }) {
  const { data: product, isLoading, error, refetch } = useProductById(id);

  if (isLoading)
    return <div className="p-6 text-sm text-muted-foreground">Loading...</div>;
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
    <Suspense
      fallback={
        <div className="flex items-center justify-center py-20">
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
        </div>
      }
    >
      <EditProductContent id={id} />
    </Suspense>
  );
}
