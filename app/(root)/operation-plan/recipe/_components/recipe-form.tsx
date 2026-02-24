"use client";
"use no memo";

import { useState, useMemo, useEffect } from "react";
import { useForm, useWatch, type Resolver, type UseFormReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { BookOpen, DollarSign, ShieldCheck } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  useCreateRecipe,
  useUpdateRecipe,
  useDeleteRecipe,
} from "@/hooks/use-recipe";
import type { Recipe } from "@/types/recipe";
import type { FormMode } from "@/types/form";
import {
  recipeSchema,
  type RecipeFormValues,
  getDefaultValues,
  textToArray,
  textToObject,
  mergeAllergens,
} from "./recipe-form-schema";
import { RecipeGeneralFields } from "./recipe-general-fields";
import { RecipeCostFields } from "./recipe-cost-fields";
import { RecipeComplianceFields } from "./recipe-compliance-fields";

// ── Auto-calc helpers ──

const round2 = (n: number): number =>
  Number(Math.round(Number.parseFloat(n + "e2")) + "e-2");

export interface RecipeComputed {
  costPerPortion: number;
  grossMargin: number | null;
  grossMarginPct: number | null;
  actualFoodCostPct: number | null;
  laborCostPct: number | null;
  overheadPct: number | null;
  suggestedPrice: number | null;
}

function useRecipeCostCalc(form: UseFormReturn<RecipeFormValues>): RecipeComputed {
  const [
    ingredientCost,
    laborCost,
    overheadCost,
    baseYield,
    sellingPrice,
    targetFoodCostPct,
  ] = useWatch({
    control: form.control,
    name: [
      "total_ingredient_cost",
      "labor_cost",
      "overhead_cost",
      "base_yield",
      "selling_price",
      "target_food_cost_percentage",
    ],
  });

  const computed = useMemo(() => {
    const ing = Number(ingredientCost) || 0;
    const lab = Number(laborCost) || 0;
    const ovh = Number(overheadCost) || 0;
    const yld = Number(baseYield) || 0;
    const sell = Number(sellingPrice) || 0;
    const targetPct = Number(targetFoodCostPct) || 0;

    const totalCost = ing + lab + ovh;
    const costPerPortion = yld > 0 ? round2(totalCost / yld) : 0;
    const grossMargin = sell > 0 ? round2(sell - costPerPortion) : null;
    const grossMarginPct =
      sell > 0 && grossMargin != null
        ? round2((grossMargin / sell) * 100)
        : null;
    const actualFoodCostPct =
      sell > 0 ? round2((ing / sell) * 100) : null;
    const laborCostPct = sell > 0 ? round2((lab / sell) * 100) : null;
    const overheadPct = sell > 0 ? round2((ovh / sell) * 100) : null;
    const suggestedPrice =
      targetPct > 0 && targetPct < 100
        ? round2(costPerPortion / (1 - targetPct / 100))
        : null;

    return {
      costPerPortion,
      grossMargin,
      grossMarginPct,
      actualFoodCostPct,
      laborCostPct,
      overheadPct,
      suggestedPrice,
    };
  }, [ingredientCost, laborCost, overheadCost, baseYield, sellingPrice, targetFoodCostPct]);

  useEffect(() => {
    form.setValue("cost_per_portion", computed.costPerPortion);
    form.setValue("gross_margin", computed.grossMargin);
    form.setValue("gross_margin_percentage", computed.grossMarginPct);
    form.setValue("actual_food_cost_percentage", computed.actualFoodCostPct);
    form.setValue("labor_cost_percentage", computed.laborCostPct);
    form.setValue("overhead_percentage", computed.overheadPct);
    form.setValue("suggested_price", computed.suggestedPrice);
  }, [computed, form]);

  return computed;
}

// ── Tab error mapping ──

const TAB_FIELDS: Record<string, string[]> = {
  general: [
    "code", "name", "status", "difficulty", "cuisine_id", "category_id",
    "prep_time", "cook_time", "base_yield", "base_yield_unit",
    "description", "note", "is_active",
  ],
  cost: [
    "total_ingredient_cost", "labor_cost", "overhead_cost", "cost_per_portion",
    "selling_price", "suggested_price", "gross_margin", "gross_margin_percentage",
    "actual_food_cost_percentage", "target_food_cost_percentage",
    "labor_cost_percentage", "overhead_percentage",
  ],
  compliance: [
    "allergens", "carbon_footprint", "tags", "images",
    "deduct_from_stock", "info", "dimension",
  ],
};

// ── Component ──

interface RecipeFormProps {
  readonly recipe?: Recipe;
}

