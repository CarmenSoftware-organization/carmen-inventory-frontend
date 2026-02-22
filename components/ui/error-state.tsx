"use client";

import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ErrorStateProps {
  readonly message?: string;
  readonly onRetry?: () => void;
}

export function ErrorState({
  message = "An unexpected error occurred",
  onRetry,
}: ErrorStateProps) {
  return (
    <div role="alert" className="flex flex-1 flex-col items-center justify-center gap-3 p-6">
      <AlertCircle aria-hidden="true" className="size-8 text-destructive" />
      <p className="text-sm text-muted-foreground">{message}</p>
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry}>
          <RefreshCw className="mr-2 size-3" />
          Retry
        </Button>
      )}
    </div>
  );
}
