"use client";

import { useState } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FormToolbar } from "@/components/ui/form-toolbar";
import { DeleteDialog } from "@/components/ui/delete-dialog";
import { toast } from "sonner";
import {
  useCreateAdjustmentType,
  useUpdateAdjustmentType,
  useDeleteAdjustmentType,
} from "@/hooks/use-adjustment-type";
import type { AdjustmentType } from "@/types/adjustment-type";
import type { FormMode } from "@/types/form";
import {
  ADJUSTMENT_TYPE,
  ADJUSTMENT_TYPE_OPTIONS,
} from "@/constant/adjustment-type";

const adjustmentTypeSchema = z.object({
  code: z.string().min(1, "Code is required"),
  name: z.string().min(1, "Name is required"),
  type: z.nativeEnum(ADJUSTMENT_TYPE, { error: "Type is required" }),
  description: z.string(),
  note: z.string(),
  is_active: z.boolean(),
});

type AdjustmentTypeFormValues = z.infer<typeof adjustmentTypeSchema>;

interface AdjustmentTypeFormProps {
  readonly adjustmentType?: AdjustmentType;
}

export function AdjustmentTypeForm({
  adjustmentType,
}: AdjustmentTypeFormProps) {
  const router = useRouter();
  const [mode, setMode] = useState<FormMode>(adjustmentType ? "view" : "add");
  const isView = mode === "view";
  const isEdit = mode === "edit";

  const createAdjustmentType = useCreateAdjustmentType();
  const updateAdjustmentType = useUpdateAdjustmentType();
  const deleteAdjustmentType = useDeleteAdjustmentType();
  const [showDelete, setShowDelete] = useState(false);
  const isPending =
    createAdjustmentType.isPending || updateAdjustmentType.isPending;
  const isDisabled = isView || isPending;

  const form = useForm<AdjustmentTypeFormValues>({
    resolver: zodResolver(
      adjustmentTypeSchema,
    ) as Resolver<AdjustmentTypeFormValues>,
    defaultValues: adjustmentType
      ? {
          code: adjustmentType.code,
          name: adjustmentType.name,
          type: adjustmentType.type,
          description: adjustmentType.description,
          note: adjustmentType.note,
          is_active: adjustmentType.is_active,
        }
      : {
          code: "",
          name: "",
          type: "" as unknown as ADJUSTMENT_TYPE,
          description: "",
          note: "",
          is_active: true,
        },
  });

  const onSubmit = (values: AdjustmentTypeFormValues) => {
    const payload = {
      code: values.code,
      name: values.name,
      type: values.type,
      description: values.description ?? "",
      note: values.note ?? "",
      is_active: values.is_active,
    };

    if (isEdit && adjustmentType) {
      updateAdjustmentType.mutate(
        { id: adjustmentType.id, ...payload },
        {
          onSuccess: () => {
            toast.success("Adjustment type updated successfully");
            router.push("/config/adjustment-type");
          },
          onError: (err) => toast.error(err.message),
        },
      );
    } else {
      createAdjustmentType.mutate(payload, {
        onSuccess: () => {
          toast.success("Adjustment type created successfully");
          router.push("/config/adjustment-type");
        },
        onError: (err) => toast.error(err.message),
      });
    }
  };

  const handleBack = () => router.push("/config/adjustment-type");

  const handleEdit = () => setMode("edit");

  const handleCancel = () => {
    if (isEdit && adjustmentType) {
      form.reset({
        code: adjustmentType.code,
        name: adjustmentType.name,
        type: adjustmentType.type,
        description: adjustmentType.description,
        note: adjustmentType.note,
        is_active: adjustmentType.is_active,
      });
      setMode("view");
    } else {
      router.push("/config/adjustment-type");
    }
  };

  const handleDelete = () => {
    if (!adjustmentType) return;
    deleteAdjustmentType.mutate(adjustmentType.id, {
      onSuccess: () => {
        toast.success("Adjustment type deleted successfully");
        router.push("/config/adjustment-type");
      },
      onError: (err) => toast.error(err.message),
    });
  };

  return (
    <div className="space-y-4">
      <FormToolbar
        entity="Adjustment Type"
        mode={mode}
        formId="adjustment-type-form"
        isPending={isPending}
        onBack={handleBack}
        onEdit={handleEdit}
        onCancel={handleCancel}
        onDelete={adjustmentType ? () => setShowDelete(true) : undefined}
        deleteIsPending={deleteAdjustmentType.isPending}
      />

      <form
        id="adjustment-type-form"
        onSubmit={form.handleSubmit(onSubmit)}
        className="max-w-2xl space-y-4"
      >
        <FieldGroup className="gap-3">
          <Field data-invalid={!!form.formState.errors.code}>
            <FieldLabel
              htmlFor="adjustment-type-code"
              className="text-xs"
              required
            >
              Code
            </FieldLabel>
            <Input
              id="adjustment-type-code"
              placeholder="e.g. TRFOT"
              className="h-8 text-sm"
              disabled={isDisabled}
              maxLength={10}
              {...form.register("code")}
            />
            <FieldError>{form.formState.errors.code?.message}</FieldError>
          </Field>

          <Field data-invalid={!!form.formState.errors.name}>
            <FieldLabel
              htmlFor="adjustment-type-name"
              className="text-xs"
              required
            >
              Name
            </FieldLabel>
            <Input
              id="adjustment-type-name"
              placeholder="e.g. โอนออก"
              className="h-8 text-sm"
              disabled={isDisabled}
              maxLength={100}
              {...form.register("name")}
            />
            <FieldError>{form.formState.errors.name?.message}</FieldError>
          </Field>

          <Field data-invalid={!!form.formState.errors.type}>
            <FieldLabel className="text-xs" required>
              Type
            </FieldLabel>
            <Controller
              control={form.control}
              name="type"
              render={({ field }) => (
                <Select
                  value={field.value}
                  onValueChange={field.onChange}
                  disabled={isDisabled}
                >
                  <SelectTrigger className="h-8 w-full text-sm">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {ADJUSTMENT_TYPE_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            <FieldError>{form.formState.errors.type?.message}</FieldError>
          </Field>

          <Field>
            <FieldLabel
              htmlFor="adjustment-type-description"
              className="text-xs"
            >
              Description
            </FieldLabel>
            <Textarea
              id="adjustment-type-description"
              placeholder="Optional"
              className="text-sm"
              rows={2}
              disabled={isDisabled}
              maxLength={256}
              {...form.register("description")}
            />
          </Field>

          <Field>
            <FieldLabel
              htmlFor="adjustment-type-note"
              className="text-xs"
            >
              Note
            </FieldLabel>
            <Textarea
              id="adjustment-type-note"
              placeholder="Optional"
              className="text-sm"
              rows={2}
              disabled={isDisabled}
              maxLength={256}
              {...form.register("note")}
            />
          </Field>

          <Field orientation="horizontal">
            <Controller
              control={form.control}
              name="is_active"
              render={({ field }) => (
                <Checkbox
                  id="adjustment-type-is-active"
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  disabled={isDisabled}
                />
              )}
            />
            <FieldLabel htmlFor="adjustment-type-is-active" className="text-xs">
              Active
            </FieldLabel>
          </Field>
        </FieldGroup>
      </form>

      {adjustmentType && (
        <DeleteDialog
          open={showDelete}
          onOpenChange={(open) =>
            !open && !deleteAdjustmentType.isPending && setShowDelete(false)
          }
          title="Delete Adjustment Type"
          description={`Are you sure you want to delete adjustment type "${adjustmentType.name}"? This action cannot be undone.`}
          isPending={deleteAdjustmentType.isPending}
          onConfirm={handleDelete}
        />
      )}
    </div>
  );
}
