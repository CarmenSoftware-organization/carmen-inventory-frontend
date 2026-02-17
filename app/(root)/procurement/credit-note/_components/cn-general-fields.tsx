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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LookupVendor } from "@/components/lookup/lookup-vendor";
import { LookupCurrency } from "@/components/lookup/lookup-currency";
import { DatePicker } from "@/components/ui/date-picker";
import type { CnFormValues } from "./cn-form-schema";

interface CnGeneralFieldsProps {
  form: UseFormReturn<CnFormValues>;
  disabled: boolean;
}

export function CnGeneralFields({ form, disabled }: CnGeneralFieldsProps) {
  return (
    <div className="max-w-2xl space-y-4">
      <FieldGroup className="gap-3">
        <div className="grid grid-cols-2 gap-3">
          <Field data-invalid={!!form.formState.errors.credit_note_type}>
            <FieldLabel className="text-xs">Credit Note Type</FieldLabel>
            <Controller
              control={form.control}
              name="credit_note_type"
              render={({ field }) => (
                <Select
                  value={field.value}
                  onValueChange={field.onChange}
                  disabled={disabled}
                >
                  <SelectTrigger className="text-xs">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="quantity_return" className="text-xs">
                      Quantity Return
                    </SelectItem>
                    <SelectItem value="amount_discount" className="text-xs">
                      Amount Discount
                    </SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
            <FieldError>
              {form.formState.errors.credit_note_type?.message}
            </FieldError>
          </Field>

          <Field data-invalid={!!form.formState.errors.grn_id}>
            <FieldLabel className="text-xs">GRN</FieldLabel>
            <Input
              placeholder="Goods Receive Note ID"
              className="h-8 text-sm"
              disabled={disabled}
              {...form.register("grn_id")}
            />
            <FieldError>{form.formState.errors.grn_id?.message}</FieldError>
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

          <Field data-invalid={!!form.formState.errors.credit_note_number}>
            <FieldLabel className="text-xs">Credit Note Number</FieldLabel>
            <Input
              placeholder="e.g. CN-2026-001"
              className="h-8 text-sm"
              disabled={disabled}
              {...form.register("credit_note_number")}
            />
            <FieldError>
              {form.formState.errors.credit_note_number?.message}
            </FieldError>
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Field data-invalid={!!form.formState.errors.credit_note_date}>
            <FieldLabel className="text-xs">Credit Note Date</FieldLabel>
            <Controller
              control={form.control}
              name="credit_note_date"
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
              {form.formState.errors.credit_note_date?.message}
            </FieldError>
          </Field>

          <Field>
            <FieldLabel className="text-xs">Reference Number</FieldLabel>
            <Input
              placeholder="e.g. REF-001"
              className="h-8 text-sm"
              disabled={disabled}
              {...form.register("reference_number")}
            />
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Field data-invalid={!!form.formState.errors.currency_code}>
            <FieldLabel className="text-xs">Currency</FieldLabel>
            <Controller
              control={form.control}
              name="currency_code"
              render={({ field }) => (
                <LookupCurrency
                  value={field.value}
                  onValueChange={field.onChange}
                  disabled={disabled}
                />
              )}
            />
            <FieldError>
              {form.formState.errors.currency_code?.message}
            </FieldError>
          </Field>

          <Field>
            <FieldLabel className="text-xs">Exchange Rate</FieldLabel>
            <Input
              type="number"
              min={0}
              step="0.0001"
              placeholder="1"
              className="h-8 text-sm"
              disabled={disabled}
              {...form.register("exchange_rate", { valueAsNumber: true })}
            />
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Field>
            <FieldLabel className="text-xs">Tax Amount</FieldLabel>
            <Input
              type="number"
              min={0}
              step="0.01"
              placeholder="0.00"
              className="h-8 text-sm"
              disabled={disabled}
              {...form.register("tax_amount", { valueAsNumber: true })}
            />
          </Field>

          <Field>
            <FieldLabel className="text-xs">Discount Amount</FieldLabel>
            <Input
              type="number"
              min={0}
              step="0.01"
              placeholder="0.00"
              className="h-8 text-sm"
              disabled={disabled}
              {...form.register("discount_amount", { valueAsNumber: true })}
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
