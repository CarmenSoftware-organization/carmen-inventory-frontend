"use client";

import { Controller, type UseFormReturn } from "react-hook-form";
import { Field, FieldLabel, FieldError } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LookupVendor } from "@/components/lookup/lookup-vendor";
import { DatePicker } from "@/components/ui/date-picker";
import type { GrnFormValues } from "./grn-form-schema";
import { GrnItemFields } from "./grn-item-fields";

const DOC_STATUS_OPTIONS = [
  { value: "draft", label: "Draft" },
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "cancelled", label: "Cancelled" },
];

const DOC_TYPE_OPTIONS = [
  { value: "purchase_order", label: "Purchase Order" },
  { value: "direct", label: "Direct" },
];

interface GrnGeneralFieldsProps {
  readonly form: UseFormReturn<GrnFormValues>;
  readonly disabled: boolean;
}

export function GrnGeneralFields({ form, disabled }: GrnGeneralFieldsProps) {
  return (
    <div className="space-y-6 pt-4">
      {/* Document Info */}
      <div className="space-y-3">
        <h2 className="text-sm font-semibold">Document Information</h2>
        <div className="grid grid-cols-3 gap-3">
          <Field data-invalid={!!form.formState.errors.doc_type}>
            <FieldLabel className="text-xs" required>
              Document Type
            </FieldLabel>
            <Controller
              control={form.control}
              name="doc_type"
              render={({ field }) => (
                <Select
                  value={field.value}
                  onValueChange={field.onChange}
                  disabled={disabled}
                >
                  <SelectTrigger className="w-full text-sm">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {DOC_TYPE_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            <FieldError>{form.formState.errors.doc_type?.message}</FieldError>
          </Field>

          <Field>
            <FieldLabel htmlFor="grn-invoice-no" className="text-xs">Invoice No.</FieldLabel>
            <Input
              id="grn-invoice-no"
              placeholder="e.g. INV-001"
              className="h-9 text-sm"
              disabled={disabled}
              {...form.register("invoice_no")}
            />
          </Field>

          <Field data-invalid={!!form.formState.errors.vendor_id}>
            <FieldLabel className="text-xs" required>
              Vendor
            </FieldLabel>
            <Controller
              control={form.control}
              name="vendor_id"
              render={({ field }) => (
                <LookupVendor
                  value={field.value ?? ""}
                  onValueChange={field.onChange}
                  disabled={disabled}
                  className="h-9"
                />
              )}
            />
            <FieldError>{form.formState.errors.vendor_id?.message}</FieldError>
          </Field>
          <Field data-invalid={!!form.formState.errors.grn_date}>
            <FieldLabel className="text-xs" required>
              GRN Date
            </FieldLabel>
            <Controller
              control={form.control}
              name="grn_date"
              render={({ field }) => (
                <DatePicker
                  value={field.value}
                  onValueChange={field.onChange}
                  disabled={disabled}
                  placeholder="Select date"
                  className="w-full text-xs h-9"
                />
              )}
            />
            <FieldError>{form.formState.errors.grn_date?.message}</FieldError>
          </Field>

          <Field>
            <FieldLabel className="text-xs">Invoice Date</FieldLabel>
            <Controller
              control={form.control}
              name="invoice_date"
              render={({ field }) => (
                <DatePicker
                  value={field.value ?? ""}
                  onValueChange={field.onChange}
                  disabled={disabled}
                  placeholder="Select date"
                  className="text-xs h-9"
                />
              )}
            />
          </Field>

          <Field>
            <FieldLabel className="text-xs">Expired Date</FieldLabel>
            <Controller
              control={form.control}
              name="expired_date"
              render={({ field }) => (
                <DatePicker
                  value={field.value ?? ""}
                  onValueChange={field.onChange}
                  disabled={disabled}
                  placeholder="Select date"
                  className="text-xs h-9"
                />
              )}
            />
          </Field>
          <Field data-invalid={!!form.formState.errors.doc_status}>
            <FieldLabel className="text-xs" required>
              Status
            </FieldLabel>
            <Controller
              control={form.control}
              name="doc_status"
              render={({ field }) => (
                <Select
                  value={field.value}
                  onValueChange={field.onChange}
                  disabled={disabled}
                >
                  <SelectTrigger className="w-full text-sm">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    {DOC_STATUS_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            <FieldError>{form.formState.errors.doc_status?.message}</FieldError>
          </Field>
        </div>
        <Field orientation="horizontal" className="self-end pb-1.5">
          <Controller
            control={form.control}
            name="is_consignment"
            render={({ field }) => (
              <Checkbox
                id="grn-consignment"
                checked={field.value}
                onCheckedChange={field.onChange}
                disabled={disabled}
              />
            )}
          />
          <FieldLabel htmlFor="grn-consignment" className="text-xs">Consignment</FieldLabel>
        </Field>

        <Field orientation="horizontal" className="self-end pb-1.5">
          <Controller
            control={form.control}
            name="is_cash"
            render={({ field }) => (
              <Checkbox
                id="grn-cash"
                checked={field.value}
                onCheckedChange={field.onChange}
                disabled={disabled}
              />
            )}
          />
          <FieldLabel htmlFor="grn-cash" className="text-xs">Cash</FieldLabel>
        </Field>
      </div>

      <GrnItemFields form={form} disabled={disabled} />
    </div>
  );
}
