import type { UseFormReturn } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Field, FieldLabel } from "@/components/ui/field";
import type { RecipeFormValues } from "./recipe-form";

interface RecipeCostFieldsProps {
  readonly form: UseFormReturn<RecipeFormValues>;
  readonly isDisabled: boolean;
}

type CostFieldName = Extract<
  keyof RecipeFormValues,
  | "total_ingredient_cost"
  | "labor_cost"
  | "overhead_cost"
  | "cost_per_portion"
  | "selling_price"
  | "suggested_price"
  | "gross_margin"
  | "gross_margin_percentage"
  | "target_food_cost_percentage"
  | "actual_food_cost_percentage"
  | "labor_cost_percentage"
  | "overhead_percentage"
>;

const COST_FIELDS: { name: CostFieldName; label: string; suffix?: string }[] = [
  { name: "total_ingredient_cost", label: "Ingredient Cost" },
  { name: "labor_cost", label: "Labor Cost" },
  { name: "overhead_cost", label: "Overhead Cost" },
  { name: "cost_per_portion", label: "Cost per Portion" },
  { name: "selling_price", label: "Selling Price" },
  { name: "suggested_price", label: "Suggested Price" },
  { name: "gross_margin", label: "Gross Margin" },
  { name: "gross_margin_percentage", label: "Gross Margin %", suffix: "%" },
  { name: "target_food_cost_percentage", label: "Target Food Cost %", suffix: "%" },
  { name: "actual_food_cost_percentage", label: "Actual Food Cost %", suffix: "%" },
  { name: "labor_cost_percentage", label: "Labor Cost %", suffix: "%" },
  { name: "overhead_percentage", label: "Overhead %", suffix: "%" },
];

export function RecipeCostFields({ form, isDisabled }: RecipeCostFieldsProps) {
  return (
    <div className="grid grid-cols-4 gap-3 pt-4">
      {COST_FIELDS.map(({ name, label, suffix }) => (
        <Field key={name}>
          <FieldLabel className="text-xs">{label}</FieldLabel>
          {suffix ? (
            <div className="relative">
              <Input
                type="number"
                step="0.01"
                className="h-9 pr-7 text-right text-sm"
                disabled={isDisabled}
                {...form.register(name)}
              />
              <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                {suffix}
              </span>
            </div>
          ) : (
            <Input
              type="number"
              min={0}
              step="0.01"
              className="h-9 text-right text-sm"
              disabled={isDisabled}
              {...form.register(name)}
            />
          )}
        </Field>
      ))}
    </div>
  );
}
