import type { UseFormReturn } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Field, FieldLabel, FieldError } from "@/components/ui/field";
import type { RecipeFormValues } from "./recipe-form";

interface RecipePreparationFieldsProps {
  readonly form: UseFormReturn<RecipeFormValues>;
  readonly isDisabled: boolean;
}

type PrepFieldName = "prep_time" | "cook_time" | "base_yield" | "base_yield_unit";

const PREP_FIELDS: {
  name: PrepFieldName;
  label: string;
  type?: string;
  step?: string;
  placeholder?: string;
  required?: boolean;
  suffix?: string;
}[] = [
  { name: "prep_time", label: "Prep Time", type: "number", suffix: "min" },
  { name: "cook_time", label: "Cook Time", type: "number", suffix: "min" },
  { name: "base_yield", label: "Base Yield", type: "number", step: "0.01" },
  { name: "base_yield_unit", label: "Yield Unit", placeholder: "e.g. portions", required: true },
];

export function RecipePreparationFields({
  form,
  isDisabled,
}: RecipePreparationFieldsProps) {
  return (
    <div className="grid grid-cols-4 gap-3 pt-4">
      {PREP_FIELDS.map(({ name, label, type, step, placeholder, required, suffix }) => (
        <Field key={name} data-invalid={!!form.formState.errors[name]}>
          <FieldLabel className="text-xs" required={required}>
            {label}
          </FieldLabel>
          {suffix ? (
            <div className="relative">
              <Input
                type={type}
                min={0}
                step={step}
                placeholder={placeholder}
                className="h-9 pr-9 text-right text-sm"
                disabled={isDisabled}
                {...form.register(name)}
              />
              <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                {suffix}
              </span>
            </div>
          ) : (
            <Input
              type={type}
              min={type === "number" ? 0 : undefined}
              step={step}
              placeholder={placeholder}
              className={`h-9 text-sm ${type === "number" ? "text-right" : ""}`}
              disabled={isDisabled}
              {...form.register(name)}
            />
          )}
          {required && (
            <FieldError>
              {form.formState.errors[name]?.message}
            </FieldError>
          )}
        </Field>
      ))}
    </div>
  );
}
