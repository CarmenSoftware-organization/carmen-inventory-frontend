"use client";

import { ErrorState } from "@/components/ui/error-state";
import { ApiError, ERROR_CODES } from "@/lib/api-error";

export default function ModuleError({
  error,
  reset,
}: {
  readonly error: Error & { digest?: string };
  readonly reset: () => void;
}) {
  const isApiError = error instanceof ApiError;
  const message = isApiError
    ? getHumanMessage(error.code)
    : error.message || "Something went wrong";

  return <ErrorState message={message} onRetry={reset} />;
}

const getHumanMessage = (code: string): string => {
  switch (code) {
    case ERROR_CODES.UNAUTHORIZED:
      return "Session expired — please log in again";
    case ERROR_CODES.FORBIDDEN:
      return "You do not have permission to view this";
    case ERROR_CODES.NOT_FOUND:
      return "The requested resource was not found";
    case ERROR_CODES.RATE_LIMITED:
      return "Too many requests — please wait and try again";
    case ERROR_CODES.TIMEOUT:
      return "Server is taking too long to respond";
    default:
      return "Something went wrong — please try again";
  }
};
