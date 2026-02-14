"use client";

import { useState, useMemo } from "react";
import { useForm, Controller, type Resolver } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { ArrowLeft, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldError,
} from "@/components/ui/field";
import { toast } from "sonner";
import { useCreateRole, useUpdateRole, useDeleteRole } from "@/hooks/use-role";
import type { RoleDetail } from "@/types/role";
import type { FormMode } from "@/types/form";
import { DeleteDialog } from "@/components/ui/delete-dialog";
import { PermissionMatrix } from "./permission-matrix";

const roleSchema = z.object({
  application_role_name: z.string().min(1, "Name is required"),
  permissions: z.array(z.string()),
});

type RoleFormValues = z.infer<typeof roleSchema>;

interface RoleFormProps {
  readonly role?: RoleDetail;
}

export function RoleForm({ role }: RoleFormProps) {
  const router = useRouter();
  const [mode, setMode] = useState<FormMode>(role ? "view" : "add");
  const isView = mode === "view";
  const isEdit = mode === "edit";
  const isAdd = mode === "add";

  const createRole = useCreateRole();
  const updateRole = useUpdateRole();
  const deleteRole = useDeleteRole();
  const [showDelete, setShowDelete] = useState(false);

  const isPending = createRole.isPending || updateRole.isPending;
  const isDisabled = isView || isPending;

  const originalPermissionIds = useMemo(
    () => new Set(role?.permissions.map((p) => p.permission_id) ?? []),
    [role],
  );

  const defaultValues: RoleFormValues = role
    ? {
        application_role_name: role.application_role_name,
        permissions: role.permissions.map((p) => p.permission_id),
      }
    : {
        application_role_name: "",
        permissions: [],
      };

  const form = useForm<RoleFormValues>({
    resolver: zodResolver(roleSchema) as Resolver<RoleFormValues>,
    defaultValues,
  });

  const onSubmit = (values: RoleFormValues) => {
    if (isAdd) {
      createRole.mutate(
        {
          application_role_name: values.application_role_name,
          permissions: { add: values.permissions },
        },
        {
          onSuccess: () => {
            toast.success("Role created successfully");
            router.push("/system-admin/role");
          },
          onError: (err) => toast.error(err.message),
        },
      );
    } else if (isEdit && role) {
      const currentIds = new Set(values.permissions);
      const add = values.permissions.filter(
        (id) => !originalPermissionIds.has(id),
      );
      const remove = [...originalPermissionIds].filter(
        (id) => !currentIds.has(id),
      );

      updateRole.mutate(
        {
          id: role.id,
          application_role_name: values.application_role_name,
          permissions: { add, remove },
        },
        {
          onSuccess: () => {
            toast.success("Role updated successfully");
            router.push("/system-admin/role");
          },
          onError: (err) => toast.error(err.message),
        },
      );
    }
  };

  const handleCancel = () => {
    if (isEdit && role) {
      form.reset(defaultValues);
      setMode("view");
    } else {
      router.push("/system-admin/role");
    }
  };

  const title = isAdd ? "Add Role" : isEdit ? "Edit Role" : "Role";

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => router.push("/system-admin/role")}
          >
            <ArrowLeft />
          </Button>
          <h1 className="text-lg font-semibold">{title}</h1>
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
                form="role-form"
                disabled={isPending}
              >
                {isPending
                  ? isEdit
                    ? "Saving..."
                    : "Creating..."
                  : isEdit
                    ? "Save"
                    : "Create"}
              </Button>
            </>
          )}

          {isEdit && role && (
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={() => setShowDelete(true)}
              disabled={isPending || deleteRole.isPending}
            >
              <Trash2 />
              Delete
            </Button>
          )}
        </div>
      </div>

      <form
        id="role-form"
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-4"
      >
        <FieldGroup className="max-w-2xl gap-3">
          <Field data-invalid={!!form.formState.errors.application_role_name}>
            <FieldLabel className="text-xs">Name</FieldLabel>
            <Input
              placeholder="e.g. Admin"
              className="h-8 text-sm"
              disabled={isDisabled}
              {...form.register("application_role_name")}
            />
            <FieldError>
              {form.formState.errors.application_role_name?.message}
            </FieldError>
          </Field>
        </FieldGroup>

        <Controller
          control={form.control}
          name="permissions"
          render={({ field }) => (
            <PermissionMatrix
              value={field.value}
              onChange={field.onChange}
              disabled={isDisabled}
            />
          )}
        />
      </form>

      {role && (
        <DeleteDialog
          open={showDelete}
          onOpenChange={(open) =>
            !open && !deleteRole.isPending && setShowDelete(false)
          }
          title="Delete Role"
          description={`Are you sure you want to delete "${role.application_role_name}"? This action cannot be undone.`}
          isPending={deleteRole.isPending}
          onConfirm={() => {
            deleteRole.mutate(role.id, {
              onSuccess: () => {
                toast.success("Role deleted successfully");
                router.push("/system-admin/role");
              },
              onError: (err) => toast.error(err.message),
            });
          }}
        />
      )}
    </div>
  );
}
