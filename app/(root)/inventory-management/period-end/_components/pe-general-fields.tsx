"use client";

import type { UseFormReturn } from "react-hook-form";
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldError,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import type { PeriodEndFormValues } from "./pe-form-schema";

interface PeGeneralFieldsProps {
  form: UseFormReturn<PeriodEndFormValues>;
  disabled: boolean;
}

export function PeGeneralFields({
  form,
  disabled,
}: PeGeneralFieldsProps) {
  return (
    <div className="max-w-2xl space-y-4">
      <FieldGroup className="gap-3">
        <Field data-invalid={!!form.formState.errors.pe_no}>
          <FieldLabel className="text-xs">PE No.</FieldLabel>
          <Input
            placeholder="e.g. PE-2026-001"
            className="h-8 text-sm"
            disabled={disabled}
            {...form.register("pe_no")}
          />
          <FieldError>
            {form.formState.errors.pe_no?.message}
          </FieldError>
        </Field>
      </FieldGroup>
    </div>
  );
}
