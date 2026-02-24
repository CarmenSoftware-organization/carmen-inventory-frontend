"use client";

import { use } from "react";
import { useUserById } from "@/hooks/use-user";
import { UserAssignedForm } from "../_components/user-assigned-form";
import { ErrorState } from "@/components/ui/error-state";
import { FormSkeleton } from "@/components/loader/form-skeleton";

export default function UserDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data: user, isLoading, error, refetch } = useUserById(id);

  if (isLoading) return <FormSkeleton />;
  if (error)
    return <ErrorState message={error.message} onRetry={() => refetch()} />;
  if (!user) return <ErrorState message="User not found" />;

  return <UserAssignedForm user={user} />;
}
