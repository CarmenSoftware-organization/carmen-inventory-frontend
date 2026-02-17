"use client";

import { use } from "react";
import { useUserById } from "@/hooks/use-user";
import { UserAssignedForm } from "../_components/user-assigned-form";
import { ErrorState } from "@/components/ui/error-state";

export default function UserDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data: user, isLoading, error, refetch } = useUserById(id);

  if (isLoading)
    return (
      <div className="p-6 text-sm text-muted-foreground">Loading...</div>
    );
  if (error)
    return <ErrorState message={error.message} onRetry={() => refetch()} />;
  if (!user) return <ErrorState message="User not found" />;

  return <UserAssignedForm user={user} />;
}
