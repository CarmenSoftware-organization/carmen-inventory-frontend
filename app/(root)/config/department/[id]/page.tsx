"use client";

import { use } from "react";
import { useDepartmentById } from "@/hooks/use-department";
import { DepartmentForm } from "../_components/department-form";
import { ErrorState } from "@/components/ui/error-state";

export default function EditDepartmentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data: department, isLoading, error, refetch } =
    useDepartmentById(id);

  if (isLoading)
    return (
      <div className="p-6 text-sm text-muted-foreground">Loading...</div>
    );
  if (error)
    return <ErrorState message={error.message} onRetry={() => refetch()} />;
  if (!department) return <ErrorState message="Department not found" />;

  return <DepartmentForm department={department} />;
}
