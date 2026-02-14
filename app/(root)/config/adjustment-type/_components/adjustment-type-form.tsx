"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { Pencil } from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import {
  useCreateAdjustmentType,
  useUpdateAdjustmentType,
} from "@/hooks/use-adjustment-type";
import type { AdjustmentType } from "@/types/adjustment-type";
import type { FormMode } from "@/types/form";
import {
  ADJUSTMENT_TYPE,
  ADJUSTMENT_TYPE_OPTIONS,
} from "@/constant/adjustment-type";
import DisplayTemplate from "@/components/display-template";

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
  const isAdd = mode === "add";

  const createAdjustmentType = useCreateAdjustmentType();
  const updateAdjustmentType = useUpdateAdjustmentType();
  const isPending =
    createAdjustmentType.isPending || updateAdjustmentType.isPending;
  const isDisabled = isView || isPending;

  const form = useForm<AdjustmentTypeFormValues>({
    resolver: zodResolver(adjustmentTypeSchema),
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
    } else if (isAdd) {
      createAdjustmentType.mutate(payload, {
        onSuccess: () => {
          toast.success("Adjustment type created successfully");
          router.push("/config/adjustment-type");
        },
        onError: (err) => toast.error(err.message),
      });
    }
  };

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

  const title = isAdd
    ? "Add Adjustment Type"
    : isEdit
      ? "Edit Adjustment Type"
      : "Adjustment Type";

  return (
    <DisplayTemplate
      title={title}
      actions={
        <>
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
                form="adjustment-type-form"
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
        </>
      }
    >
      <form
        id="adjustment-type-form"
        onSubmit={form.handleSubmit(onSubmit)}
        className="max-w-2xl space-y-4"
      >
        <FieldGroup className="gap-3">
          <Field data-invalid={!!form.formState.errors.code}>
            <FieldLabel htmlFor="adjustment-type-code" className="text-xs">
              Code
            </FieldLabel>
            <Input
              id="adjustment-type-code"
              placeholder="e.g. TRFOT"
              className="h-8 text-sm"
              disabled={isDisabled}
              {...form.register("code")}
            />
            <FieldError>{form.formState.errors.code?.message}</FieldError>
          </Field>

          <Field data-invalid={!!form.formState.errors.name}>
            <FieldLabel htmlFor="adjustment-type-name" className="text-xs">
              Name
            </FieldLabel>
            <Input
              id="adjustment-type-name"
              placeholder="e.g. โอนออก"
              className="h-8 text-sm"
              disabled={isDisabled}
              {...form.register("name")}
            />
            <FieldError>{form.formState.errors.name?.message}</FieldError>
          </Field>

          <Field data-invalid={!!form.formState.errors.type}>
            <FieldLabel className="text-xs">Type</FieldLabel>
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
              disabled={isDisabled}
              {...form.register("description")}
            />
          </Field>

          <Field>
            <FieldLabel htmlFor="adjustment-type-note" className="text-xs">
              Note
            </FieldLabel>
            <Textarea
              id="adjustment-type-note"
              placeholder="Optional"
              className="text-sm"
              disabled={isDisabled}
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
            <FieldLabel
              htmlFor="adjustment-type-is-active"
              className="text-xs"
            >
              Active
            </FieldLabel>
          </Field>
        </FieldGroup>
      </form>
    </DisplayTemplate>
  );
}