export function RecipeForm({ recipe }: RecipeFormProps) {
  const router = useRouter();
  const [mode, setMode] = useState<FormMode>(recipe ? "view" : "add");
  const isView = mode === "view";
  const isEdit = mode === "edit";
  const isAdd = mode === "add";

  const createRecipe = useCreateRecipe();
  const updateRecipe = useUpdateRecipe();
  const deleteRecipe = useDeleteRecipe();
  const [showDelete, setShowDelete] = useState(false);
  const isPending = createRecipe.isPending || updateRecipe.isPending;
  const isDisabled = isView || isPending;

  const defaultValues = getDefaultValues(recipe);

  const form = useForm<RecipeFormValues>({
    resolver: zodResolver(recipeSchema) as Resolver<RecipeFormValues>,
    defaultValues,
  });

  const computed = useRecipeCostCalc(form);

  // ── Tab error indicators ──
  const errors = form.formState.errors;
  const tabErrors = useMemo(() => {
    const result: Record<string, boolean> = {};
    for (const [tab, fields] of Object.entries(TAB_FIELDS)) {
      result[tab] = fields.some((f) => f in errors);
    }
    return result;
  }, [errors]);

  // ── Discard dialog ──
  const [showDiscard, setShowDiscard] = useState(false);
  const [discardAction, setDiscardAction] = useState<(() => void) | null>(null);

  // ── Submit ──
  const onSubmit = (values: RecipeFormValues) => {
    const payload = {
      code: values.code,
      name: values.name,
      description: values.description || null,
      note: values.note || null,
      status: values.status,
      difficulty: values.difficulty,
      cuisine_id: values.cuisine_id!,
      category_id: values.category_id!,
      prep_time: values.prep_time,
      cook_time: values.cook_time,
      base_yield: values.base_yield,
      base_yield_unit: values.base_yield_unit!,
      total_ingredient_cost: values.total_ingredient_cost,
      labor_cost: values.labor_cost,
      overhead_cost: values.overhead_cost,
      cost_per_portion: values.cost_per_portion,
      selling_price: values.selling_price,
      suggested_price: values.suggested_price,
      gross_margin: values.gross_margin,
      gross_margin_percentage: values.gross_margin_percentage,
      actual_food_cost_percentage: values.actual_food_cost_percentage,
      target_food_cost_percentage: values.target_food_cost_percentage,
      labor_cost_percentage: values.labor_cost_percentage,
      overhead_percentage: values.overhead_percentage,
      allergens: mergeAllergens(values.allergens),
      tags: textToArray(values.tags) ?? [],
      images: textToArray(values.images) ?? [],
      carbon_footprint: values.carbon_footprint,
      deduct_from_stock: values.deduct_from_stock,
      default_variant_id: values.default_variant_id || null,
      info: textToObject(values.info),
      dimension: textToObject(values.dimension),
      is_active: values.is_active,
    };

    if (isEdit && recipe) {
      updateRecipe.mutate(
        { id: recipe.id, ...payload },
        {
          onSuccess: () => {
            toast.success("Recipe updated successfully");
            router.push("/operation-plan/recipe");
          },
          onError: (err) => toast.error(err.message),
        },
      );
    } else {
      createRecipe.mutate(payload, {
        onSuccess: () => {
          toast.success("Recipe created successfully");
          router.push("/operation-plan/recipe");
        },
        onError: (err) => toast.error(err.message),
      });
    }
  };

  // ── Handlers ──
  const handleBack = () => {
    const doBack = () => router.push("/operation-plan/recipe");
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
      if (isEdit && recipe) {
        form.reset(getDefaultValues(recipe));
        setMode("view");
      } else {
        router.push("/operation-plan/recipe");
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
    if (!recipe) return;
    deleteRecipe.mutate(recipe.id, {
      onSuccess: () => {
        toast.success("Recipe deleted successfully");
        router.push("/operation-plan/recipe");
      },
      onError: (err) => toast.error(err.message),
    });
  };

  return (
    <div className="space-y-4">
      <FormToolbar
        entity="Recipe"
        mode={mode}
        formId="recipe-form"
        isPending={isPending}
        onBack={handleBack}
        onEdit={handleEdit}
        onCancel={handleCancel}
        onDelete={recipe ? () => setShowDelete(true) : undefined}
        deleteIsPending={deleteRecipe.isPending}
      />

      <form
        id="recipe-form"
        onSubmit={form.handleSubmit(onSubmit)}
        className="max-w-4xl"
      >
        <Tabs defaultValue="general">
          <TabsList variant="line">
            <TabsTrigger value="general" className="relative text-xs">
              <BookOpen className="size-3.5" aria-hidden="true" />
              General
              {tabErrors.general && (
                <span
                  className="absolute -right-0.5 -top-0.5 size-2 rounded-full bg-destructive"
                  aria-label="Has validation errors"
                />
              )}
            </TabsTrigger>
            <TabsTrigger value="cost" className="relative text-xs">
              <DollarSign className="size-3.5" aria-hidden="true" />
              Cost & Pricing
              {tabErrors.cost && (
                <span
                  className="absolute -right-0.5 -top-0.5 size-2 rounded-full bg-destructive"
                  aria-label="Has validation errors"
                />
              )}
            </TabsTrigger>
            <TabsTrigger value="compliance" className="relative text-xs">
              <ShieldCheck className="size-3.5" aria-hidden="true" />
              Compliance & Media
              {tabErrors.compliance && (
                <span
                  className="absolute -right-0.5 -top-0.5 size-2 rounded-full bg-destructive"
                  aria-label="Has validation errors"
                />
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-2.5 pt-2.5">
            <RecipeGeneralFields form={form} isDisabled={isDisabled} />
          </TabsContent>

          <TabsContent value="cost" className="space-y-2.5 pt-2.5">
            <RecipeCostFields
              form={form}
              isDisabled={isDisabled}
              computed={computed}
            />
          </TabsContent>

          <TabsContent value="compliance" className="space-y-2.5 pt-2.5">
            <RecipeComplianceFields form={form} isDisabled={isDisabled} />
          </TabsContent>
        </Tabs>
      </form>

      {recipe && (
        <DeleteDialog
          open={showDelete}
          onOpenChange={(open) =>
            !open && !deleteRecipe.isPending && setShowDelete(false)
          }
          title="Delete Recipe"
          description={`Are you sure you want to delete recipe "${recipe.name}"? This action cannot be undone.`}
          isPending={deleteRecipe.isPending}
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
