import { useWatch, type UseFormReturn } from "react-hook-form";
import { Input } from "@/components/ui/input";
import {
  Field,
  FieldLabel,
  FieldError,
  FieldGroup,
  FieldDescription,
} from "@/components/ui/field";
import { Badge } from "@/components/ui/badge";
import type { RecipeFormValues } from "./recipe-form";

interface RecipePreparationFieldsProps {
  readonly form: UseFormReturn<RecipeFormValues>;
  readonly isDisabled: boolean;
}

export function RecipePreparationFields({
  form,
  isDisabled,
}: RecipePreparationFieldsProps) {
  const prepTime = useWatch({ control: form.control, name: "prep_time" });
  const cookTime = useWatch({ control: form.control, name: "cook_time" });
  const totalTime = (Number(prepTime) || 0) + (Number(cookTime) || 0);

  return (
    <div className="space-y-4">
      {/* ── Time & Labor ── */}
      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-semibold">Time & Labor</h2>
          {totalTime > 0 && (
            <Badge variant="info-light" size="sm">
              Total: {totalTime} min
              {totalTime >= 60 &&
                ` (${Math.floor(totalTime / 60)}h ${totalTime % 60}m)`}
            </Badge>
          )}
        </div>
        <FieldGroup className="gap-3">
          <div className="grid grid-cols-2 gap-2">
            <Field>
              <FieldLabel htmlFor="recipe-prep-time" className="text-xs">Prep Time</FieldLabel>
              <div className="relative">
                <Input
                  id="recipe-prep-time"
                  type="number"
                  min={0}
                  className="h-8 pr-12 text-right text-sm"
                  disabled={isDisabled}
                  {...form.register("prep_time")}
                />
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                  min
                </span>
              </div>
              <FieldDescription className="text-xs">
                Time before cooking (washing, cutting, marinating)
              </FieldDescription>
            </Field>

            <Field>
              <FieldLabel htmlFor="recipe-cook-time" className="text-xs">Cook Time</FieldLabel>
              <div className="relative">
                <Input
                  id="recipe-cook-time"
                  type="number"
                  min={0}
                  className="h-8 pr-12 text-right text-sm"
                  disabled={isDisabled}
                  {...form.register("cook_time")}
                />
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                  min
                </span>
              </div>
              <FieldDescription className="text-xs">
                Active cooking or baking time
              </FieldDescription>
            </Field>
          </div>
        </FieldGroup>
      </section>

      {/* ── Yield & Output ── */}
      <section className="space-y-3">
        <h2 className="text-sm font-semibold">Yield & Output</h2>
        <FieldGroup className="gap-3">
          <div className="grid grid-cols-2 gap-2">
            <Field>
              <FieldLabel htmlFor="recipe-base-yield" className="text-xs">Base Yield</FieldLabel>
              <Input
                id="recipe-base-yield"
                type="number"
                min={0}
                step="0.01"
                className="h-8 text-right text-sm"
                disabled={isDisabled}
                {...form.register("base_yield")}
              />
              <FieldDescription className="text-xs">
                Number of portions or units this recipe produces
              </FieldDescription>
            </Field>

            <Field data-invalid={!!form.formState.errors.base_yield_unit}>
              <FieldLabel htmlFor="recipe-yield-unit" className="text-xs" required>
                Yield Unit
              </FieldLabel>
              <Input
                id="recipe-yield-unit"
                placeholder="e.g. portions, servings, liters"
                className="h-8 text-sm"
                disabled={isDisabled}
                {...form.register("base_yield_unit")}
              />
              <FieldError>
                {form.formState.errors.base_yield_unit?.message}
              </FieldError>
              <FieldDescription className="text-xs">
                Unit of measure for the yield quantity
              </FieldDescription>
            </Field>
          </div>
        </FieldGroup>
      </section>
    </div>
  );
}
