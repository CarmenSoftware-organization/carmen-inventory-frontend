import { Controller, type UseFormReturn } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Field, FieldLabel, FieldError } from "@/components/ui/field";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LookupCuisine } from "@/components/lookup/lookup-cuisine";
import { LookupRecipeCategory } from "@/components/lookup/lookup-recipe-category";
import {
  RECIPE_STATUS_OPTIONS,
  RECIPE_DIFFICULTY_OPTIONS,
} from "@/constant/recipe";
import type { RecipeFormValues } from "./recipe-form";
import { Checkbox } from "@/components/ui/checkbox";

interface RecipeGeneralFieldsProps {
  readonly form: UseFormReturn<RecipeFormValues>;
  readonly isDisabled: boolean;
}

export function RecipeGeneralFields({
  form,
  isDisabled,
}: RecipeGeneralFieldsProps) {
  return (
    <div className="grid grid-cols-3 gap-3 pt-4">
      <Field data-invalid={!!form.formState.errors.code}>
        <FieldLabel className="text-xs" required>
          Code
        </FieldLabel>
        <Input
          placeholder="e.g. RCP-001"
          className="h-9 text-sm"
          disabled={isDisabled}
          {...form.register("code")}
        />
        <FieldError>{form.formState.errors.code?.message}</FieldError>
      </Field>

      <Field data-invalid={!!form.formState.errors.name} className="col-span-2">
        <FieldLabel className="text-xs" required>
          Name
        </FieldLabel>
        <Input
          placeholder="e.g. Tom Yum Goong"
          className="h-9 text-sm"
          disabled={isDisabled}
          {...form.register("name")}
        />
        <FieldError>{form.formState.errors.name?.message}</FieldError>
      </Field>

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
              className="h-9"
            />
          )}
        />
        <FieldError>{form.formState.errors.cuisine_id?.message}</FieldError>
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
              className="h-9"
            />
          )}
        />
        <FieldError>{form.formState.errors.category_id?.message}</FieldError>
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
              <SelectTrigger className="w-full text-sm">
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
        <FieldError>{form.formState.errors.status?.message}</FieldError>
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
        <FieldError>{form.formState.errors.difficulty?.message}</FieldError>
      </Field>

      <Field className="col-span-3">
        <FieldLabel className="text-xs">Description</FieldLabel>
        <Textarea
          placeholder="Optional"
          className="text-sm"
          rows={2}
          disabled={isDisabled}
          {...form.register("description")}
        />
      </Field>
      <Field className="col-span-3">
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
    </div>
  );
}
