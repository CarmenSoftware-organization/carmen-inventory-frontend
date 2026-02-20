"use client";

import { useState } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FormToolbar } from "@/components/ui/form-toolbar";
import { DeleteDialog } from "@/components/ui/delete-dialog";
import { toast } from "sonner";
import {
  useCreateRecipe,
  useUpdateRecipe,
  useDeleteRecipe,
} from "@/hooks/use-recipe";
import type { Recipe } from "@/types/recipe";
import type { FormMode } from "@/types/form";
import { RecipeGeneralFields } from "./recipe-general-fields";
import { RecipePreparationFields } from "./recipe-preparation-fields";
import { RecipeCostFields } from "./recipe-cost-fields";
import { RecipeDetailFields } from "./recipe-detail-fields";

function arrayToText(value: string[] | null | undefined): string {
  if (!value || value.length === 0) return "";
  return value.join("\n");
}

function textToArray(value: string): string[] {
  return value
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);
}

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

const recipeSchema = z.object({
  code: z.string().min(1, "Code is required"),
  name: z.string().min(1, "Name is required"),
  description: z.string(),
  note: z.string(),
  status: z.string().min(1, "Status is required"),
  difficulty: z.string().min(1, "Difficulty is required"),
  cuisine_id: z
    .string()
    .nullable()
    .refine((v) => !!v, "Cuisine is required"),
  category_id: z
    .string()
    .nullable()
    .refine((v) => !!v, "Category is required"),
  prep_time: z.coerce.number().min(0),
  cook_time: z.coerce.number().min(0),
  base_yield: z.coerce.number().min(0),
  base_yield_unit: z.string().min(1, "Unit is required"),
  total_ingredient_cost: z.coerce.number().min(0),
  labor_cost: z.coerce.number().min(0),
  overhead_cost: z.coerce.number().min(0),
  cost_per_portion: z.coerce.number().min(0),
  selling_price: z.coerce.number().nullable(),
  suggested_price: z.coerce.number().nullable(),
  gross_margin: z.coerce.number().nullable(),
  gross_margin_percentage: z.coerce.number().nullable(),
  actual_food_cost_percentage: z.coerce.number().nullable(),
  target_food_cost_percentage: z.coerce.number().nullable(),
  labor_cost_percentage: z.coerce.number().nullable(),
  overhead_percentage: z.coerce.number().nullable(),
  allergens: z.string(),
  tags: z.string(),
  images: z.string(),
  carbon_footprint: z.coerce.number().nullable(),
  deduct_from_stock: z.boolean(),
  default_variant_id: z.string().nullable(),
  info: z.string(),
  dimension: z.string(),
  is_active: z.boolean(),
});

export type RecipeFormValues = z.infer<typeof recipeSchema>;

interface RecipeFormProps {
  readonly recipe?: Recipe;
}

export function RecipeForm({ recipe }: RecipeFormProps) {
  const router = useRouter();
  const [mode, setMode] = useState<FormMode>(recipe ? "view" : "add");
  const isView = mode === "view";
  const isEdit = mode === "edit";

  const createRecipe = useCreateRecipe();
  const updateRecipe = useUpdateRecipe();
  const deleteRecipe = useDeleteRecipe();
  const [showDelete, setShowDelete] = useState(false);
  const isPending = createRecipe.isPending || updateRecipe.isPending;
  const isDisabled = isView || isPending;

  const getDefaults = (r?: Recipe): RecipeFormValues =>
    r
      ? {
          code: r.code,
          name: r.name,
          description: r.description ?? "",
          note: r.note ?? "",
          status: r.status,
          difficulty: r.difficulty,
          cuisine_id: r.cuisine_id,
          category_id: r.category_id,
          prep_time: r.prep_time,
          cook_time: r.cook_time,
          base_yield: r.base_yield,
          base_yield_unit: r.base_yield_unit,
          total_ingredient_cost: r.total_ingredient_cost,
          labor_cost: r.labor_cost,
          overhead_cost: r.overhead_cost,
          cost_per_portion: r.cost_per_portion,
          selling_price: r.selling_price,
          suggested_price: r.suggested_price,
          gross_margin: r.gross_margin,
          gross_margin_percentage: r.gross_margin_percentage,
          actual_food_cost_percentage: r.actual_food_cost_percentage,
          target_food_cost_percentage: r.target_food_cost_percentage,
          labor_cost_percentage: r.labor_cost_percentage,
          overhead_percentage: r.overhead_percentage,
          allergens: arrayToText(r.allergens),
          tags: arrayToText(r.tags),
          images: arrayToText(r.images),
          carbon_footprint: r.carbon_footprint,
          deduct_from_stock: r.deduct_from_stock,
          default_variant_id: r.default_variant_id,
          info: objectToText(r.info),
          dimension: objectToText(r.dimension),
          is_active: r.is_active,
        }
      : {
          code: "",
          name: "",
          description: "",
          note: "",
          status: "DRAFT",
          difficulty: "EASY",
          cuisine_id: null,
          category_id: null,
          prep_time: 0,
          cook_time: 0,
          base_yield: 0,
          base_yield_unit: "",
          total_ingredient_cost: 0,
          labor_cost: 0,
          overhead_cost: 0,
          cost_per_portion: 0,
          selling_price: null,
          suggested_price: null,
          gross_margin: null,
          gross_margin_percentage: null,
          actual_food_cost_percentage: null,
          target_food_cost_percentage: null,
          labor_cost_percentage: null,
          overhead_percentage: null,
          allergens: "",
          tags: "",
          images: "",
          carbon_footprint: null,
          deduct_from_stock: false,
          default_variant_id: null,
          info: "",
          dimension: "",
          is_active: true,
        };

  const form = useForm<RecipeFormValues>({
    resolver: zodResolver(recipeSchema) as Resolver<RecipeFormValues>,
    defaultValues: getDefaults(recipe),
  });

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
      base_yield_unit: values.base_yield_unit,
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
      allergens: textToArray(values.allergens),
      tags: textToArray(values.tags),
      images: textToArray(values.images),
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

  const handleBack = () => router.push("/operation-plan/recipe");
  const handleEdit = () => setMode("edit");
  const handleCancel = () => {
    if (isEdit && recipe) {
      form.reset(getDefaults(recipe));
      setMode("view");
    } else {
      router.push("/operation-plan/recipe");
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
        className="max-w-3xl"
      >
        <Tabs defaultValue="general">
          <TabsList variant="line">
            <TabsTrigger value="general" className="text-xs">
              General
            </TabsTrigger>
            <TabsTrigger value="preparation" className="text-xs">
              Preparation
            </TabsTrigger>
            <TabsTrigger value="cost" className="text-xs">
              Cost & Pricing
            </TabsTrigger>
            <TabsTrigger value="details" className="text-xs">
              Details
            </TabsTrigger>
          </TabsList>

          <TabsContent value="general">
            <RecipeGeneralFields form={form} isDisabled={isDisabled} />
          </TabsContent>

          <TabsContent value="preparation">
            <RecipePreparationFields form={form} isDisabled={isDisabled} />
          </TabsContent>

          <TabsContent value="cost">
            <RecipeCostFields form={form} isDisabled={isDisabled} />
          </TabsContent>

          <TabsContent value="details">
            <RecipeDetailFields form={form} isDisabled={isDisabled} />
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
    </div>
  );
}
