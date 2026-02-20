"use client";

import { Controller, type UseFormReturn } from "react-hook-form";
import {
  Field,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { DatePicker } from "@/components/ui/date-picker";
import type { GrnFormValues } from "./grn-form-schema";

interface GrnDetailFieldsProps {
  readonly form: UseFormReturn<GrnFormValues>;
  readonly disabled: boolean;
}

export function GrnDetailFields({ form, disabled }: GrnDetailFieldsProps) {
  return (
    <div className="max-w-3xl space-y-6 pt-4">
      {/* Received By */}
      <div className="space-y-3">
        <h2 className="text-sm font-semibold">Received By</h2>
        <div className="grid grid-cols-3 gap-3">
          <Field>
            <FieldLabel className="text-xs">Received By</FieldLabel>
            <Input
              placeholder="Name"
              className="h-9 text-sm"
              disabled={disabled}
              {...form.register("received_by_name")}
            />
          </Field>

          <Field>
            <FieldLabel className="text-xs">Received At</FieldLabel>
            <Controller
              control={form.control}
              name="received_at"
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
            <FieldLabel className="text-xs">Signature Image URL</FieldLabel>
            <Input
              placeholder="Optional"
              className="h-9 text-sm"
              disabled={disabled}
              {...form.register("signature_image_url")}
            />
          </Field>
        </div>
      </div>

      {/* Conversion */}
      <div className="space-y-3">
        <h2 className="text-sm font-semibold">Conversion</h2>
        <div className="grid grid-cols-3 gap-3">
          <Field>
            <FieldLabel className="text-xs">
              Requested Unit Conversion Factor
            </FieldLabel>
            <Input
              type="number"
              step="0.0001"
              className="h-9 text-right text-sm"
              disabled={disabled}
              {...form.register("requested_unit_conversion_factor")}
            />
          </Field>

          <Field>
            <FieldLabel className="text-xs">
              Approved Unit Conversion Factor
            </FieldLabel>
            <Input
              type="number"
              step="0.0001"
              className="h-9 text-right text-sm"
              disabled={disabled}
              {...form.register("approved_unit_conversion_factor")}
            />
          </Field>
        </div>
      </div>

      {/* Additional */}
      <div className="space-y-3">
        <h2 className="text-sm font-semibold">Additional</h2>
        <FieldGroup className="gap-3">
          <div className="grid grid-cols-2 gap-3">
            <Field>
              <FieldLabel className="text-xs">Description</FieldLabel>
              <Textarea
                placeholder="Optional"
                className="text-sm"
                rows={2}
                disabled={disabled}
                maxLength={256}
                {...form.register("description")}
              />
            </Field>

            <Field>
              <FieldLabel className="text-xs">Note</FieldLabel>
              <Textarea
                placeholder="Optional"
                className="text-sm"
                rows={2}
                disabled={disabled}
                maxLength={256}
                {...form.register("note")}
              />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field>
              <FieldLabel className="text-xs">Info (JSON)</FieldLabel>
              <Textarea
                placeholder="{}"
                className="font-mono text-xs"
                rows={3}
                disabled={disabled}
                maxLength={256}
                {...form.register("info")}
              />
            </Field>

            <Field>
              <FieldLabel className="text-xs">Dimension (JSON)</FieldLabel>
              <Textarea
                placeholder="{}"
                className="font-mono text-xs"
                rows={3}
                disabled={disabled}
                maxLength={256}
                {...form.register("dimension")}
              />
            </Field>
          </div>

          <Field orientation="horizontal">
            <Controller
              control={form.control}
              name="is_active"
              render={({ field }) => (
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  disabled={disabled}
                />
              )}
            />
            <FieldLabel className="text-xs">Active</FieldLabel>
          </Field>
        </FieldGroup>
      </div>
    </div>
  );
}
