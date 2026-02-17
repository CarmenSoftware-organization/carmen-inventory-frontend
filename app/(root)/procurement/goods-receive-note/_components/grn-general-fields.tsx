"use client";

import { Controller, type UseFormReturn } from "react-hook-form";
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldError,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { LookupVendor } from "@/components/lookup/lookup-vendor";
import { DatePicker } from "@/components/ui/date-picker";
import type { GrnFormValues } from "./grn-form-schema";

interface GrnGeneralFieldsProps {
  form: UseFormReturn<GrnFormValues>;
  disabled: boolean;
}

export function GrnGeneralFields({ form, disabled }: GrnGeneralFieldsProps) {
  return (
    <div className="max-w-2xl space-y-4">
      <FieldGroup className="gap-3">
        <div className="grid grid-cols-2 gap-3">
          <Field data-invalid={!!form.formState.errors.grn_number}>
            <FieldLabel className="text-xs">GRN Number</FieldLabel>
            <Input
              placeholder="e.g. GRN-2026-001"
              className="h-8 text-sm"
              disabled={disabled}
              {...form.register("grn_number")}
            />
            <FieldError>
              {form.formState.errors.grn_number?.message}
            </FieldError>
          </Field>

          <Field data-invalid={!!form.formState.errors.grn_date}>
            <FieldLabel className="text-xs">GRN Date</FieldLabel>
            <Controller
              control={form.control}
              name="grn_date"
              render={({ field }) => (
                <DatePicker
                  value={field.value}
                  onValueChange={field.onChange}
                  disabled={disabled}
                  placeholder="Select date"
                  className="w-full text-xs"
                />
              )}
            />
            <FieldError>
              {form.formState.errors.grn_date?.message}
            </FieldError>
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Field data-invalid={!!form.formState.errors.vendor_id}>
            <FieldLabel className="text-xs">Vendor</FieldLabel>
            <Controller
              control={form.control}
              name="vendor_id"
              render={({ field }) => (
                <LookupVendor
                  value={field.value}
                  onValueChange={field.onChange}
                  disabled={disabled}
                />
              )}
            />
            <FieldError>{form.formState.errors.vendor_id?.message}</FieldError>
          </Field>

          <Field>
            <FieldLabel className="text-xs">PO Reference</FieldLabel>
            <Input
              placeholder="e.g. PO-2026-001"
              className="h-8 text-sm"
              disabled={disabled}
              {...form.register("po_id")}
            />
          </Field>
        </div>

        <Field>
          <FieldLabel className="text-xs">Description</FieldLabel>
          <Textarea
            placeholder="Optional description"
            className="text-sm"
            rows={2}
            disabled={disabled}
            {...form.register("description")}
          />
        </Field>
      </FieldGroup>
    </div>
  );
}
