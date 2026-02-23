"use client";

import { useState, useEffect } from "react";
import { useProfile } from "@/hooks/use-profile";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorState } from "@/components/ui/error-state";

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good Morning";
  if (hour < 17) return "Good Afternoon";
  return "Good Evening";
}

export default function MainDashboard() {
  const [greeting, setGreeting] = useState("");

  useEffect(() => {
    setGreeting(getGreeting());
  }, []);

  const {
    data: profile,
    isLoading,
    isError,
    refetch,
    defaultBu,
  } = useProfile();

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
      <h1 className="text-2xl font-bold">{greeting ? `${greeting}, ` : ""}{name}</h1>
      {defaultBu && (
        <p className="text-muted-foreground">
          {defaultBu.name} &middot; {defaultBu.department?.name ?? <span className="text-amber-500">Department not assigned</span>}
        </p>
      )}
    </div>
  );
}
