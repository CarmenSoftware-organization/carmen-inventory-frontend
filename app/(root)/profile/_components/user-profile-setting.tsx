"use client";

import { useRouter } from "next/navigation";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { useProfile, useUpdateProfile } from "@/hooks/use-profile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import {
  getDefaultValues,
  profileSchema,
  type ProfileFormValues,
} from "./profile-form-schema";
import ChangePasswordSection from "./change-password-section";

export default function UserProfileSetting() {
  const router = useRouter();
  const { data: profile, isLoading, isError } = useProfile();
  const updateProfile = useUpdateProfile();

  const defaultValues = getDefaultValues(profile);
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema) as Resolver<ProfileFormValues>,
    defaultValues,
  });

  const handleBack = () => router.push("/profile");

  const onSubmit = (values: ProfileFormValues) => {
    updateProfile.mutate(values, {
      onSuccess: () => {
        toast.success("Profile updated successfully");
        form.reset(values);
      },
      onError: (err) => toast.error(err.message),
    });
  };

  if (isLoading)
    return (
      <div className="space-y-4 p-3">
        <div className="flex items-center gap-2">
          <Skeleton className="size-8" />
          <Skeleton className="h-5 w-32" />
        </div>
        <Skeleton className="h-20 w-full rounded-md" />
        <div className="grid grid-cols-3 gap-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={`skel-${i}`} className="space-y-1.5">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-8 w-full" />
            </div>
          ))}
        </div>
        <Skeleton className="h-32 w-full rounded-md" />
      </div>
    );

  if (isError || !profile)
    return (
      <p className="p-4 text-xs text-destructive">Failed to load profile</p>
    );

  return (
    <div className="space-y-4 p-3 max-w-lg">
      {/* ── Header ── */}

      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={handleBack}
          aria-label="Go back"
        >
          <ArrowLeft />
        </Button>
        <h1 className="text-lg font-semibold">Profile Setting</h1>
      </div>

      {/* ── Account Information (read-only) ── */}
      <section className="space-y-3">
        <h2 className="text-sm font-semibold border-b pb-2">Account Information</h2>
        <div className="grid grid-cols-2 gap-x-8 gap-y-1.5">
          <div className="min-w-0">
            <dt className="text-[11px] text-muted-foreground">Email</dt>
            <dd className="truncate text-xs font-medium">
              {profile.email || "-"}
            </dd>
          </div>
          <div className="min-w-0">
            <dt className="text-[11px] text-muted-foreground">Platform Role</dt>
            <dd className="truncate text-xs font-medium">
              {profile.platform_role || "-"}
            </dd>
          </div>
        </div>
      </section>
      <Separator />

      {/* ── Tabs ── */}
      <Tabs defaultValue="personal">
        <TabsList variant="line">
          <TabsTrigger value="personal">
            Personal Information
          </TabsTrigger>
          <TabsTrigger value="password">
            Change Password
          </TabsTrigger>
        </TabsList>

        {/* ── Personal Information Tab ── */}
        <TabsContent value="personal" className="pt-3">
          <form id="profile-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
            <FieldGroup className="gap-3 max-w-md">
              <Field data-invalid={!!form.formState.errors.firstname}>
                <FieldLabel htmlFor="firstname" required>
                  First Name
                </FieldLabel>
                <Input
                  id="firstname"
                  className="h-8 text-sm"
                  maxLength={100}
                  disabled={updateProfile.isPending}
                  {...form.register("firstname")}
                />
                <FieldError>
                  {form.formState.errors.firstname?.message}
                </FieldError>
              </Field>

              <Field data-invalid={!!form.formState.errors.middlename}>
                <FieldLabel htmlFor="middlename">
                  Middle Name
                </FieldLabel>
                <Input
                  id="middlename"
                  className="h-8 text-sm"
                  maxLength={100}
                  disabled={updateProfile.isPending}
                  {...form.register("middlename")}
                />
                <FieldError>
                  {form.formState.errors.middlename?.message}
                </FieldError>
              </Field>

              <Field data-invalid={!!form.formState.errors.lastname}>
                <FieldLabel htmlFor="lastname" required>
                  Last Name
                </FieldLabel>
                <Input
                  id="lastname"
                  className="h-8 text-sm"
                  maxLength={100}
                  disabled={updateProfile.isPending}
                  {...form.register("lastname")}
                />
                <FieldError>
                  {form.formState.errors.lastname?.message}
                </FieldError>
              </Field>

              <Field data-invalid={!!form.formState.errors.alias_name}>
                <FieldLabel htmlFor="alias_name" required>
                  Alias
                </FieldLabel>
                <Input
                  id="alias_name"
                  className="h-8 text-sm"
                  maxLength={2}
                  disabled={updateProfile.isPending}
                  {...form.register("alias_name")}
                />
                <FieldError>
                  {form.formState.errors.alias_name?.message}
                </FieldError>
              </Field>

              <Field data-invalid={!!form.formState.errors.telephone}>
                <FieldLabel htmlFor="telephone">
                  Telephone
                </FieldLabel>
                <Input
                  id="telephone"
                  className="h-8 text-sm"
                  maxLength={20}
                  disabled={updateProfile.isPending}
                  {...form.register("telephone")}
                />
                <FieldError>
                  {form.formState.errors.telephone?.message}
                </FieldError>
              </Field>
            </FieldGroup>
            <div className="flex justify-end">
              <Button type="submit" size="sm" disabled={updateProfile.isPending}>
                {updateProfile.isPending ? "Saving..." : "Save"}
              </Button>
            </div>
          </form>
        </TabsContent>
        <TabsContent value="password">
          <ChangePasswordSection />
        </TabsContent>
      </Tabs>
    </div>
  );
}
