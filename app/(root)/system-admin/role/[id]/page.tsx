"use client";

import { use } from "react";
import { useRoleById } from "@/hooks/use-role";
import { RoleForm } from "../_components/role-form";
import { ErrorState } from "@/components/ui/error-state";

export default function EditRolePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data: role, isLoading, error, refetch } = useRoleById(id);

  if (isLoading)
    return (
      <div className="p-6 text-sm text-muted-foreground">Loading...</div>
    );
  if (error)
    return <ErrorState message={error.message} onRetry={() => refetch()} />;
  if (!role) return <ErrorState message="Role not found" />;

  return <RoleForm role={role} />;
}
