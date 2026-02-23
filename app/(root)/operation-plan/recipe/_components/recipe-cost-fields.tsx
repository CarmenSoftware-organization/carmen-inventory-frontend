import { useWatch, type UseFormReturn } from "react-hook-form";
import { AlertTriangle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  Field,
  FieldLabel,
  FieldGroup,
  FieldDescription,
} from "@/components/ui/field";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import type { RecipeFormValues } from "./recipe-form-schema";
import type { RecipeComputed } from "./recipe-form";

interface RecipeCostFieldsProps {
  readonly form: UseFormReturn<RecipeFormValues>;
  readonly isDisabled: boolean;
  readonly computed: RecipeComputed;
}

function CostInput({
  form,
  name,
  label,
  suffix,
  description,
  isDisabled,
  readOnly,
}: {
  form: UseFormReturn<RecipeFormValues>;
  name: keyof RecipeFormValues;
  label: string;
  suffix?: string;
  description?: string;
  isDisabled: boolean;
  readOnly?: boolean;
}) {
  return (
    <Field>
      <FieldLabel className="text-xs">{label}</FieldLabel>
      <div className="relative">
        <Input
          type="number"
          step="0.01"
          className={cn(
            "h-8 text-right text-sm",
            suffix && "pr-8",
            readOnly && "bg-muted/50",
          )}
          disabled={isDisabled}
          readOnly={readOnly}
          tabIndex={readOnly ? -1 : undefined}
          {...form.register(name)}
        />
        {suffix && (
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
            {suffix}
          </span>
        )}
      </div>
      {description && (
        <FieldDescription className="text-xs">{description}</FieldDescription>
      )}
    </Field>
  );
}

export function RecipeCostFields({
  form,
  isDisabled,
  computed,
}: RecipeCostFieldsProps) {
  const sellingPrice = useWatch({
    control: form.control,
    name: "selling_price",
  });
  const sell = Number(sellingPrice) || 0;
  const isBelowCost = sell > 0 && computed.costPerPortion > 0 && sell < computed.costPerPortion;

  return (
    <div className="space-y-4">
      {/* ── Cost Breakdown ── */}
      <section className="space-y-3">
        <h2 className="text-sm font-semibold">Cost Breakdown</h2>
        <FieldGroup className="gap-3">
          <div className="grid grid-cols-2 gap-2">
            <CostInput
              form={form}
              name="total_ingredient_cost"
              label="Ingredient Cost"
              isDisabled={isDisabled}
              description="Total raw material cost for all ingredients"
            />
            <CostInput
              form={form}
              name="labor_cost"
              label="Labor Cost"
              isDisabled={isDisabled}
              description="Staff time cost for preparation and cooking"
            />
            <CostInput
              form={form}
              name="overhead_cost"
              label="Overhead Cost"
              isDisabled={isDisabled}
              description="Utilities, equipment depreciation, and facility costs"
            />
            <CostInput
              form={form}
              name="cost_per_portion"
              label="Cost per Portion"
              isDisabled={isDisabled}
              readOnly
              description="Auto-calculated: total cost / base yield"
            />
          </div>
        </FieldGroup>
      </section>

      {/* ── Pricing ── */}
      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-semibold">Pricing</h2>
          {isBelowCost && (
            <Badge variant="destructive-light" size="sm">
              <AlertTriangle className="size-3" aria-hidden="true" />
              Below cost
            </Badge>
          )}
        </div>
        <FieldGroup className="gap-3">
          <div className="grid grid-cols-2 gap-2">
            <CostInput
              form={form}
              name="selling_price"
              label="Selling Price"
              isDisabled={isDisabled}
              description="Current menu price charged to customers"
            />
            <CostInput
              form={form}
              name="suggested_price"
              label="Suggested Price"
              isDisabled={isDisabled}
              readOnly
              description="Auto-calculated based on target food cost %"
            />
          </div>
        </FieldGroup>
      </section>

      {/* ── Margin Analysis ── */}
      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-semibold">Margin Analysis</h2>
          <Badge variant="outline" size="sm">
            Auto-calculated
          </Badge>
        </div>
        <FieldGroup className="gap-3">
          {/* Gross Margin */}
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Gross Margin
          </p>
          <div className="grid grid-cols-2 gap-2">
            <CostInput
              form={form}
              name="gross_margin"
              label="Gross Margin"
              isDisabled={isDisabled}
              readOnly
              description="Selling price minus cost per portion"
            />
            <CostInput
              form={form}
              name="gross_margin_percentage"
              label="Gross Margin"
              suffix="%"
              isDisabled={isDisabled}
              readOnly
              description="Margin as percentage of selling price"
            />
          </div>

          <Separator />

          {/* Food Cost */}
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Food Cost
          </p>
          <div className="grid grid-cols-2 gap-2">
            <CostInput
              form={form}
              name="target_food_cost_percentage"
              label="Target Food Cost"
              suffix="%"
              isDisabled={isDisabled}
              description="Desired ingredient cost ratio (editable)"
            />
            <CostInput
              form={form}
              name="actual_food_cost_percentage"
              label="Actual Food Cost"
              suffix="%"
              isDisabled={isDisabled}
              readOnly
              description="Auto-calculated: ingredient cost / selling price"
            />
          </div>

          <Separator />

          {/* Operational Cost Ratios */}
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Operational Cost Ratios
          </p>
          <div className="grid grid-cols-2 gap-2">
            <CostInput
              form={form}
              name="labor_cost_percentage"
              label="Labor Cost"
              suffix="%"
              isDisabled={isDisabled}
              readOnly
              description="Auto-calculated: labor / selling price"
            />
            <CostInput
              form={form}
              name="overhead_percentage"
              label="Overhead"
              suffix="%"
              isDisabled={isDisabled}
              readOnly
              description="Auto-calculated: overhead / selling price"
            />
          </div>
        </FieldGroup>
      </section>
    </div>
  );
}
