import { Controller, useWatch, type UseFormReturn } from "react-hook-form";
import { Input } from "@/components/ui/input";
import {
  Field,
  FieldLabel,
  FieldError,
  FieldGroup,
  FieldDescription,
} from "@/components/ui/field";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { LookupCuisine } from "@/components/lookup/lookup-cuisine";
import { LookupRecipeCategory } from "@/components/lookup/lookup-recipe-category";
import { LookupUnit } from "@/components/lookup/lookup-unit";
import {
  RECIPE_STATUS_OPTIONS,
  RECIPE_DIFFICULTY_OPTIONS,
} from "@/constant/recipe";
import type { RecipeFormValues } from "./recipe-form-schema";

interface RecipeGeneralFieldsProps {
  readonly form: UseFormReturn<RecipeFormValues>;
  readonly isDisabled: boolean;
}

export function RecipeGeneralFields({
  form,
  isDisabled,
}: RecipeGeneralFieldsProps) {
  const statusValue = useWatch({ control: form.control, name: "status" });
  const isActive = useWatch({ control: form.control, name: "is_active" });
  const prepTime = useWatch({ control: form.control, name: "prep_time" });
  const cookTime = useWatch({ control: form.control, name: "cook_time" });
  const totalTime = (Number(prepTime) || 0) + (Number(cookTime) || 0);

  return (
    <div className="space-y-4">
      {/* ── Recipe Identity ── */}
      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-semibold border-b pb-2">Recipe Identity</h2>
          {statusValue && (
            <Badge
              variant={
                statusValue === "PUBLISHED"
                  ? "success-light"
                  : statusValue === "ARCHIVED"
                    ? "warning-light"
                    : "info-light"
              }
              size="sm"
            >
              {statusValue}
            </Badge>
          )}
          {!isActive && (
            <Badge variant="destructive-light" size="sm">
              Inactive
            </Badge>
          )}
        </div>
        <FieldGroup className="gap-3">
          <div className="grid grid-cols-3 gap-2">
            <Field data-invalid={!!form.formState.errors.code}>
              <FieldLabel htmlFor="recipe-code" required>
                Code
              </FieldLabel>
              <Input
                id="recipe-code"
                placeholder="e.g. RCP-001"
                className="h-8 text-sm"
                disabled={isDisabled}
                maxLength={10}
                {...form.register("code")}
              />
              <FieldError>
                {form.formState.errors.code?.message}
              </FieldError>
            </Field>

            <Field
              data-invalid={!!form.formState.errors.name}
              className="col-span-2"
            >
              <FieldLabel htmlFor="recipe-name" required>
                Name
              </FieldLabel>
              <Input
                id="recipe-name"
                placeholder="e.g. Tom Yum Goong"
                className="h-8 text-sm"
                disabled={isDisabled}
                maxLength={100}
                {...form.register("name")}
              />
              <FieldError>
                {form.formState.errors.name?.message}
              </FieldError>
            </Field>

            <Field data-invalid={!!form.formState.errors.status}>
              <FieldLabel required>
                Status
              </FieldLabel>
              <Controller
                control={form.control}
                name="status"
                render={({ field }) => (
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                    disabled={isDisabled}
                  >
                    <SelectTrigger className="h-8 w-full text-sm">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      {RECIPE_STATUS_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              <FieldError>
                {form.formState.errors.status?.message}
              </FieldError>
            </Field>

            <Field data-invalid={!!form.formState.errors.difficulty}>
              <FieldLabel required>
                Difficulty
              </FieldLabel>
              <Controller
                control={form.control}
                name="difficulty"
                render={({ field }) => (
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                    disabled={isDisabled}
                  >
                    <SelectTrigger className="h-8 w-full text-sm">
                      <SelectValue placeholder="Select difficulty" />
                    </SelectTrigger>
                    <SelectContent>
                      {RECIPE_DIFFICULTY_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              <FieldError>
                {form.formState.errors.difficulty?.message}
              </FieldError>
            </Field>

            <Field orientation="horizontal" className="self-end pb-1.5">
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
              <FieldLabel>Active</FieldLabel>
            </Field>
          </div>
        </FieldGroup>
      </section>

      {/* ── Classification ── */}
      <section className="space-y-3">
        <h2 className="text-sm font-semibold border-b pb-2">Classification</h2>
        <FieldGroup className="gap-3">
          <div className="grid grid-cols-2 gap-2">
            <Field data-invalid={!!form.formState.errors.cuisine_id}>
              <FieldLabel required>
                Cuisine
              </FieldLabel>
              <Controller
                control={form.control}
                name="cuisine_id"
                render={({ field }) => (
                  <LookupCuisine
                    value={field.value ?? ""}
                    onValueChange={field.onChange}
                    disabled={isDisabled}
                    className="h-8"
                  />
                )}
              />
              <FieldDescription>
                The culinary tradition this recipe belongs to
              </FieldDescription>
              <FieldError>
                {form.formState.errors.cuisine_id?.message}
              </FieldError>
            </Field>

            <Field data-invalid={!!form.formState.errors.category_id}>
              <FieldLabel required>
                Category
              </FieldLabel>
              <Controller
                control={form.control}
                name="category_id"
                render={({ field }) => (
                  <LookupRecipeCategory
                    value={field.value ?? ""}
                    onValueChange={field.onChange}
                    disabled={isDisabled}
                    className="h-8"
                  />
                )}
              />
              <FieldDescription>
                Menu section or recipe grouping
              </FieldDescription>
              <FieldError>
                {form.formState.errors.category_id?.message}
              </FieldError>
            </Field>
          </div>
        </FieldGroup>
      </section>

      {/* ── Time & Yield ── */}
      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-semibold border-b pb-2">Time & Yield</h2>
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
              <FieldLabel htmlFor="recipe-prep-time">
                Prep Time
              </FieldLabel>
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
              <FieldDescription>
                Time before cooking (washing, cutting, marinating)
              </FieldDescription>
            </Field>

            <Field>
              <FieldLabel htmlFor="recipe-cook-time">
                Cook Time
              </FieldLabel>
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
              <FieldDescription>
                Active cooking or baking time
              </FieldDescription>
            </Field>

            <Field>
              <FieldLabel htmlFor="recipe-base-yield">
                Base Yield
              </FieldLabel>
              <Input
                id="recipe-base-yield"
                type="number"
                min={0}
                step="0.01"
                className="h-8 text-right text-sm"
                disabled={isDisabled}
                {...form.register("base_yield")}
              />
              <FieldDescription>
                Number of portions or units this recipe produces
              </FieldDescription>
            </Field>

            <Field data-invalid={!!form.formState.errors.base_yield_unit}>
              <FieldLabel required>
                Yield Unit
              </FieldLabel>
              <Controller
                control={form.control}
                name="base_yield_unit"
                render={({ field }) => (
                  <LookupUnit
                    value={field.value ?? ""}
                    onValueChange={field.onChange}
                    disabled={isDisabled}
                    placeholder="Select unit"
                    className="h-8"
                  />
                )}
              />
              <FieldError>
                {form.formState.errors.base_yield_unit?.message}
              </FieldError>
              <FieldDescription>
                Unit of measure for the yield quantity
              </FieldDescription>
            </Field>
          </div>
        </FieldGroup>
      </section>

      {/* ── Additional Information ── */}
      <section className="space-y-3">
        <h2 className="text-sm font-semibold border-b pb-2">Additional Information</h2>
        <FieldGroup className="gap-3">
          <Field>
            <FieldLabel htmlFor="recipe-description">
              Description
            </FieldLabel>
            <Textarea
              id="recipe-description"
              placeholder="Brief description of the recipe, visible in listings..."
              className="text-sm"
              rows={3}
              disabled={isDisabled}
              maxLength={256}
              {...form.register("description")}
            />
            <FieldDescription>
              Public-facing summary shown in menus and catalogs
            </FieldDescription>
          </Field>

          <Field>
            <FieldLabel htmlFor="recipe-note">
              Internal Note
            </FieldLabel>
            <Textarea
              id="recipe-note"
              placeholder="Internal notes for kitchen staff..."
              className="text-sm"
              rows={2}
              disabled={isDisabled}
              maxLength={256}
              {...form.register("note")}
            />
            <FieldDescription>
              Only visible to staff, not shown in public views
            </FieldDescription>
          </Field>
        </FieldGroup>
      </section>
    </div>
  );
}
