"use client";

import { Controller, type UseFormReturn } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldError,
} from "@/components/ui/field";
import { workflowTypeField, type WorkflowCreateModel } from "@/types/workflows";

interface WfGeneralProps {
  readonly form: UseFormReturn<WorkflowCreateModel>;
  readonly isDisabled: boolean;
}

export function WfGeneral({ form, isDisabled }: WfGeneralProps) {
  return (
    <div className="max-w-2xl pt-3">
      <FieldGroup className="gap-2.5">
        <div className="grid grid-cols-2 gap-2.5">
          <Field data-invalid={!!form.formState.errors.name}>
            <FieldLabel htmlFor="wf-name" className="text-[11px]">
              Workflow Name
            </FieldLabel>
            <Input
              id="wf-name"
              placeholder="e.g. Purchase Request Approval"
              className="h-8 text-xs"
              disabled={isDisabled}
              maxLength={100}
              {...form.register("name")}
            />
            <FieldError>{form.formState.errors.name?.message}</FieldError>
          </Field>

          <Field data-invalid={!!form.formState.errors.workflow_type}>
            <FieldLabel htmlFor="wf-type" className="text-[11px]">
              Workflow Type
            </FieldLabel>
            <Controller
              control={form.control}
              name="workflow_type"
              render={({ field }) => (
                <Select
                  value={field.value}
                  onValueChange={field.onChange}
                  disabled={isDisabled}
                >
                  <SelectTrigger id="wf-type" size="sm" className="text-xs">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {workflowTypeField.map((opt) => (
                      <SelectItem
                        key={opt.value}
                        value={opt.value}
                        className="text-xs"
                      >
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            <FieldError>
              {form.formState.errors.workflow_type?.message}
            </FieldError>
          </Field>
        </div>

        <Field>
          <FieldLabel htmlFor="wf-description" className="text-[11px]">
            Description
          </FieldLabel>
          <Textarea
            id="wf-description"
            placeholder="Optional description"
            className="text-xs min-h-15"
            disabled={isDisabled}
            {...form.register("description")}
          />
        </Field>

        <Field orientation="horizontal">
          <Controller
            control={form.control}
            name="is_active"
            render={({ field }) => (
              <Checkbox
                id="wf-is-active"
                checked={field.value}
                onCheckedChange={field.onChange}
                disabled={isDisabled}
              />
            )}
          />
          <FieldLabel htmlFor="wf-is-active" className="text-[11px]">
            Active
          </FieldLabel>
        </Field>
      </FieldGroup>
    </div>
  );
}
