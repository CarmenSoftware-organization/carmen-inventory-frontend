"use client";

import { useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { Hotel, ArrowUpRight, Activity } from "lucide-react";
import { profileQueryKey } from "@/hooks/use-profile";
import { httpClient } from "@/lib/http-client";
import { API_ENDPOINTS } from "@/constant/api-endpoints";
import { Button } from "@/components/ui/button";
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
      const res = await httpClient.post(API_ENDPOINTS.LOGIN, credentials);

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
    <div className="grid min-h-svh lg:grid-cols-[1fr_1.15fr]">
      {/* ── Left: Form ── */}
      <div className="relative flex flex-col overflow-hidden px-6 py-8 lg:px-14 xl:px-20">
        {/* Background gradient orbs */}
        <div className="pointer-events-none absolute -top-40 -right-40 size-[500px] rounded-full bg-info/[0.04] blur-[100px]" />
        <div className="pointer-events-none absolute -bottom-32 -left-32 size-[400px] rounded-full bg-success/[0.03] blur-[80px]" />

        <div className="relative z-10 flex items-center gap-2.5 animate-in fade-in slide-in-from-bottom-3 duration-700 fill-mode-both">
          <div className="flex size-9 items-center justify-center rounded-lg bg-primary shadow-lg shadow-primary/30">
            <Hotel className="size-[18px] text-primary-foreground" />
          </div>
          <span className="text-lg font-bold tracking-tight">Carmen</span>
        </div>

        <div className="relative z-10 flex flex-1 items-center justify-center">
          <div className="w-full max-w-[340px]">
            <h1 className="text-[28px] font-bold leading-tight tracking-tight animate-in fade-in slide-in-from-bottom-3 duration-700 fill-mode-both delay-100">
              Welcome back
            </h1>
            <p className="mt-2 text-[15px] text-muted-foreground animate-in fade-in slide-in-from-bottom-3 duration-700 fill-mode-both delay-200">
              Sign in to manage your hotel inventory
            </p>

            <form
              className="mt-10 animate-in fade-in slide-in-from-bottom-3 duration-700 fill-mode-both delay-300"
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
              <div className="rounded-2xl border bg-card p-6 shadow-sm">
                <FieldGroup className="gap-5">
                  <Field>
                    <FieldLabel htmlFor="email">Email address</FieldLabel>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      placeholder="you@company.com"
                      required
                    />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="password">Password</FieldLabel>
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      autoComplete="current-password"
                      placeholder="••••••••"
                      required
                      minLength={6}
                    />
                  </Field>

                  {loginMutation.isError && (
                    <p className="text-sm text-destructive">
                      {loginMutation.error.message}
                    </p>
                  )}

                  <Button
                    type="submit"
                    className="mt-2 w-full shadow-md shadow-primary/20"
                    size="lg"
                    disabled={loginMutation.isPending}
                  >
                    {loginMutation.isPending ? "Signing in..." : "Sign In"}
                  </Button>
                </FieldGroup>
              </div>
            </form>
          </div>
        </div>

        <p className="relative z-10 text-center text-xs text-muted-foreground/50 animate-in fade-in duration-700 fill-mode-both delay-500">
          Carmen Inventory &middot; Hotel ERP Platform
        </p>
      </div>

      {/* ── Right: Showcase ── */}
      <div className="relative hidden overflow-hidden bg-invert lg:block">
        {/* Dot grid */}
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              "radial-gradient(circle, rgba(255,255,255,0.5) 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />

        {/* Ambient glow */}
        <div className="absolute -top-32 right-1/3 size-[500px] rounded-full bg-info/[0.08] blur-[120px]" />
        <div className="absolute -bottom-20 left-1/4 size-[400px] rounded-full bg-success/[0.07] blur-[100px]" />

        {/* Content */}
        <div className="relative z-10 flex h-full flex-col justify-between p-10 xl:p-14">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-xl border border-invert-foreground/[0.08] bg-invert-foreground/[0.05] backdrop-blur-sm">
                <Hotel className="size-5 text-invert-foreground/90" />
              </div>
              <div>
                <p className="text-[15px] font-semibold text-invert-foreground">
                  Carmen
                </p>
                <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-invert-foreground/30">
                  Hotel Inventory
                </p>
              </div>
            </div>

            <h2 className="mt-10 max-w-xs text-[32px] font-bold leading-[1.1] tracking-tight text-invert-foreground">
              Everything your hotel needs, in one place.
            </h2>
            <p className="mt-4 max-w-sm text-[14px] leading-relaxed text-invert-foreground/40">
              Streamline procurement, track stock in real-time, and make smarter
              decisions with powerful analytics.
            </p>
          </div>

          {/* Floating cards */}
          <div className="relative my-8 flex-1">
            {/* Card: Overview */}
            <div className="absolute left-0 top-8 w-[270px] rounded-2xl border border-invert-foreground/[0.06] bg-invert-foreground/[0.03] p-5 shadow-2xl shadow-black/20 backdrop-blur-md">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="size-2 rounded-full bg-success" />
                  <span className="text-[11px] font-medium text-invert-foreground/60">
                    Overview
                  </span>
                </div>
                <span className="text-[10px] text-invert-foreground/30">
                  Live
                </span>
              </div>
              <div className="space-y-3.5">
                {[
                  { label: "Total Items", value: "2,847", pct: 78, bar: "var(--info)" },
                  { label: "Low Stock", value: "23", pct: 12, bar: "var(--warning)" },
                  { label: "On Order", value: "156", pct: 52, bar: "var(--success)" },
                ].map((row) => (
                  <div key={row.label}>
                    <div className="mb-1.5 flex items-center justify-between">
                      <span className="text-[11px] text-invert-foreground/40">
                        {row.label}
                      </span>
                      <span className="text-[12px] font-semibold tabular-nums text-invert-foreground/80">
                        {row.value}
                      </span>
                    </div>
                    <div className="h-1 overflow-hidden rounded-full bg-invert-foreground/[0.06]">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${row.pct}%`,
                          backgroundColor: row.bar,
                          opacity: 0.6,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Card: Activity */}
            <div className="absolute right-2 top-24 w-[250px] rounded-2xl border border-invert-foreground/[0.06] bg-invert-foreground/[0.03] p-5 shadow-2xl shadow-black/20 backdrop-blur-md xl:right-8">
              <div className="mb-4 flex items-center gap-2">
                <Activity className="size-3.5 text-invert-foreground/40" />
                <span className="text-[11px] font-medium text-invert-foreground/60">
                  Recent Activity
                </span>
              </div>
              <div className="space-y-3">
                {[
                  { text: "Linens restocked", detail: "+240 units", time: "2m ago", color: "text-success" },
                  { text: "Minibar updated", detail: "+85 units", time: "15m ago", color: "text-info" },
                  { text: "Kitchen supplies", detail: "+120 units", time: "1h ago", color: "text-warning" },
                ].map((item) => (
                  <div key={item.text} className="flex items-start gap-2.5">
                    <ArrowUpRight
                      className={`mt-0.5 size-3.5 shrink-0 ${item.color}`}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[12px] font-medium text-invert-foreground/70">
                        {item.text}
                      </p>
                      <p className="text-[10px] text-invert-foreground/30">
                        {item.detail} &middot; {item.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom stats */}
          <div className="flex items-center gap-8 border-t border-invert-foreground/[0.06] pt-6">
            {[
              { label: "Departments", value: "12" },
              { label: "Items Tracked", value: "4.2k" },
              { label: "Uptime", value: "99.9%" },
            ].map((stat) => (
              <div key={stat.label}>
                <p className="text-lg font-bold tabular-nums text-invert-foreground">
                  {stat.value}
                </p>
                <p className="text-[11px] text-invert-foreground/30">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
