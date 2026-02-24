"use client";

import { useState } from "react";
import { useForm, Controller, type Resolver } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import {
  useCreateRecipeCategory,
  useUpdateRecipeCategory,
  useDeleteRecipeCategory,
} from "@/hooks/use-recipe-category";
import { LookupRecipeCategory } from "@/components/lookup/lookup-recipe-category";
import type { RecipeCategory } from "@/types/recipe-category";
import type { FormMode } from "@/types/form";

const recipeCategorySchema = z.object({
  code: z.string().min(1, "Code is required"),
  name: z.string().min(1, "Name is required"),
  description: z.string(),
  parent_id: z.string().nullable(),
  level: z.coerce.number().min(1, "Level must be at least 1"),
  // ── Default Cost Settings (fixed) ──
  cost_labor_percentage: z.coerce.number().min(0),
  cost_overhead_percentage: z.coerce.number().min(0),
  cost_target_food_cost_percentage: z.coerce.number().min(0),
  // ── Default Profit Margins (fixed) ──
  margin_minimum: z.coerce.number().min(0),
  margin_target: z.coerce.number().min(0),
});

type RecipeCategoryFormValues = z.infer<typeof recipeCategorySchema>;

const getDefaultValues = (
  category?: RecipeCategory,
): RecipeCategoryFormValues => {
  if (!category) {
    return {
      code: "",
      name: "",
      description: "",
      parent_id: null,
      level: 1,
      cost_labor_percentage: 0,
      cost_overhead_percentage: 0,
      cost_target_food_cost_percentage: 0,
      margin_minimum: 0,
      margin_target: 0,
    };
  }

  const costSettings = category.default_cost_settings as
    | Record<string, number>
    | null
    | undefined;
  const margins = category.default_margins as
    | Record<string, number>
    | null
    | undefined;

  return {
    code: category.code,
    name: category.name,
    description: category.description ?? "",
    parent_id: category.parent_id,
    level: category.level,
    cost_labor_percentage: costSettings?.labor_cost_percentage ?? 0,
    cost_overhead_percentage: costSettings?.overhead_percentage ?? 0,
    cost_target_food_cost_percentage:
      costSettings?.target_food_cost_percentage ?? 0,
    margin_minimum: margins?.minimum_profit_margin ?? 0,
    margin_target: margins?.target_profit_margin ?? 0,
  };
};

interface RecipeCategoryFormProps {
  readonly category?: RecipeCategory;
}

