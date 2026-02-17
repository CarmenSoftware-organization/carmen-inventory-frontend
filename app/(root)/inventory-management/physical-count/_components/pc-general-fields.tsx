"use client";

import { Controller, type UseFormReturn } from "react-hook-form";
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldError,
} from "@/components/ui/field";
import { LookupDepartment } from "@/components/lookup/lookup-department";
import type { PhysicalCountFormValues } from "./pc-form-schema";

interface PcGeneralFieldsProps {
  form: UseFormReturn<PhysicalCountFormValues>;
  disabled: boolean;
}

export function PcGeneralFields({
  form,
  disabled,
}: PcGeneralFieldsProps) {
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
