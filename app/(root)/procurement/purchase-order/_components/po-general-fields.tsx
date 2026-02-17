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
import { LookupCurrency } from "@/components/lookup/lookup-currency";
import { DatePicker } from "@/components/ui/date-picker";
import type { PoFormValues } from "./po-form-schema";

interface PoGeneralFieldsProps {
  form: UseFormReturn<PoFormValues>;
  disabled: boolean;
}

export function PoGeneralFields({ form, disabled }: PoGeneralFieldsProps) {
  return (
    <div className="max-w-2xl space-y-4">
      <FieldGroup className="gap-3">
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
            <FieldError>
              {form.formState.errors.vendor_id?.message}
            </FieldError>
          </Field>

          <Field data-invalid={!!form.formState.errors.order_date}>
            <FieldLabel className="text-xs">Order Date</FieldLabel>
            <Controller
              control={form.control}
              name="order_date"
              render={({ field }) => (
                <DatePicker
                  value={field.value}
                  onValueChange={field.onChange}
                  disabled={disabled}
                  placeholder="Select order date"
                  className="w-full text-xs"
                />
              )}
            />
            <FieldError>
              {form.formState.errors.order_date?.message}
            </FieldError>
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Field data-invalid={!!form.formState.errors.delivery_date}>
            <FieldLabel className="text-xs">Delivery Date</FieldLabel>
            <Controller
              control={form.control}
              name="delivery_date"
              render={({ field }) => (
                <DatePicker
                  value={field.value}
                  onValueChange={field.onChange}
                  disabled={disabled}
                  placeholder="Select delivery date"
                  className="w-full text-xs"
                />
              )}
            />
            <FieldError>
              {form.formState.errors.delivery_date?.message}
            </FieldError>
          </Field>

          <Field data-invalid={!!form.formState.errors.currency_id}>
            <FieldLabel className="text-xs">Currency</FieldLabel>
            <Controller
              control={form.control}
              name="currency_id"
              render={({ field }) => (
                <LookupCurrency
                  value={field.value}
                  onValueChange={field.onChange}
                  disabled={disabled}
                />
              )}
            />
            <FieldError>
              {form.formState.errors.currency_id?.message}
            </FieldError>
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-3">
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

          <Field>
            <FieldLabel className="text-xs">Credit Term</FieldLabel>
            <Input
              placeholder="e.g. 30 วัน"
              className="h-8 text-sm"
              disabled={disabled}
              {...form.register("credit_term_name")}
            />
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Field>
            <FieldLabel className="text-xs">Buyer</FieldLabel>
            <Input
              placeholder="Buyer name"
              className="h-8 text-sm"
              disabled={disabled}
              {...form.register("buyer_name")}
            />
          </Field>

          <Field>
            <FieldLabel className="text-xs">Email</FieldLabel>
            <Input
              type="email"
              placeholder="e.g. buyer@example.com"
              className="h-8 text-sm"
              disabled={disabled}
              {...form.register("email")}
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

        <Field>
          <FieldLabel className="text-xs">Remarks</FieldLabel>
          <Textarea
            placeholder="Optional remarks"
            className="text-sm"
            rows={2}
            disabled={disabled}
            {...form.register("remarks")}
          />
        </Field>

        <Field>
          <FieldLabel className="text-xs">Note</FieldLabel>
          <Textarea
            placeholder="Optional note"
            className="text-sm"
            rows={2}
            disabled={disabled}
            {...form.register("note")}
          />
        </Field>
      </FieldGroup>
    </div>
  );
}
