"use client";

import { use } from "react";
import { useVendorById } from "@/hooks/use-vendor";
import { VendorForm } from "../_components/vendor-form";
import { ErrorState } from "@/components/ui/error-state";
import { FormSkeleton } from "@/components/loader/form-skeleton";

export default function EditVendorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data: vendor, isLoading, error, refetch } = useVendorById(id);

  if (isLoading) return <FormSkeleton />;
  if (error)
    return <ErrorState message={error.message} onRetry={() => refetch()} />;
  if (!vendor) return <ErrorState message="Vendor not found" />;

  return <VendorForm vendor={vendor} />;
}
