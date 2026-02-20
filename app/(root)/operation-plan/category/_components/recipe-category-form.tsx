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
  FieldDescription,
} from "@/components/ui/field";
import { Textarea } from "@/components/ui/textarea";
import { FormToolbar } from "@/components/ui/form-toolbar";
import { DeleteDialog } from "@/components/ui/delete-dialog";
import { toast } from "sonner";
import {
  useCreateRecipeCategory,
  useUpdateRecipeCategory,
  useDeleteRecipeCategory,
} from "@/hooks/use-recipe-category";
import { LookupRecipeCategory } from "@/components/lookup/lookup-recipe-category";
import type { RecipeCategory } from "@/types/recipe-category";
import type { FormMode } from "@/types/form";

function objectToText(
  value: Record<string, unknown> | null | undefined,
): string {
  if (!value || Object.keys(value).length === 0) return "";
  return JSON.stringify(value, null, 2);
}

function textToObject(value: string): Record<string, unknown> | null {
  if (!value.trim()) return null;
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

const recipeCategorySchema = z.object({
  code: z.string().min(1, "Code is required"),
  name: z.string().min(1, "Name is required"),
  description: z.string(),
  note: z.string(),
  is_active: z.boolean(),
  parent_id: z.string().nullable(),
  level: z.coerce.number().min(1, "Level must be at least 1"),
  default_cost_settings: z.string(),
  default_margins: z.string(),
  info: z.string(),
  dimension: z.string(),
});

type RecipeCategoryFormValues = z.infer<typeof recipeCategorySchema>;

interface RecipeCategoryFormProps {
  readonly category?: RecipeCategory;
}

export function RecipeCategoryForm({ category }: RecipeCategoryFormProps) {
  const router = useRouter();
  const [mode, setMode] = useState<FormMode>(category ? "view" : "add");
  const isView = mode === "view";
  const isEdit = mode === "edit";

  const createCategory = useCreateRecipeCategory();
  const updateCategory = useUpdateRecipeCategory();
  const deleteCategory = useDeleteRecipeCategory();
  const [showDelete, setShowDelete] = useState(false);
  const isPending = createCategory.isPending || updateCategory.isPending;
  const isDisabled = isView || isPending;

  const form = useForm<RecipeCategoryFormValues>({
    resolver: zodResolver(
      recipeCategorySchema,
    ) as Resolver<RecipeCategoryFormValues>,
    defaultValues: category
      ? {
          code: category.code,
          name: category.name,
          description: category.description ?? "",
          note: category.note ?? "",
          is_active: category.is_active,
          parent_id: category.parent_id,
          level: category.level,
          default_cost_settings: objectToText(category.default_cost_settings),
          default_margins: objectToText(category.default_margins),
          info: objectToText(category.info),
          dimension: objectToText(category.dimension),
        }
      : {
          code: "",
          name: "",
          description: "",
          note: "",
          is_active: true,
          parent_id: null,
          level: 1,
          default_cost_settings: "",
          default_margins: "",
          info: "",
          dimension: "",
        },
  });

  const onSubmit = (values: RecipeCategoryFormValues) => {
    const payload = {
      code: values.code,
      name: values.name,
      description: values.description || null,
      note: values.note || null,
      is_active: values.is_active,
      parent_id: values.parent_id || null,
      level: values.level,
      default_cost_settings: textToObject(values.default_cost_settings),
      default_margins: textToObject(values.default_margins),
      info: textToObject(values.info),
      dimension: textToObject(values.dimension),
    };

    if (isEdit && category) {
      updateCategory.mutate(
        { id: category.id, ...payload },
        {
          onSuccess: () => {
            toast.success("Recipe category updated successfully");
            router.push("/operation-plan/category");
          },
          onError: (err) => toast.error(err.message),
        },
      );
    } else {
      createCategory.mutate(payload, {
        onSuccess: () => {
          toast.success("Recipe category created successfully");
          router.push("/operation-plan/category");
        },
        onError: (err) => toast.error(err.message),
      });
    }
  };

  const handleBack = () => router.push("/operation-plan/category");

  const handleEdit = () => setMode("edit");

  const handleCancel = () => {
    if (isEdit && category) {
      form.reset({
        code: category.code,
        name: category.name,
        description: category.description ?? "",
        note: category.note ?? "",
        is_active: category.is_active,
        parent_id: category.parent_id,
        level: category.level,
        default_cost_settings: objectToText(category.default_cost_settings),
        default_margins: objectToText(category.default_margins),
        info: objectToText(category.info),
        dimension: objectToText(category.dimension),
      });
      setMode("view");
    } else {
      router.push("/operation-plan/category");
    }
  };

  const handleDelete = () => {
    if (!category) return;
    deleteCategory.mutate(category.id, {
      onSuccess: () => {
        toast.success("Recipe category deleted successfully");
        router.push("/operation-plan/category");
      },
      onError: (err) => toast.error(err.message),
    });
  };

  return (
    <div className="space-y-4">
      <FormToolbar
        entity="Recipe Category"
        mode={mode}
        formId="recipe-category-form"
        isPending={isPending}
        onBack={handleBack}
        onEdit={handleEdit}
        onCancel={handleCancel}
        onDelete={category ? () => setShowDelete(true) : undefined}
        deleteIsPending={deleteCategory.isPending}
      />

      <form
        id="recipe-category-form"
        onSubmit={form.handleSubmit(onSubmit)}
        className="max-w-2xl space-y-4"
      >
        {/* ── General Information ── */}
        <section className="space-y-3">
          <h2 className="text-sm font-semibold">General Information</h2>
          <FieldGroup className="gap-3">
            <div className="grid grid-cols-2 gap-2">
              <Field data-invalid={!!form.formState.errors.code}>
                <FieldLabel className="text-xs" required>
                  Code
                </FieldLabel>
                <Input
                  placeholder="e.g. APPETIZER"
                  className="h-8 text-sm"
                  disabled={isDisabled}
                  {...form.register("code")}
                />
                <FieldError>{form.formState.errors.code?.message}</FieldError>
              </Field>

              <Field data-invalid={!!form.formState.errors.name}>
                <FieldLabel className="text-xs" required>
                  Name
                </FieldLabel>
                <Input
                  placeholder="e.g. Appetizer"
                  className="h-8 text-sm"
                  disabled={isDisabled}
                  {...form.register("name")}
                />
                <FieldError>{form.formState.errors.name?.message}</FieldError>
              </Field>

              <Field>
                <FieldLabel className="text-xs">Parent Category</FieldLabel>
                <Controller
                  control={form.control}
                  name="parent_id"
                  render={({ field }) => (
                    <LookupRecipeCategory
                      value={field.value ?? ""}
                      onValueChange={field.onChange}
                      disabled={isDisabled}
                      excludeIds={category ? new Set([category.id]) : undefined}
                    />
                  )}
                />
                <FieldDescription className="text-xs">
                  Select a parent to create a sub-category
                </FieldDescription>
              </Field>

              <Field data-invalid={!!form.formState.errors.level}>
                <FieldLabel className="text-xs" required>
                  Level
                </FieldLabel>
                <Input
                  type="number"
                  min={1}
                  placeholder="1"
                  className="h-8 text-sm"
                  disabled={isDisabled}
                  {...form.register("level")}
                />
                <FieldError>{form.formState.errors.level?.message}</FieldError>
                <FieldDescription className="text-xs">
                  Hierarchy depth (1 = top-level)
                </FieldDescription>
              </Field>

              <Field className="col-span-2">
                <FieldLabel className="text-xs">Description</FieldLabel>
                <Textarea
                  placeholder="Optional"
                  className="text-sm"
                  rows={2}
                  disabled={isDisabled}
                  {...form.register("description")}
                />
              </Field>
            </div>
          </FieldGroup>
        </section>

        {/* ── Settings ── */}
        <section className="space-y-3">
          <h2 className="text-sm font-semibold">Settings</h2>
          <FieldGroup className="gap-3">
            <div className="grid grid-cols-2 gap-2">
              <Field>
                <FieldLabel className="text-xs">
                  Default Cost Settings
                </FieldLabel>
                <Textarea
                  placeholder="{}"
                  className="text-sm"
                  rows={3}
                  disabled={isDisabled}
                  {...form.register("default_cost_settings")}
                />
                <FieldDescription className="text-xs">
                  JSON format for default cost configuration
                </FieldDescription>
              </Field>

              <Field>
                <FieldLabel className="text-xs">Default Margins</FieldLabel>
                <Textarea
                  placeholder="Enter default margins ..."
                  className="text-sm"
                  rows={3}
                  disabled={isDisabled}
                  {...form.register("default_margins")}
                />
                <FieldDescription className="text-xs">
                  JSON format for default margin targets
                </FieldDescription>
              </Field>

              <Field>
                <FieldLabel className="text-xs">Info</FieldLabel>
                <Textarea
                  placeholder="Enter info ..."
                  className="text-sm"
                  rows={3}
                  disabled={isDisabled}
                  {...form.register("info")}
                />
              </Field>

              <Field>
                <FieldLabel className="text-xs">Dimension</FieldLabel>
                <Textarea
                  placeholder="Enter dimension ..."
                  className="text-sm"
                  rows={3}
                  disabled={isDisabled}
                  {...form.register("dimension")}
                />
              </Field>
            </div>
          </FieldGroup>
        </section>

        {/* ── Additional ── */}
        <section className="space-y-3">
          <h2 className="text-sm font-semibold">Additional</h2>
          <FieldGroup className="gap-3">
            <Field>
              <FieldLabel className="text-xs">Note</FieldLabel>
              <Textarea
                placeholder="Optional"
                className="text-sm"
                rows={2}
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
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    disabled={isDisabled}
                  />
                )}
              />
              <FieldLabel className="text-xs">Active</FieldLabel>
            </Field>
          </FieldGroup>
        </section>
      </form>

      {category && (
        <DeleteDialog
          open={showDelete}
          onOpenChange={(open) =>
            !open && !deleteCategory.isPending && setShowDelete(false)
          }
          title="Delete Recipe Category"
          description={`Are you sure you want to delete recipe category "${category.name}"? This action cannot be undone.`}
          isPending={deleteCategory.isPending}
          onConfirm={handleDelete}
        />
      )}
    </div>
  );
}
