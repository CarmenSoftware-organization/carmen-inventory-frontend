"use client";

import type { ReactNode } from "react";
import { useParams } from "next/navigation";
import { FormSkeleton } from "@/components/loader/form-skeleton";
import { ErrorState } from "@/components/ui/error-state";

interface UseByIdResult<T> {
  data: T | undefined;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

export function createEditPage<T>(options: {
  useById: (id: string) => UseByIdResult<T>;
  notFoundMessage: string;
  render: (data: T) => ReactNode;
}) {
  return function EditPageContent() {
    const { id } = useParams<{ id: string }>();
    const { data, isLoading, error, refetch } = options.useById(id);

    if (isLoading) return <FormSkeleton />;
    if (error)
      return <ErrorState message={error.message} onRetry={() => refetch()} />;
    if (!data) return <ErrorState message={options.notFoundMessage} />;

    return <>{options.render(data)}</>;
  };
}
