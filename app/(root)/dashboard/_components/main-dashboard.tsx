"use client";

import { useProfile } from "@/hooks/use-profile";
import { useLogout } from "@/hooks/use-logout";
import { Button } from "@/components/ui/button";
import { AlertCircle, RefreshCw } from "lucide-react";

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
      <div className="flex min-h-svh flex-col items-center justify-center gap-3 p-6">
        <AlertCircle className="size-8 text-destructive" />
        <p className="text-sm text-muted-foreground">
          Unable to connect to server
        </p>
        <Button variant="outline" size="sm" onClick={() => refetch()}>
          <RefreshCw className="mr-2 size-3" />
          Retry
        </Button>
      </div>
    );
  }

  if (isLoading) return <div>Loading...</div>;

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
