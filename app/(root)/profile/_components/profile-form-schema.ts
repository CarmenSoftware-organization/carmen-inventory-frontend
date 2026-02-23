import { z } from "zod";
import type { UserProfile } from "@/types/profile";

export const profileSchema = z.object({
  alias_name: z.string().min(1, "Alias is required").max(2, "Alias max 2 characters"),
  firstname: z.string().min(1, "First name is required"),
  middlename: z.string(),
  lastname: z.string().min(1, "Last name is required"),
  telephone: z.string(),
});

export type ProfileFormValues = z.infer<typeof profileSchema>;

export const EMPTY_FORM: ProfileFormValues = {
  alias_name: "",
  firstname: "",
  middlename: "",
  lastname: "",
  telephone: "",
};

export function getDefaultValues(profile?: UserProfile): ProfileFormValues {
  if (!profile) return EMPTY_FORM;
  return {
    alias_name: profile.alias_name ?? "",
    firstname: profile.user_info.firstname ?? "",
    middlename: profile.user_info.middlename ?? "",
    lastname: profile.user_info.lastname ?? "",
    telephone: profile.user_info.telephone ?? "",
  };
}

export const changePasswordSchema = z
  .object({
    current_password: z.string().min(1, "Current password is required"),
    new_password: z.string().min(8, "Password must be at least 8 characters"),
    confirm_password: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.new_password !== data.current_password, {
    message: "New password must be different from current password",
    path: ["new_password"],
  })
  .refine((data) => data.new_password === data.confirm_password, {
    message: "Passwords do not match",
    path: ["confirm_password"],
  });

export type ChangePasswordFormValues = z.infer<typeof changePasswordSchema>;

export const EMPTY_PASSWORD_FORM: ChangePasswordFormValues = {
  current_password: "",
  new_password: "",
  confirm_password: "",
};
