"use client";

import { useProfile } from "@/hooks/use-profile";
import { useLogout } from "@/hooks/use-logout";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorState } from "@/components/ui/error-state";

export default function MainDashboard() {
  const {
    data: profile,
    isLoading,
    isError,
    refetch,
    defaultBu,
  } = useProfile();
  const logoutMutation = useLogout();

  if (isError) {
    return (
      <ErrorState
        message="Unable to connect to server"
        onRetry={() => refetch()}
      />
    );
  }

  if (isLoading)
    return (
      <div className="flex min-h-svh flex-col items-center justify-center gap-4 p-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-5 w-48" />
        <Skeleton className="h-9 w-24" />
      </div>
    );

  const name = profile
    ? `${profile.user_info.firstname} ${profile.user_info.lastname}`
    : "User";

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-4 p-6">
      <h1 className="text-2xl font-bold">Welcome, {name}</h1>
      {defaultBu && (
        <p className="text-muted-foreground">
          {defaultBu.name} &middot; {defaultBu.department?.name}
        </p>
      )}
      <Button
        variant="outline"
        onClick={() => logoutMutation.mutate()}
        disabled={logoutMutation.isPending}
      >
        {logoutMutation.isPending ? "Logging out..." : "Logout"}
      </Button>
    </div>
  );
}
