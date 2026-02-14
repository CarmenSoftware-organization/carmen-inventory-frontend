"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { ArrowLeft, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldError,
} from "@/components/ui/field";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  useCreateDepartment,
  useUpdateDepartment,
  useDeleteDepartment,
} from "@/hooks/use-department";
import type { Department, DepartmentUser } from "@/types/department";
import type { FormMode } from "@/types/form";
import { DeleteDialog } from "@/components/ui/delete-dialog";

const departmentSchema = z.object({
  code: z.string().min(1, "Code is required"),
  name: z.string().min(1, "Name is required"),
  description: z.string(),
  is_active: z.boolean(),
});

type DepartmentFormValues = z.infer<typeof departmentSchema>;

interface DepartmentFormProps {
  readonly department?: Department;
}

export function DepartmentForm({ department }: DepartmentFormProps) {
  const router = useRouter();
  const [mode, setMode] = useState<FormMode>(department ? "view" : "add");
  const isView = mode === "view";
  const isEdit = mode === "edit";
  const isAdd = mode === "add";

  const createDepartment = useCreateDepartment();
  const updateDepartment = useUpdateDepartment();
  const deleteDepartment = useDeleteDepartment();
  const [showDelete, setShowDelete] = useState(false);
  const isPending = createDepartment.isPending || updateDepartment.isPending;
  const isDisabled = isView || isPending;

  const form = useForm<DepartmentFormValues>({
    resolver: zodResolver(departmentSchema),
    defaultValues: department
      ? {
          code: department.code,
          name: department.name,
          description: department.description,
          is_active: department.is_active,
        }
      : { code: "", name: "", description: "", is_active: true },
  });

  const onSubmit = (values: DepartmentFormValues) => {
    const payload = {
      code: values.code,
      name: values.name,
      description: values.description ?? "",
      is_active: values.is_active,
    };

    if (isEdit && department) {
      updateDepartment.mutate(
        { id: department.id, ...payload },
        {
          onSuccess: () => {
            toast.success("Department updated successfully");
            router.push("/config/department");
          },
          onError: (err) => toast.error(err.message),
        },
      );
    } else if (isAdd) {
      createDepartment.mutate(payload, {
        onSuccess: () => {
          toast.success("Department created successfully");
          router.push("/config/department");
        },
        onError: (err) => toast.error(err.message),
      });
    }
  };

  const handleCancel = () => {
    if (isEdit && department) {
      form.reset({
        code: department.code,
        name: department.name,
        description: department.description,
        is_active: department.is_active,
      });
      setMode("view");
    } else {
      router.push("/config/department");
    }
  };

  const title = isAdd
    ? "Add Department"
    : isEdit
      ? "Edit Department"
      : "Department";

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => router.push("/config/department")}
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
                form="department-form"
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
          {isEdit && department && (
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={() => setShowDelete(true)}
              disabled={isPending || deleteDepartment.isPending}
            >
              <Trash2 />
              Delete
            </Button>
          )}
        </div>
      </div>

      <form
        id="department-form"
        onSubmit={form.handleSubmit(onSubmit)}
        className="max-w-2xl space-y-4"
      >
        <FieldGroup className="gap-3">
          <Field data-invalid={!!form.formState.errors.code}>
            <FieldLabel htmlFor="department-code" className="text-xs">
              Code
            </FieldLabel>
            <Input
              id="department-code"
              placeholder="e.g. IT, HR, FIN"
              className="h-8 text-sm"
              disabled={isDisabled}
              {...form.register("code")}
            />
            <FieldError>{form.formState.errors.code?.message}</FieldError>
          </Field>

          <Field data-invalid={!!form.formState.errors.name}>
            <FieldLabel htmlFor="department-name" className="text-xs">
              Name
            </FieldLabel>
            <Input
              id="department-name"
              placeholder="e.g. Information Technology"
              className="h-8 text-sm"
              disabled={isDisabled}
              {...form.register("name")}
            />
            <FieldError>{form.formState.errors.name?.message}</FieldError>
          </Field>

          <Field>
            <FieldLabel htmlFor="department-description" className="text-xs">
              Description
            </FieldLabel>
            <Textarea
              id="department-description"
              placeholder="Optional"
              className="text-sm"
              disabled={isDisabled}
              {...form.register("description")}
            />
          </Field>

          <Field orientation="horizontal">
            <Controller
              control={form.control}
              name="is_active"
              render={({ field }) => (
                <Checkbox
                  id="department-is-active"
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  disabled={isDisabled}
                />
              )}
            />
            <FieldLabel htmlFor="department-is-active" className="text-xs">
              Active
            </FieldLabel>
          </Field>
        </FieldGroup>
      </form>

      {department && (
        <div className="max-w-2xl space-y-4 pt-4">
          <UserSection
            title="Head of Department"
            users={department.hod_users}
          />
          <UserSection
            title="Department Members"
            users={department.department_users}
          />
        </div>
      )}

      {department && (
        <DeleteDialog
          open={showDelete}
          onOpenChange={(open) =>
            !open && !deleteDepartment.isPending && setShowDelete(false)
          }
          title="Delete Department"
          description={`Are you sure you want to delete department "${department.name}"? This action cannot be undone.`}
          isPending={deleteDepartment.isPending}
          onConfirm={() => {
            deleteDepartment.mutate(department.id, {
              onSuccess: () => {
                toast.success("Department deleted successfully");
                router.push("/config/department");
              },
              onError: (err) => toast.error(err.message),
            });
          }}
        />
      )}
    </div>
  );
}

function UserSection({
  title,
  users,
}: {
  title: string;
  users: DepartmentUser[];
}) {
  return (
    <div className="space-y-2">
      <h3 className="text-xs font-medium text-muted-foreground">{title}</h3>
      {users.length === 0 ? (
        <p className="text-xs text-muted-foreground">No users assigned</p>
      ) : (
        <div className="rounded-md border">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="px-3 py-1.5 text-left font-medium">Name</th>
                <th className="px-3 py-1.5 text-left font-medium">
                  Telephone
                </th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-b last:border-0">
                  <td className="px-3 py-1.5">
                    {user.firstname} {user.lastname}
                  </td>
                  <td className="px-3 py-1.5 text-muted-foreground">
                    {user.telephone}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
