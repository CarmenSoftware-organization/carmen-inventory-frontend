"use client";

import { Controller, useWatch, type UseFormReturn } from "react-hook-form";
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldError,
} from "@/components/ui/field";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { LookupLocation } from "@/components/lookup/lookup-location";
import type { SpotCheckFormValues } from "./sc-form-schema";

interface ScGeneralFieldsProps {
  form: UseFormReturn<SpotCheckFormValues>;
  disabled: boolean;
}

export function ScGeneralFields({ form, disabled }: ScGeneralFieldsProps) {
  const method = useWatch({ control: form.control, name: "method" });

  return (
    <div className="max-w-2xl space-y-4">
      <Field data-invalid={!!form.formState.errors.method}>
        <FieldLabel className="text-xs" required>
          Method
        </FieldLabel>
        <Controller
          control={form.control}
          name="method"
          render={({ field }) => (
            <RadioGroup
              value={field.value}
              onValueChange={field.onChange}
              disabled={disabled}
              className="flex gap-4 pt-1"
            >
              <div className="flex items-center gap-1.5">
                <RadioGroupItem value="random" id="sc-method-random" />
                <label htmlFor="sc-method-random" className="text-xs">
                  Random
                </label>
              </div>
              <div className="flex items-center gap-1.5">
                <RadioGroupItem value="manual" id="sc-method-manual" />
                <label htmlFor="sc-method-manual" className="text-xs">
                  Manual
                </label>
              </div>
            </RadioGroup>
          )}
        />
        <FieldError>{form.formState.errors.method?.message}</FieldError>
      </Field>
      <FieldGroup className="gap-3 grid grid-cols-2">
        <Field data-invalid={!!form.formState.errors.location_id}>
          <FieldLabel htmlFor="sc-location" className="text-xs" required>
            Location
          </FieldLabel>
          <Controller
            control={form.control}
            name="location_id"
            render={({ field }) => (
              <LookupLocation
                value={field.value}
                onValueChange={field.onChange}
                disabled={disabled}
              />
            )}
          />
          <FieldError>{form.formState.errors.location_id?.message}</FieldError>
        </Field>

        {method === "random" && (
          <div className="grid grid-cols-2 gap-2">
            <Field data-invalid={!!form.formState.errors.product_count}>
              <FieldLabel
                htmlFor="sc-product-count"
                className="text-xs"
                required
              >
                Product Count
              </FieldLabel>
              <Input
                id="sc-product-count"
                type="number"
                min={1}
                className="h-8 text-sm text-right"
                disabled={disabled}
                {...form.register("product_count", { valueAsNumber: true })}
              />
              <FieldError>
                {form.formState.errors.product_count?.message}
              </FieldError>
            </Field>
          </div>
        )}
      </FieldGroup>
      <Field data-invalid={!!form.formState.errors.description}>
        <FieldLabel htmlFor="sc-description" className="text-xs">
          Description
        </FieldLabel>
        <Textarea
          id="sc-description"
          maxLength={256}
          placeholder="Description"
          className="min-h-12 text-sm"
          disabled={disabled}
          {...form.register("description")}
        />
        <FieldError>{form.formState.errors.description?.message}</FieldError>
      </Field>
    </div>
  );
}
