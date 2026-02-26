"use client";

import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useChangePassword } from "@/hooks/use-profile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import {
  changePasswordSchema,
  EMPTY_PASSWORD_FORM,
  type ChangePasswordFormValues,
} from "./profile-form-schema";

export default function ChangePasswordSection() {
  const changePassword = useChangePassword();

  const form = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(
      changePasswordSchema,
    ) as Resolver<ChangePasswordFormValues>,
    defaultValues: EMPTY_PASSWORD_FORM,
  });

  const onSubmit = (values: ChangePasswordFormValues) => {
    changePassword.mutate(
      {
        current_password: values.current_password,
        new_password: values.new_password,
      },
      {
        onSuccess: () => {
          toast.success("Password changed successfully");
          form.reset(EMPTY_PASSWORD_FORM);
        },
        onError: (err) => toast.error(err.message),
      },
    );
  };

  return (
    <form
      id="change-password-form"
      onSubmit={form.handleSubmit(onSubmit)}
      className="space-y-3"
    >
      <FieldGroup className="gap-3 max-w-md">
        <Field data-invalid={!!form.formState.errors.current_password}>
          <FieldLabel htmlFor="current_password" required>
            Current Password
          </FieldLabel>
          <Input
            id="current_password"
            type="password"
            className="h-8 text-sm"
            maxLength={100}
            disabled={changePassword.isPending}
            {...form.register("current_password")}
          />
          <FieldError>
            {form.formState.errors.current_password?.message}
          </FieldError>
        </Field>

        <Field data-invalid={!!form.formState.errors.new_password}>
          <FieldLabel htmlFor="new_password" required>
            New Password
          </FieldLabel>
          <Input
            id="new_password"
            type="password"
            className="h-8 text-sm"
            maxLength={100}
            disabled={changePassword.isPending}
            {...form.register("new_password")}
          />
          <FieldError>{form.formState.errors.new_password?.message}</FieldError>
        </Field>

        <Field data-invalid={!!form.formState.errors.confirm_password}>
          <FieldLabel htmlFor="confirm_password" required>
            Confirm Password
          </FieldLabel>
          <Input
            id="confirm_password"
            type="password"
            className="h-8 text-sm"
            maxLength={100}
            disabled={changePassword.isPending}
            {...form.register("confirm_password")}
          />
          <FieldError>
            {form.formState.errors.confirm_password?.message}
          </FieldError>
        </Field>
        <div className="flex justify-end">
          <Button type="submit" size="sm" disabled={changePassword.isPending}>
            {changePassword.isPending ? "Changing..." : "Change Password"}
          </Button>
        </div>
      </FieldGroup>
    </form>
  );
}
