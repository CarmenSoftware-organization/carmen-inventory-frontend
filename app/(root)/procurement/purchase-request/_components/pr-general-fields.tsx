import { Controller, type UseFormReturn } from "react-hook-form";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Textarea } from "@/components/ui/textarea";
import { LookupWorkflow } from "@/components/lookup/lookup-workflow";
import { WORKFLOW_TYPE } from "@/types/workflows";
import type { PrFormValues } from "./pr-form-schema";

interface PrGeneralFieldsProps {
  form: UseFormReturn<PrFormValues>;
  disabled: boolean;
  reqName: string;
  departmentName: string;
  prDateDisplay: string;
}

export function PrGeneralFields({
  form,
  disabled,
  reqName,
  departmentName,
  prDateDisplay,
}: PrGeneralFieldsProps) {
  return (
    <div className="sticky top-0 z-10 bg-background pb-2 max-w-2xl space-y-4">
      {/* Read-only info strip */}
      <div className="grid grid-cols-3 gap-px">
        <InfoCell label="PR Date" value={prDateDisplay} />
        <InfoCell label="Requestor" value={reqName} />
        <InfoCell label="Department" value={departmentName} />
      </div>

      {/* Editable fields */}
      <FieldGroup className="gap-3">
        <div className="grid grid-cols-2 gap-3">
          <Field>
            <FieldLabel className="text-xs">Workflow</FieldLabel>
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

function InfoCell({
  label,
  value,
}: {
  readonly label: string;
  readonly value: string;
}) {
  return (
    <div className="text-xs">
      <span className="text-muted-foreground">{label}</span>
      <p className="font-medium truncate">{value || "—"}</p>
    </div>
  );
}
