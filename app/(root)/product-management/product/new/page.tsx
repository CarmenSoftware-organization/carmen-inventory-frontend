import type { Metadata } from "next";
import { Suspense } from "react";
import { ProductForm } from "../_components/pd-form";
import { FormSkeleton } from "@/components/loader/form-skeleton";

export const metadata: Metadata = { title: "New Product" };

export default function NewProductPage() {
  return (
    <Suspense fallback={<FormSkeleton />}>
      <ProductForm />
    </Suspense>
  );
}
