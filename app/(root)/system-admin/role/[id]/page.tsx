"use client";

import { use } from "react";
import { useRoleById } from "@/hooks/use-role";
import { RoleForm } from "../_components/role-form";
import { ErrorState } from "@/components/ui/error-state";
import { FormSkeleton } from "@/components/loader/form-skeleton";

export default function EditRolePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data: role, isLoading, error, refetch } = useRoleById(id);

  if (isLoading) return <FormSkeleton />;
  if (error)
    return <ErrorState message={error.message} onRetry={() => refetch()} />;
  if (!role) return <ErrorState message="Role not found" />;

  return <RoleForm role={role} />;
}
