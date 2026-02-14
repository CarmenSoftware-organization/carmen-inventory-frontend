"use client";

import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
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
} from "@/hooks/use-department";
import type { Department } from "@/types/department";
import DisplayTemplate from "@/components/display-template";

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
  const isEdit = !!department;
  const createDepartment = useCreateDepartment();
  const updateDepartment = useUpdateDepartment();
  const isPending = createDepartment.isPending || updateDepartment.isPending;

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

    if (isEdit) {
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
    } else {
      createDepartment.mutate(payload, {
        onSuccess: () => {
          toast.success("Department created successfully");
          router.push("/config/department");
        },
        onError: (err) => toast.error(err.message),
      });
    }
  };

  return (
    <DisplayTemplate
      title={isEdit ? "Edit Department" : "Add Department"}
      actions={
        <>
          <Button
            type="button"
            variant="outline"
            size="xs"
            onClick={() => router.push("/config/department")}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            size="xs"
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
      }
    >
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
              disabled={isPending}
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
              disabled={isPending}
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
              disabled={isPending}
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
                  disabled={isPending}
                />
              )}
            />
            <FieldLabel htmlFor="department-is-active" className="text-xs">
              Active
            </FieldLabel>
          </Field>
        </FieldGroup>
      </form>
    </DisplayTemplate>
  );
}
