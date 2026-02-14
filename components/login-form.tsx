"use client";

import { useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { profileQueryKey } from "@/hooks/use-profile";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

export default function LoginForm() {
  const router = useRouter();
  const queryClient = useQueryClient();

  useEffect(() => {
    queryClient.removeQueries({ queryKey: profileQueryKey });
  }, [queryClient]);

  const loginMutation = useMutation({
    mutationFn: async (credentials: { email: string; password: string }) => {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Login failed");
      }

      return res.json();
    },
    onSuccess: (data) => {
      if (data.profile) {
        queryClient.setQueryData(profileQueryKey, data.profile);
      }
      router.push("/dashboard");
    },
  });

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <Card>
          <CardHeader>
            <CardTitle>Login to your account</CardTitle>
            <CardDescription>
              Enter your email below to login to your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                loginMutation.reset();
                const form = e.currentTarget;
                const fd = new FormData(form);
                loginMutation.mutate(
                  {
                    email: fd.get("email") as string,
                    password: fd.get("password") as string,
                  },
                  { onError: () => form.reset() },
                );
              }}
            >
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="email">Email</FieldLabel>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    placeholder="m@example.com"
                    required
                  />
                </Field>
                <Field>
                  <div className="flex items-center">
                    <FieldLabel htmlFor="password">Password</FieldLabel>
                  </div>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    minLength={6}
                  />
                </Field>

                {loginMutation.isError && (
                  <p className="text-sm text-destructive">
                    {loginMutation.error.message}
                  </p>
                )}

                <Field>
                  <Button type="submit" disabled={loginMutation.isPending}>
                    {loginMutation.isPending ? "Logging in..." : "Login"}
                  </Button>
                </Field>
              </FieldGroup>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
