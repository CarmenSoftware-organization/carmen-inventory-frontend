import { Controller, type UseFormReturn } from "react-hook-form";
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
import {
  RECIPE_STATUS_OPTIONS,
  RECIPE_DIFFICULTY_OPTIONS,
} from "@/constant/recipe";
import type { RecipeFormValues } from "./recipe-form";

interface RecipeGeneralFieldsProps {
  readonly form: UseFormReturn<RecipeFormValues>;
  readonly isDisabled: boolean;
}

export function RecipeGeneralFields({
  form,
  isDisabled,
}: RecipeGeneralFieldsProps) {
  const statusValue = form.watch("status");
  const isActive = form.watch("is_active");

  return (
    <div className="space-y-4">
      {/* ── Recipe Identity ── */}
      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-semibold">Recipe Identity</h2>
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
              <FieldLabel className="text-xs" required>
                Code
              </FieldLabel>
              <Input
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
              <FieldLabel className="text-xs" required>
                Name
              </FieldLabel>
              <Input
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
              <FieldLabel className="text-xs" required>
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
              <FieldLabel className="text-xs" required>
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
              <FieldLabel className="text-xs">Active</FieldLabel>
            </Field>
          </div>
        </FieldGroup>
      </section>

      {/* ── Classification ── */}
      <section className="space-y-3">
        <h2 className="text-sm font-semibold">Classification</h2>
        <FieldGroup className="gap-3">
          <div className="grid grid-cols-2 gap-2">
            <Field data-invalid={!!form.formState.errors.cuisine_id}>
              <FieldLabel className="text-xs" required>
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
              <FieldDescription className="text-xs">
                The culinary tradition this recipe belongs to
              </FieldDescription>
              <FieldError>
                {form.formState.errors.cuisine_id?.message}
              </FieldError>
            </Field>

            <Field data-invalid={!!form.formState.errors.category_id}>
              <FieldLabel className="text-xs" required>
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
              <FieldDescription className="text-xs">
                Menu section or recipe grouping
              </FieldDescription>
              <FieldError>
                {form.formState.errors.category_id?.message}
              </FieldError>
            </Field>
          </div>
        </FieldGroup>
      </section>

      {/* ── Additional Information ── */}
      <section className="space-y-3">
        <h2 className="text-sm font-semibold">Additional Information</h2>
        <FieldGroup className="gap-3">
          <Field>
            <FieldLabel className="text-xs">Description</FieldLabel>
            <Textarea
              placeholder="Brief description of the recipe, visible in listings..."
              className="text-sm"
              rows={3}
              disabled={isDisabled}
              maxLength={256}
              {...form.register("description")}
            />
            <FieldDescription className="text-xs">
              Public-facing summary shown in menus and catalogs
            </FieldDescription>
          </Field>

          <Field>
            <FieldLabel className="text-xs">Internal Note</FieldLabel>
            <Textarea
              placeholder="Internal notes for kitchen staff..."
              className="text-sm"
              rows={2}
              disabled={isDisabled}
              maxLength={256}
              {...form.register("note")}
            />
            <FieldDescription className="text-xs">
              Only visible to staff, not shown in public views
            </FieldDescription>
          </Field>
        </FieldGroup>
      </section>
    </div>
  );
}
