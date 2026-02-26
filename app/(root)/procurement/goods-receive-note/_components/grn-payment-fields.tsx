"use client";

import { Controller, type UseFormReturn } from "react-hook-form";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { LookupCurrency } from "@/components/lookup/lookup-currency";
import { LookupCreditTerm } from "@/components/lookup/lookup-credit-term";
import { DatePicker } from "@/components/ui/date-picker";
import type { GrnFormValues } from "./grn-form-schema";

interface GrnPaymentFieldsProps {
  readonly form: UseFormReturn<GrnFormValues>;
  readonly disabled: boolean;
}

export function GrnPaymentFields({ form, disabled }: GrnPaymentFieldsProps) {
  return (
    <div className="max-w-3xl space-y-6 pt-4">
      {/* Currency & Payment */}
      <div className="space-y-3">
        <h2 className="text-sm font-semibold border-b pb-2">Currency & Payment</h2>
        <div className="grid grid-cols-3 gap-3">
          <Field>
            <FieldLabel>Currency</FieldLabel>
            <Controller
              control={form.control}
              name="currency_id"
              render={({ field }) => (
                <LookupCurrency
                  value={field.value ?? ""}
                  onValueChange={field.onChange}
                  disabled={disabled}
                />
              )}
            />
          </Field>

          <Field>
            <FieldLabel>Exchange Rate</FieldLabel>
            <Input
              type="number"
              step="0.0001"
              className="h-9 text-right text-sm"
              disabled={disabled}
              {...form.register("exchange_rate")}
            />
          </Field>

          <Field>
            <FieldLabel>Exchange Rate Date</FieldLabel>
            <Controller
              control={form.control}
              name="exchange_rate_date"
              render={({ field }) => (
                <DatePicker
                  value={field.value ?? ""}
                  onValueChange={field.onChange}
                  disabled={disabled}
                  placeholder="Select date"
                  className="w-full text-xs"
                />
              )}
            />
          </Field>

          <Field>
            <FieldLabel>Credit Term</FieldLabel>
            <Controller
              control={form.control}
              name="credit_term_id"
              render={({ field }) => (
                <LookupCreditTerm
                  value={field.value ?? ""}
                  onValueChange={field.onChange}
                  disabled={disabled}
                />
              )}
            />
          </Field>

          <Field>
            <FieldLabel>Credit Term Days</FieldLabel>
            <Input
              type="number"
              min={0}
              className="h-9 text-right text-sm"
              disabled={disabled}
              {...form.register("credit_term_days")}
            />
          </Field>

          <Field>
            <FieldLabel>Payment Due Date</FieldLabel>
            <Controller
              control={form.control}
              name="payment_due_date"
              render={({ field }) => (
                <DatePicker
                  value={field.value ?? ""}
                  onValueChange={field.onChange}
                  disabled={disabled}
                  placeholder="Select date"
                  className="w-full text-xs"
                />
              )}
            />
          </Field>
        </div>
      </div>

      {/* Discount */}
      <div className="space-y-3">
        <h2 className="text-sm font-semibold border-b pb-2">Discount</h2>
        <div className="grid grid-cols-4 gap-3">
          <Field>
            <FieldLabel>Discount Rate</FieldLabel>
            <div className="relative">
              <Input
                type="number"
                step="0.01"
                className="h-9 pr-7 text-right text-sm"
                disabled={disabled}
                {...form.register("discount_rate")}
              />
              <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                %
              </span>
            </div>
          </Field>

          <Field>
            <FieldLabel>Discount Amount</FieldLabel>
            <Input
              type="number"
              step="0.01"
              className="h-9 text-right text-sm"
              disabled={disabled}
              {...form.register("discount_amount")}
            />
          </Field>

          <Field>
            <FieldLabel>Base Discount Amount</FieldLabel>
            <Input
              type="number"
              step="0.01"
              className="h-9 text-right text-sm"
              disabled={disabled}
              {...form.register("base_discount_amount")}
            />
          </Field>

          <Field orientation="horizontal" className="self-end pb-1.5">
            <Controller
              control={form.control}
              name="is_discount_adjustment"
              render={({ field }) => (
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  disabled={disabled}
                />
              )}
            />
            <FieldLabel>Discount Adjustment</FieldLabel>
          </Field>
        </div>
      </div>
    </div>
  );
}
