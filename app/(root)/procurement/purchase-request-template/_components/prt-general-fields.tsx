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
import { Checkbox } from "@/components/ui/checkbox";
import { LookupWorkflow } from "@/components/lookup/lookup-workflow";
import { LookupDepartment } from "@/components/lookup/lookup-department";
import { WORKFLOW_TYPE } from "@/types/workflows";
import type { PrtFormValues } from "./prt-form-schema";

interface PrtGeneralFieldsProps {
  form: UseFormReturn<PrtFormValues>;
  disabled: boolean;
}

export function PrtGeneralFields({ form, disabled }: PrtGeneralFieldsProps) {
  return (
    <div className="max-w-3xl">
      <FieldGroup className="gap-3">
        {/* Name + Active */}
        <div className="grid grid-cols-2 gap-3">
          <Field data-invalid={!!form.formState.errors.name}>
            <FieldLabel className="text-xs" required>
              Name
            </FieldLabel>
            <Input
              placeholder="e.g. Food Template"
              className="h-8 text-sm"
              disabled={disabled}
              maxLength={100}
              {...form.register("name")}
            />
            <FieldError>{form.formState.errors.name?.message}</FieldError>
          </Field>

          <label className="flex items-center gap-1.5 mt-5 cursor-pointer select-none">
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
            <span className="text-xs">Active</span>
          </label>
        </div>

        {/* Workflow + Department */}
        <div className="grid grid-cols-2 gap-3">
          <Field data-invalid={!!form.formState.errors.workflow_id}>
            <FieldLabel className="text-xs" required>
              Workflow
            </FieldLabel>
            <Controller
              control={form.control}
              name="workflow_id"
              render={({ field }) => (
                <LookupWorkflow
                  value={field.value}
                  onValueChange={field.onChange}
                  workflowType={WORKFLOW_TYPE.PR}
                  disabled={disabled}
                />
              )}
            />
            <FieldError>
              {form.formState.errors.workflow_id?.message}
            </FieldError>
          </Field>

          <Field data-invalid={!!form.formState.errors.department_id}>
            <FieldLabel className="text-xs" required>
              Department
            </FieldLabel>
            <Controller
              control={form.control}
              name="department_id"
              render={({ field }) => (
                <LookupDepartment
                  value={field.value}
                  onValueChange={field.onChange}
                  disabled={disabled}
                />
              )}
            />
            <FieldError>
              {form.formState.errors.department_id?.message}
            </FieldError>
          </Field>
        </div>

        {/* Description + Note */}
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
      </FieldGroup>
    </div>
  );
}
