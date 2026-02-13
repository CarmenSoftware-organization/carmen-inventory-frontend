"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useProfile, profileQueryKey } from "@/hooks/use-profile";
import { Button } from "@/components/ui/button";

export default function MainDashboard() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: profile, isLoading } = useProfile();

  const logoutMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/auth/logout", { method: "POST" });
      if (!res.ok) throw new Error("Logout failed");
    },
    onSuccess: () => {
      queryClient.removeQueries({ queryKey: profileQueryKey });
      router.push("/login");
    },
  });

  if (isLoading) return <div>Loading...</div>;

  const name = profile
    ? `${profile.user_info.firstname} ${profile.user_info.lastname}`
    : "User";

  const bu = profile?.business_unit.find((b) => b.is_default);

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-4 p-6">
      <h1 className="text-2xl font-bold">Welcome, {name}</h1>
      {bu && (
        <p className="text-muted-foreground">
          {bu.name} &middot; {bu.department.name}
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
