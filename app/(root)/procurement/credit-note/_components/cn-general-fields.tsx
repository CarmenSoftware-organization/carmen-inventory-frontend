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
    <div className="max-w-3xl space-y-3">
      {/* ── Credit Note Details ── */}
      <section className="space-y-3">
        <h2 className="text-sm font-semibold border-b pb-2">Credit Note Details</h2>
        <FieldGroup className="gap-3">
          <div className="grid grid-cols-2 gap-3">
            <Field data-invalid={!!form.formState.errors.credit_note_type}>
              <FieldLabel required>
                Credit Note Type
              </FieldLabel>
              <Controller
                control={form.control}
                name="credit_note_type"
                render={({ field }) => (
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                    disabled={disabled}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="quantity_return">
                        Quantity Return
                      </SelectItem>
                      <SelectItem value="amount_discount">
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
              <FieldLabel htmlFor="cn-grn-id" required>GRN</FieldLabel>
              <Input
                id="cn-grn-id"
                placeholder="Goods Receive Note ID"
                className="h-8 text-sm"
                disabled={disabled}
                {...form.register("grn_id")}
              />
              <FieldError>{form.formState.errors.grn_id?.message}</FieldError>
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field data-invalid={!!form.formState.errors.credit_note_number}>
              <FieldLabel htmlFor="cn-number" required>
                Credit Note Number
              </FieldLabel>
              <Input
                id="cn-number"
                placeholder="e.g. CN-2026-001"
                className="h-8 text-sm"
                disabled={disabled}
                {...form.register("credit_note_number")}
              />
              <FieldError>
                {form.formState.errors.credit_note_number?.message}
              </FieldError>
            </Field>

            <Field data-invalid={!!form.formState.errors.credit_note_date}>
              <FieldLabel required>
                Credit Note Date
              </FieldLabel>
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
          </div>
        </FieldGroup>
      </section>

      {/* ── Vendor & Currency ── */}
      <section className="space-y-3">
        <h2 className="text-sm font-semibold border-b pb-2">Vendor & Currency</h2>
        <FieldGroup className="gap-3">
          <div className="grid grid-cols-2 gap-3">
            <Field data-invalid={!!form.formState.errors.vendor_id}>
              <FieldLabel required>Vendor</FieldLabel>
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
              <FieldError>
                {form.formState.errors.vendor_id?.message}
              </FieldError>
            </Field>

            <Field>
              <FieldLabel htmlFor="cn-reference-number">Reference Number</FieldLabel>
              <Input
                id="cn-reference-number"
                placeholder="e.g. REF-001"
                className="h-8 text-sm"
                disabled={disabled}
                {...form.register("reference_number")}
              />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field data-invalid={!!form.formState.errors.currency_code}>
              <FieldLabel required>Currency</FieldLabel>
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
              <FieldLabel htmlFor="cn-exchange-rate">Exchange Rate</FieldLabel>
              <Input
                id="cn-exchange-rate"
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
        </FieldGroup>
      </section>

      {/* ── Amounts & Remarks ── */}
      <section className="space-y-3">
        <h2 className="text-sm font-semibold border-b pb-2">Amounts & Remarks</h2>
        <FieldGroup className="gap-3">
          <div className="grid grid-cols-2 gap-3">
            <Field>
              <FieldLabel htmlFor="cn-tax-amount">Tax Amount</FieldLabel>
              <Input
                id="cn-tax-amount"
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
              <FieldLabel htmlFor="cn-discount-amount">Discount Amount</FieldLabel>
              <Input
                id="cn-discount-amount"
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

          <div className="grid grid-cols-2 gap-3">
            <Field>
              <FieldLabel htmlFor="cn-description">Description</FieldLabel>
              <Textarea
                id="cn-description"
                placeholder="Optional"
                className="text-xs min-h-13"
                rows={2}
                disabled={disabled}
                maxLength={256}
                {...form.register("description")}
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="cn-notes">Notes</FieldLabel>
              <Textarea
                id="cn-notes"
                placeholder="Optional"
                className="text-xs min-h-13"
                rows={2}
                disabled={disabled}
                maxLength={256}
                {...form.register("notes")}
              />
            </Field>
          </div>
        </FieldGroup>
      </section>
    </div>
  );
}
