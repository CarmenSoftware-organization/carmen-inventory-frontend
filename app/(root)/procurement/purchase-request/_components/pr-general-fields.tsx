import { useEffect } from "react";
import { Controller, type UseFormReturn } from "react-hook-form";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Textarea } from "@/components/ui/textarea";
import { LookupWorkflow } from "@/components/lookup/lookup-workflow";
import { WORKFLOW_TYPE } from "@/types/workflows";
import { useProfile } from "@/hooks/use-profile";
import { formatDate } from "@/lib/date-utils";
import type { PrFormValues } from "./purchase-request-form";

interface PrGeneralFieldsProps {
  form: UseFormReturn<PrFormValues>;
  disabled: boolean;
}

export function PrGeneralFields({ form, disabled }: PrGeneralFieldsProps) {
  const { data: profile, defaultBu, dateFormat } = useProfile();

  const requestorName = profile
    ? `${profile.user_info.firstname} ${profile.user_info.lastname}`
    : "";
  const departmentName = defaultBu?.department.name ?? "";
  const prDateDisplay = formatDate(
    form.watch("pr_date") || new Date().toISOString(),
    dateFormat,
  );

  useEffect(() => {
    if (!form.getValues("pr_date")) {
      form.setValue("pr_date", new Date().toISOString().split("T")[0]);
    }
    if (!profile || !defaultBu) return;
    if (!form.getValues("requestor_id")) {
      form.setValue("requestor_id", profile.id);
    }
    if (!form.getValues("department_id")) {
      form.setValue("department_id", defaultBu.department.id);
    }
  }, [profile, defaultBu, form]);

  return (
    <div className="max-w-2xl space-y-4">
      {/* Read-only info strip */}
      <div className="grid grid-cols-3 gap-px">
        <InfoCell label="PR Date" value={prDateDisplay} />
        <InfoCell label="Requestor" value={requestorName} />
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
