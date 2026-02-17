"use client";

import { Controller, type UseFormReturn } from "react-hook-form";
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldError,
} from "@/components/ui/field";
import { LookupDepartment } from "@/components/lookup/lookup-department";
import type { SpotCheckFormValues } from "./sc-form-schema";

interface ScGeneralFieldsProps {
  form: UseFormReturn<SpotCheckFormValues>;
  disabled: boolean;
}

export function ScGeneralFields({
  form,
  disabled,
}: ScGeneralFieldsProps) {
  return (
    <div className="max-w-2xl space-y-4">
      <FieldGroup className="gap-3">
        <Field data-invalid={!!form.formState.errors.department_id}>
          <FieldLabel className="text-xs">Department</FieldLabel>
          <Controller
            control={form.control}
            name="department_id"
            render={({ field }) => (
              <LookupDepartment
                value={field.value}
                onValueChange={field.onChange}
                disabled={disabled}
              />
            )}
          />
          <FieldError>
            {form.formState.errors.department_id?.message}
          </FieldError>
        </Field>
      </FieldGroup>
    </div>
  );
}
