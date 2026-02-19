"use client";

import { Controller, useWatch, type UseFormReturn } from "react-hook-form";
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
import { useProfile } from "@/hooks/use-profile";
import { formatExchangeRate } from "@/lib/currency-utils";
import type { PoFormValues } from "./po-form-schema";

interface PoGeneralFieldsProps {
  form: UseFormReturn<PoFormValues>;
  disabled: boolean;
}

export function PoGeneralFields({ form, disabled }: PoGeneralFieldsProps) {
  const { defaultCurrencyCode, defaultCurrencyDecimalPlaces } = useProfile();
  const exchangeRate = useWatch({ control: form.control, name: "exchange_rate" });

  return (
    <div className="space-y-3">
      {/* ── Order Information ── */}
      <section className="space-y-2">
        <h2 className="text-xs font-semibold">Order Information</h2>
        <FieldGroup className="gap-2">
          <div className="grid grid-cols-3 gap-2">
            <Field data-invalid={!!form.formState.errors.vendor_id}>
              <FieldLabel className="text-[11px]" required>Vendor</FieldLabel>
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

            <Field data-invalid={!!form.formState.errors.order_date}>
              <FieldLabel className="text-[11px]" required>Order Date</FieldLabel>
              <Controller
                control={form.control}
                name="order_date"
                render={({ field }) => (
                  <DatePicker
                    value={field.value}
                    onValueChange={field.onChange}
                    disabled={disabled}
                    placeholder="Select date"
                    className="w-full text-xs h-8"
                  />
                )}
              />
              <FieldError>{form.formState.errors.order_date?.message}</FieldError>
            </Field>

            <Field data-invalid={!!form.formState.errors.delivery_date}>
              <FieldLabel className="text-[11px]" required>Delivery Date</FieldLabel>
              <Controller
                control={form.control}
                name="delivery_date"
                render={({ field }) => (
                  <DatePicker
                    value={field.value}
                    onValueChange={field.onChange}
                    disabled={disabled}
                    placeholder="Select date"
                    className="w-full text-xs h-8"
                  />
                )}
              />
              <FieldError>
                {form.formState.errors.delivery_date?.message}
              </FieldError>
            </Field>
          </div>
        </FieldGroup>
      </section>

      {/* ── Currency & Payment ── */}
      <section className="space-y-2">
        <h2 className="text-xs font-semibold">Currency & Payment</h2>
        <FieldGroup className="gap-2">
          <div className="grid grid-cols-3 gap-2">
            <Field data-invalid={!!form.formState.errors.currency_id}>
              <FieldLabel className="text-[11px]" required>Currency</FieldLabel>
              <Controller
                control={form.control}
                name="currency_id"
                render={({ field }) => (
                  <LookupCurrency
                    value={field.value}
                    onValueChange={field.onChange}
                    onItemChange={(currency) => {
                      form.setValue("currency_name", currency.code);
                      form.setValue("exchange_rate", currency.exchange_rate);
                    }}
                    disabled={disabled}
                  />
                )}
              />
              <FieldError>{form.formState.errors.currency_id?.message}</FieldError>
            </Field>

            <Field>
              <FieldLabel className="text-[11px]">Exchange Rate</FieldLabel>
              <div className="justify-end flex h-8 items-center rounded-md border bg-muted/50 px-3 text-xs text-muted-foreground">
                {formatExchangeRate(
                  exchangeRate,
                  defaultCurrencyDecimalPlaces,
                  defaultCurrencyCode,
                )}
              </div>
            </Field>

            <Field>
              <FieldLabel className="text-[11px]">Credit Term</FieldLabel>
              <Input
                placeholder="e.g. 30 days"
                className="h-8 text-xs"
                disabled={disabled}
                {...form.register("credit_term_name")}
              />
            </Field>
          </div>
        </FieldGroup>
      </section>

      {/* ── Contact & Remarks ── */}
      <section className="space-y-2">
        <h2 className="text-xs font-semibold">Contact & Remarks</h2>
        <FieldGroup className="gap-2">
          <div className="grid grid-cols-3 gap-2">
            <Field>
              <FieldLabel className="text-[11px]">Buyer</FieldLabel>
              <Input
                placeholder="Buyer name"
                className="h-8 text-xs"
                disabled={disabled}
                {...form.register("buyer_name")}
              />
            </Field>

            <Field className="col-span-2">
              <FieldLabel className="text-[11px]">Email</FieldLabel>
              <Input
                type="email"
                placeholder="buyer@example.com"
                className="h-8 text-xs"
                disabled={disabled}
                {...form.register("email")}
              />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <Field>
              <FieldLabel className="text-[11px]">Description</FieldLabel>
              <Textarea
                placeholder="Optional"
                className="text-xs min-h-13"
                rows={2}
                disabled={disabled}
                {...form.register("description")}
              />
            </Field>

            <Field>
              <FieldLabel className="text-[11px]">Note</FieldLabel>
              <Textarea
                placeholder="Optional"
                className="text-xs min-h-13"
                rows={2}
                disabled={disabled}
                {...form.register("note")}
              />
            </Field>
          </div>
        </FieldGroup>
      </section>
    </div>
  );
}
