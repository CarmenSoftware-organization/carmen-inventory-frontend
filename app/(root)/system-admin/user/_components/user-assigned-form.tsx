"use client";

import { useMemo, useState } from "react";
import { useForm, Controller, type Resolver } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { ArrowLeft, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { useRole } from "@/hooks/use-role";
import { useUpdateUserRoles } from "@/hooks/use-user";
import type { UserDetail } from "@/types/user";
import type { Role } from "@/types/role";
import type { FormMode } from "@/types/form";

const userRolesSchema = z.object({
  role_ids: z.array(z.string()),
});

type UserRolesFormValues = z.infer<typeof userRolesSchema>;

interface UserAssignedFormProps {
  readonly user: UserDetail;
}

export function UserAssignedForm({ user }: UserAssignedFormProps) {
  const router = useRouter();
  const [mode, setMode] = useState<FormMode>("view");
  const isView = mode === "view";

  const { data: rolesData, isLoading: rolesLoading } = useRole();
  const updateUserRoles = useUpdateUserRoles();
  const isPending = updateUserRoles.isPending;
  const isDisabled = isView || isPending;

  const roles = rolesData?.data ?? [];

  const initialRoleIds = useMemo(
    () => user.application_roles.map((r) => r.application_role_id),
    [user.application_roles],
  );

  const form = useForm<UserRolesFormValues>({
    resolver: zodResolver(userRolesSchema) as Resolver<UserRolesFormValues>,
    defaultValues: { role_ids: initialRoleIds },
  });

  const onSubmit = (values: UserRolesFormValues) => {
    const addRoles = values.role_ids.filter(
      (id) => !initialRoleIds.includes(id),
    );
    const removeRoles = initialRoleIds.filter(
      (id) => !values.role_ids.includes(id),
    );

    if (addRoles.length === 0 && removeRoles.length === 0) {
      setMode("view");
      return;
    }

    updateUserRoles.mutate(
      {
        user_id: user.user_id,
        application_role_id: {
          ...(addRoles.length > 0 && { add: addRoles }),
          ...(removeRoles.length > 0 && { remove: removeRoles }),
        },
      },
      {
        onSuccess: () => {
          toast.success("User roles updated successfully");
          router.push("/system-admin/user");
        },
        onError: (err) => toast.error(err.message),
      },
    );
  };

  const handleCancel = () => {
    form.reset({ role_ids: initialRoleIds });
    setMode("view");
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="Go back"
            onClick={() => router.push("/system-admin/user")}
          >
            <ArrowLeft />
          </Button>
          <h1 className="text-sm font-semibold">
            {isView ? "User Assign" : "Edit User Assign"}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          {isView ? (
            <Button size="sm" onClick={() => setMode("edit")}>
              <Pencil />
              Edit
            </Button>
          ) : (
            <>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleCancel}
                disabled={isPending}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                form="user-roles-form"
                disabled={isPending}
              >
                {isPending ? "Saving..." : "Save"}
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="rounded-md border">
        <div className="grid grid-cols-[auto_1fr] text-xs">
          <div className="border-b border-r bg-muted/50 px-3 py-2 font-medium text-muted-foreground">
            Name
          </div>
          <div className="border-b px-3 py-2">
            {user.firstname} {user.lastname}
          </div>
          <div className="border-b border-r bg-muted/50 px-3 py-2 font-medium text-muted-foreground">
            Email
          </div>
          <div className="border-b px-3 py-2 break-all">{user.email}</div>
          <div className="border-r bg-muted/50 px-3 py-2 font-medium text-muted-foreground">
            Username
          </div>
          <div className="px-3 py-2 break-all">{user.username}</div>
        </div>
      </div>

      <div className="rounded-md border">
        <div className="border-b bg-muted/50 px-3 py-2">
          <h2 className="text-xs font-medium text-muted-foreground">
            Assign Roles
          </h2>
        </div>
        <div className="p-3">
          {rolesLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-full" />
            </div>
          ) : (
            <form
              id="user-roles-form"
              onSubmit={form.handleSubmit(onSubmit)}
            >
              <div className="space-y-1">
                {roles.map((role: Role) => (
                  <Controller
                    key={role.id}
                    control={form.control}
                    name="role_ids"
                    render={({ field }) => {
                      const isChecked = field.value?.includes(role.id);
                      return (
                        <label
                          className={`flex items-center gap-2 rounded px-2 py-1.5 cursor-pointer transition-colors text-xs ${
                            isChecked
                              ? "bg-primary/5"
                              : "hover:bg-muted/50"
                          }`}
                        >
                          <Checkbox
                            checked={isChecked}
                            disabled={isDisabled}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                field.onChange([...field.value, role.id]);
                              } else {
                                field.onChange(
                                  field.value.filter((v) => v !== role.id),
                                );
                              }
                            }}
                          />
                          <span>{role.name}</span>
                        </label>
                      );
                    }}
                  />
                ))}
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
