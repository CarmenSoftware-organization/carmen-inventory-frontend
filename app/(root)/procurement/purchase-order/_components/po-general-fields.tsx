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
      <section className="space-y-3">
        <h2 className="text-xs font-semibold">Order Information</h2>
        <FieldGroup className="gap-3">
          <div className="grid grid-cols-3 gap-3">
            <Field data-invalid={!!form.formState.errors.vendor_id}>
              <FieldLabel className="text-xs" required>Vendor</FieldLabel>
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
              <FieldLabel className="text-xs" required>Order Date</FieldLabel>
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
              <FieldLabel className="text-xs" required>Delivery Date</FieldLabel>
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
      <section className="space-y-3">
        <h2 className="text-xs font-semibold">Currency & Payment</h2>
        <FieldGroup className="gap-3">
          <div className="grid grid-cols-3 gap-3">
            <Field data-invalid={!!form.formState.errors.currency_id}>
              <FieldLabel className="text-xs" required>Currency</FieldLabel>
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
              <FieldLabel className="text-xs">Exchange Rate</FieldLabel>
              <div className="justify-end flex h-8 items-center rounded-md border bg-muted/50 px-3 text-xs text-muted-foreground">
                {formatExchangeRate(
                  exchangeRate,
                  defaultCurrencyDecimalPlaces,
                  defaultCurrencyCode,
                )}
              </div>
            </Field>

            <Field>
              <FieldLabel htmlFor="po-credit-term" className="text-xs">Credit Term</FieldLabel>
              <Input
                id="po-credit-term"
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
      <section className="space-y-3">
        <h2 className="text-xs font-semibold">Contact & Remarks</h2>
        <FieldGroup className="gap-3">
          <div className="grid grid-cols-3 gap-3">
            <Field>
              <FieldLabel htmlFor="po-buyer-name" className="text-xs">Buyer</FieldLabel>
              <Input
                id="po-buyer-name"
                placeholder="Buyer name"
                className="h-8 text-xs"
                disabled={disabled}
                {...form.register("buyer_name")}
              />
            </Field>

            <Field className="col-span-2">
              <FieldLabel htmlFor="po-email" className="text-xs">Email</FieldLabel>
              <Input
                id="po-email"
                type="email"
                placeholder="buyer@example.com"
                className="h-8 text-xs"
                disabled={disabled}
                {...form.register("email")}
              />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field>
              <FieldLabel htmlFor="po-description" className="text-xs">Description</FieldLabel>
              <Textarea
                id="po-description"
                placeholder="Optional"
                className="text-xs min-h-13"
                rows={2}
                disabled={disabled}
                maxLength={256}
                {...form.register("description")}
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="po-note" className="text-xs">Note</FieldLabel>
              <Textarea
                id="po-note"
                placeholder="Optional"
                className="text-xs min-h-13"
                rows={2}
                disabled={disabled}
                maxLength={256}
                {...form.register("note")}
              />
            </Field>
          </div>
        </FieldGroup>
      </section>
    </div>
  );
}
