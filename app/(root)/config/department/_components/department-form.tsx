"use client";

import { useState, useMemo } from "react";
import { useForm, Controller, type Resolver } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldError,
} from "@/components/ui/field";
import { Textarea } from "@/components/ui/textarea";
import { Transfer, type TransferItem } from "@/components/ui/transfer";
import { FormToolbar } from "@/components/ui/form-toolbar";
import { UserTable } from "@/components/ui/user-table";
import { DeleteDialog } from "@/components/ui/delete-dialog";
import { toast } from "sonner";
import {
  useCreateDepartment,
  useUpdateDepartment,
  useDeleteDepartment,
} from "@/hooks/use-department";
import { useAllUsers } from "@/hooks/use-all-users";
import {
  transferHandler,
  transferPayloadSchema,
} from "@/utils/transfer-handler";
import type { Department } from "@/types/department";
import type { FormMode } from "@/types/form";

const departmentSchema = z.object({
  code: z.string().min(1, "Code is required"),
  name: z.string().min(1, "Name is required"),
  description: z.string(),
  is_active: z.boolean(),
  department_users: transferPayloadSchema,
  hod_users: transferPayloadSchema,
});

type DepartmentFormValues = z.infer<typeof departmentSchema>;

const emptyTransfer = { add: [], remove: [] };

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

  // Fetch all users for Transfer
  const { data: allUsers = [], isLoading: isLoadingUsers } = useAllUsers();

  // Department users source: users without department + users already in this department
  const departmentUserSource: TransferItem[] = useMemo(() => {
    const currentDeptUserIds = new Set(
      department?.department_users.map((u) => u.user_id) ?? [],
    );
    return allUsers
      .filter(
        (user) => !user.department?.id || currentDeptUserIds.has(user.user_id),
      )
      .map((user) => ({
        key: user.user_id,
        title: `${user.firstname} ${user.lastname}`,
      }));
  }, [allUsers, department]);

  // HOD users source: all users (no filter)
  const hodUserSource: TransferItem[] = useMemo(
    () =>
      allUsers.map((user) => ({
        key: user.user_id,
        title: `${user.firstname} ${user.lastname}`,
      })),
    [allUsers],
  );

  // Target keys state
  const [deptUserTargetKeys, setDeptUserTargetKeys] = useState<string[]>(
    () => department?.department_users.map((u) => u.user_id) ?? [],
  );
  const [hodUserTargetKeys, setHodUserTargetKeys] = useState<string[]>(
    () => department?.hod_users.map((u) => u.user_id) ?? [],
  );

  const form = useForm<DepartmentFormValues>({
    resolver: zodResolver(departmentSchema) as Resolver<DepartmentFormValues>,
    defaultValues: department
      ? {
          code: department.code,
          name: department.name,
          description: department.description,
          is_active: department.is_active,
          department_users: { ...emptyTransfer },
          hod_users: { ...emptyTransfer },
        }
      : {
          code: "",
          name: "",
          description: "",
          is_active: true,
          department_users: { ...emptyTransfer },
          hod_users: { ...emptyTransfer },
        },
  });

  // Transfer onChange handlers
  const handleDeptUsersChange = (
    nextTargetKeys: string[],
    direction: "left" | "right",
    moveKeys: string[],
  ) => {
    setDeptUserTargetKeys(nextTargetKeys);
    transferHandler(form, "department_users", moveKeys, direction);
  };

  const handleHodUsersChange = (
    nextTargetKeys: string[],
    direction: "left" | "right",
    moveKeys: string[],
  ) => {
    setHodUserTargetKeys(nextTargetKeys);
    transferHandler(form, "hod_users", moveKeys, direction);
  };

  const onSubmit = (values: DepartmentFormValues) => {
    const payload = {
      code: values.code,
      name: values.name,
      description: values.description ?? "",
      is_active: values.is_active,
      department_users: values.department_users,
      hod_users: values.hod_users,
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
        department_users: { ...emptyTransfer },
        hod_users: { ...emptyTransfer },
      });
      setDeptUserTargetKeys(department.department_users.map((u) => u.user_id));
      setHodUserTargetKeys(department.hod_users.map((u) => u.user_id));
      setMode("view");
    } else {
      router.push("/config/department");
    }
  };

  return (
    <div className="space-y-4">
      <FormToolbar
        entity="Department"
        mode={mode}
        formId="department-form"
        isPending={isPending}
        onBack={() => router.push("/config/department")}
        onEdit={() => setMode("edit")}
        onCancel={handleCancel}
        onDelete={department ? () => setShowDelete(true) : undefined}
        deleteIsPending={deleteDepartment.isPending}
      />

      <form
        id="department-form"
        onSubmit={form.handleSubmit(onSubmit)}
        className="max-w-2xl space-y-4"
      >
        <FieldGroup className="gap-3">
          <div className="grid grid-cols-2 gap-3">
            <Field data-invalid={!!form.formState.errors.code}>
              <FieldLabel htmlFor="department-code" className="text-xs" required>
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
              <FieldLabel htmlFor="department-name" className="text-xs" required>
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
          </div>

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

      <div className="space-y-6 pt-6">
        <section>
          <div className="mb-2 flex items-center gap-2">
            <h3 className="text-sm font-semibold">Department Members</h3>
            {isView && (
              <span className="inline-flex h-4.5 min-w-5 items-center justify-center rounded bg-muted px-1 text-[10px] font-medium tabular-nums text-muted-foreground">
                {department?.department_users.length ?? 0}
              </span>
            )}
          </div>
          {isView ? (
            <UserTable
              users={department?.department_users ?? []}
              className="max-w-2xl"
            />
          ) : (
            <Transfer
              dataSource={departmentUserSource}
              targetKeys={deptUserTargetKeys}
              onChange={handleDeptUsersChange}
              disabled={isDisabled}
              loading={isLoadingUsers}
              titles={["Available Users", "Department Members"]}
            />
          )}
        </section>

        <section>
          <div className="mb-2 flex items-center gap-2">
            <h3 className="text-sm font-semibold">Head of Department</h3>
            {isView && (
              <span className="inline-flex h-4.5 min-w-5 items-center justify-center rounded bg-muted px-1 text-[10px] font-medium tabular-nums text-muted-foreground">
                {department?.hod_users.length ?? 0}
              </span>
            )}
          </div>
          {isView ? (
            <UserTable
              users={department?.hod_users ?? []}
              className="max-w-2xl"
            />
          ) : (
            <Transfer
              dataSource={hodUserSource}
              targetKeys={hodUserTargetKeys}
              onChange={handleHodUsersChange}
              disabled={isDisabled}
              loading={isLoadingUsers}
              titles={["Available Users", "HOD"]}
            />
          )}
        </section>
      </div>

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
