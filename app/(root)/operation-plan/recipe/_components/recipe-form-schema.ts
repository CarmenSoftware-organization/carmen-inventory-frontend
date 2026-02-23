import { z } from "zod";
import type { Recipe } from "@/types/recipe";
import { ALLERGEN_OPTIONS } from "@/constant/recipe";
import {
  arrayToText,
  objectToText,
} from "@/lib/form-helpers";

export { textToArray, textToObject } from "@/lib/form-helpers";

const STANDARD_ALLERGEN_VALUES = new Set(
  ALLERGEN_OPTIONS.map((a) => a.value as string),
);

export function splitAllergens(
  allergens: string[] | null | undefined,
): { standard: string[]; custom: string } {
  if (!allergens || allergens.length === 0)
    return { standard: [], custom: "" };

  const standard: string[] = [];
  const custom: string[] = [];

  for (const a of allergens) {
    const lower = a.toLowerCase();
    if (STANDARD_ALLERGEN_VALUES.has(lower)) {
      standard.push(lower);
    } else {
      custom.push(a);
    }
  }

  return { standard, custom: custom.join(", ") };
}

export function mergeAllergens(allergens: {
  standard: string[];
  custom: string;
}): string[] {
  const custom = allergens.custom
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  return [...allergens.standard, ...custom];
}

// ── Schema ──

export const recipeSchema = z.object({
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
  base_yield_unit: z
    .string()
    .nullable()
    .refine((v) => !!v, "Unit is required"),
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
  allergens: z.object({
    standard: z.array(z.string()),
    custom: z.string(),
  }),
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

// ── Default Values ──

export const EMPTY_FORM: RecipeFormValues = {
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
  base_yield_unit: null,
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
  allergens: { standard: [], custom: "" },
  tags: "",
  images: "",
  carbon_footprint: null,
  deduct_from_stock: false,
  default_variant_id: null,
  info: "",
  dimension: "",
  is_active: true,
};

export function getDefaultValues(recipe?: Recipe): RecipeFormValues {
  if (!recipe) return { ...EMPTY_FORM };

  return {
    code: recipe.code,
    name: recipe.name,
    description: recipe.description ?? "",
    note: recipe.note ?? "",
    status: recipe.status,
    difficulty: recipe.difficulty,
    cuisine_id: recipe.cuisine_id,
    category_id: recipe.category_id,
    prep_time: recipe.prep_time,
    cook_time: recipe.cook_time,
    base_yield: recipe.base_yield,
    base_yield_unit: recipe.base_yield_unit,
    total_ingredient_cost: recipe.total_ingredient_cost,
    labor_cost: recipe.labor_cost,
    overhead_cost: recipe.overhead_cost,
    cost_per_portion: recipe.cost_per_portion,
    selling_price: recipe.selling_price,
    suggested_price: recipe.suggested_price,
    gross_margin: recipe.gross_margin,
    gross_margin_percentage: recipe.gross_margin_percentage,
    actual_food_cost_percentage: recipe.actual_food_cost_percentage,
    target_food_cost_percentage: recipe.target_food_cost_percentage,
    labor_cost_percentage: recipe.labor_cost_percentage,
    overhead_percentage: recipe.overhead_percentage,
    allergens: splitAllergens(recipe.allergens),
    tags: arrayToText(recipe.tags),
    images: arrayToText(recipe.images),
    carbon_footprint: recipe.carbon_footprint,
    deduct_from_stock: recipe.deduct_from_stock,
    default_variant_id: recipe.default_variant_id,
    info: objectToText(recipe.info),
    dimension: objectToText(recipe.dimension),
    is_active: recipe.is_active,
  };
}