export function RecipeCategoryForm({ category }: RecipeCategoryFormProps) {
  const router = useRouter();
  const [mode, setMode] = useState<FormMode>(category ? "view" : "add");
  const isView = mode === "view";
  const isEdit = mode === "edit";
  const isAdd = mode === "add";

  const createCategory = useCreateRecipeCategory();
  const updateCategory = useUpdateRecipeCategory();
  const deleteCategory = useDeleteRecipeCategory();
  const [showDelete, setShowDelete] = useState(false);
  const isPending = createCategory.isPending || updateCategory.isPending;
  const isDisabled = isView || isPending;

  // ── Discard dialog ──
  const [showDiscard, setShowDiscard] = useState(false);
  const [discardAction, setDiscardAction] = useState<(() => void) | null>(null);

  const form = useForm<RecipeCategoryFormValues>({
    resolver: zodResolver(
      recipeCategorySchema,
    ) as Resolver<RecipeCategoryFormValues>,
    defaultValues: getDefaultValues(category),
  });

  const onSubmit = (values: RecipeCategoryFormValues) => {
    const payload = {
      code: values.code,
      name: values.name,
      description: values.description || null,
      note: null,
      is_active: true,
      parent_id: values.parent_id || null,
      level: values.level,
      default_cost_settings: {
        labor_cost_percentage: values.cost_labor_percentage,
        overhead_percentage: values.cost_overhead_percentage,
        target_food_cost_percentage: values.cost_target_food_cost_percentage,
      },
      default_margins: {
        minimum_profit_margin: values.margin_minimum,
        target_profit_margin: values.margin_target,
      },
      info: null,
      dimension: null,
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

  const handleBack = () => {
    const doBack = () => router.push("/operation-plan/category");
    if ((isEdit || isAdd) && form.formState.isDirty) {
      setDiscardAction(() => doBack);
      setShowDiscard(true);
    } else {
      doBack();
    }
  };

  const handleEdit = () => setMode("edit");

  const handleCancel = () => {
    const doCancel = () => {
      if (isEdit && category) {
        form.reset(getDefaultValues(category));
        setMode("view");
      } else {
        router.push("/operation-plan/category");
      }
    };
    if (form.formState.isDirty) {
      setDiscardAction(() => doCancel);
      setShowDiscard(true);
    } else {
      doCancel();
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
                <FieldLabel htmlFor="rc-code" className="text-xs" required>
                  Code
                </FieldLabel>
                <Input
                  id="rc-code"
                  placeholder="e.g. APPETIZER"
                  className="h-8 text-sm"
                  disabled={isDisabled}
                  maxLength={10}
                  {...form.register("code")}
                />
                <FieldError>{form.formState.errors.code?.message}</FieldError>
              </Field>

              <Field data-invalid={!!form.formState.errors.name}>
                <FieldLabel htmlFor="rc-name" className="text-xs" required>
                  Name
                </FieldLabel>
                <Input
                  id="rc-name"
                  placeholder="e.g. Appetizer"
                  className="h-8 text-sm"
                  disabled={isDisabled}
                  maxLength={100}
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
                <FieldLabel htmlFor="rc-level" className="text-xs" required>
                  Level
                </FieldLabel>
                <Input
                  id="rc-level"
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
                <FieldLabel htmlFor="rc-description" className="text-xs">
                  Description
                </FieldLabel>
                <Textarea
                  id="rc-description"
                  placeholder="Optional"
                  className="text-sm"
                  rows={2}
                  disabled={isDisabled}
                  maxLength={256}
                  {...form.register("description")}
                />
              </Field>
            </div>
          </FieldGroup>
        </section>

        {/* ── Default Cost Settings ── */}
        <section className="space-y-3">
          <h2 className="text-sm font-semibold">Default Cost Settings</h2>
          <FieldGroup className="gap-3">
            <div className="grid grid-cols-3 gap-2">
              <Field>
                <FieldLabel htmlFor="rc-cost-labor" className="text-xs">
                  Labor Cost Percentage
                </FieldLabel>
                <div className="relative">
                  <Input
                    id="rc-cost-labor"
                    type="number"
                    step="0.01"
                    min={0}
                    placeholder="0"
                    className="h-8 pr-10 text-right text-sm"
                    disabled={isDisabled}
                    {...form.register("cost_labor_percentage")}
                  />
                  <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                    %
                  </span>
                </div>
              </Field>

              <Field>
                <FieldLabel htmlFor="rc-cost-overhead" className="text-xs">
                  Overhead Percentage
                </FieldLabel>
                <div className="relative">
                  <Input
                    id="rc-cost-overhead"
                    type="number"
                    step="0.01"
                    min={0}
                    placeholder="0"
                    className="h-8 pr-10 text-right text-sm"
                    disabled={isDisabled}
                    {...form.register("cost_overhead_percentage")}
                  />
                  <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                    %
                  </span>
                </div>
              </Field>

              <Field>
                <FieldLabel htmlFor="rc-cost-food" className="text-xs">
                  Target Food Cost Percentage
                </FieldLabel>
                <div className="relative">
                  <Input
                    id="rc-cost-food"
                    type="number"
                    step="0.01"
                    min={0}
                    placeholder="0"
                    className="h-8 pr-10 text-right text-sm"
                    disabled={isDisabled}
                    {...form.register("cost_target_food_cost_percentage")}
                  />
                  <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                    %
                  </span>
                </div>
              </Field>
            </div>
          </FieldGroup>
        </section>

        {/* ── Default Profit Margins ── */}
        <section className="space-y-3">
          <h2 className="text-sm font-semibold">Default Profit Margins</h2>
          <FieldGroup className="gap-3">
            <div className="grid grid-cols-2 gap-2">
              <Field>
                <FieldLabel htmlFor="rc-margin-min" className="text-xs">
                  Minimum Profit Margin
                </FieldLabel>
                <div className="relative">
                  <Input
                    id="rc-margin-min"
                    type="number"
                    step="0.01"
                    min={0}
                    placeholder="0"
                    className="h-8 pr-10 text-right text-sm"
                    disabled={isDisabled}
                    {...form.register("margin_minimum")}
                  />
                  <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                    %
                  </span>
                </div>
                <FieldDescription className="text-xs">
                  Minimum acceptable profit margin
                </FieldDescription>
              </Field>

              <Field>
                <FieldLabel htmlFor="rc-margin-target" className="text-xs">
                  Target Profit Margin
                </FieldLabel>
                <div className="relative">
                  <Input
                    id="rc-margin-target"
                    type="number"
                    step="0.01"
                    min={0}
                    placeholder="0"
                    className="h-8 pr-10 text-right text-sm"
                    disabled={isDisabled}
                    {...form.register("margin_target")}
                  />
                  <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                    %
                  </span>
                </div>
                <FieldDescription className="text-xs">
                  Ideal profit margin to target
                </FieldDescription>
              </Field>
            </div>
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

      <AlertDialog open={showDiscard} onOpenChange={setShowDiscard}>
        <AlertDialogContent size="sm">
          <AlertDialogHeader>
            <AlertDialogTitle>Discard changes?</AlertDialogTitle>
            <AlertDialogDescription>
              You have unsaved changes that will be lost.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep editing</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={() => {
                discardAction?.();
                setDiscardAction(null);
              }}
            >
              Discard
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
