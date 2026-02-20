import { Controller, type UseFormReturn } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Field, FieldLabel } from "@/components/ui/field";
import { Textarea } from "@/components/ui/textarea";
import type { RecipeFormValues } from "./recipe-form";

interface RecipeDetailFieldsProps {
  readonly form: UseFormReturn<RecipeFormValues>;
  readonly isDisabled: boolean;
}

const TEXTAREA_FIELDS: {
  name: "allergens" | "tags" | "images";
  label: string;
}[] = [
  { name: "allergens", label: "Allergens (one per line)" },
  { name: "tags", label: "Tags (one per line)" },
  { name: "images", label: "Images (one URL per line)" },
];

export function RecipeDetailFields({
  form,
  isDisabled,
}: RecipeDetailFieldsProps) {
  return (
    <div className="grid grid-cols-3 gap-3 pt-4">
      {TEXTAREA_FIELDS.map(({ name, label }) => (
        <Field key={name}>
          <FieldLabel className="text-xs">{label}</FieldLabel>
          <Textarea
            placeholder="Optional"
            className="text-sm"
            rows={3}
            disabled={isDisabled}
            {...form.register(name)}
          />
        </Field>
      ))}

      <Field>
        <FieldLabel className="text-xs">Carbon Footprint</FieldLabel>
        <Input
          type="number"
          step="0.01"
          className="h-9 text-right text-sm"
          disabled={isDisabled}
          {...form.register("carbon_footprint")}
        />
      </Field>

      <Field orientation="horizontal" className="self-end pb-1.5">
        <Controller
          control={form.control}
          name="deduct_from_stock"
          render={({ field }) => (
            <Checkbox
              checked={field.value}
              onCheckedChange={field.onChange}
              disabled={isDisabled}
            />
          )}
        />
        <FieldLabel className="text-xs">Deduct from Stock</FieldLabel>
      </Field>
    </div>
  );
}
