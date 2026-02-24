"use client";

import { useEffect } from "react";
import { useForm, Controller, type Resolver } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldError,
} from "@/components/ui/field";
import { toast } from "sonner";
import { useCreateReport, useUpdateReport } from "@/hooks/use-report";
import type { Report } from "@/types/report";
import { getModeLabels } from "@/types/form";

const reportSchema = z.object({
  name: z.string().min(1, "Name is required"),
  is_active: z.boolean(),
});

type ReportFormValues = z.infer<typeof reportSchema>;

interface ReportDialogProps {
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
  readonly report?: Report | null;
}

export function ReportDialog({
  open,
  onOpenChange,
  report,
}: ReportDialogProps) {
  const isEdit = !!report;
  const createReport = useCreateReport();
  const updateReport = useUpdateReport();
  const isPending = createReport.isPending || updateReport.isPending;
  const labels = getModeLabels(isEdit ? "edit" : "add", "Report");

  const form = useForm<ReportFormValues>({
    resolver: zodResolver(reportSchema) as Resolver<ReportFormValues>,
    defaultValues: { name: "", is_active: true },
  });

  useEffect(() => {
    if (open) {
      form.reset(
        report
          ? {
              name: report.name,
              is_active: report.is_active,
            }
          : { name: "", is_active: true },
      );
    }
  }, [open, report, form]);

  const onSubmit = (values: ReportFormValues) => {
    const payload = {
      name: values.name,
      is_active: values.is_active,
    };

    if (isEdit) {
      updateReport.mutate(
        { id: report.id, ...payload },
        {
          onSuccess: () => {
            toast.success("Report updated successfully");
            onOpenChange(false);
          },
          onError: (err) => toast.error(err.message),
        },
      );
    } else {
      createReport.mutate(payload, {
        onSuccess: () => {
          toast.success("Report created successfully");
          onOpenChange(false);
        },
        onError: (err) => toast.error(err.message),
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={isPending ? undefined : onOpenChange}>
      <DialogContent className="sm:max-w-sm gap-3 p-4">
        <DialogHeader className="gap-0 pb-1">
          <DialogTitle className="text-sm">
            {labels.title}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
          <FieldGroup className="gap-3">
            <Field data-invalid={!!form.formState.errors.name}>
              <FieldLabel htmlFor="report-name" className="text-xs">
                Name
              </FieldLabel>
              <Input
                id="report-name"
                placeholder="e.g. Sales Report"
                className="h-8 text-sm"
                disabled={isPending}
                maxLength={100}
                {...form.register("name")}
              />
              <FieldError>
                {form.formState.errors.name?.message}
              </FieldError>
            </Field>

            <Field orientation="horizontal">
              <Controller
                control={form.control}
                name="is_active"
                render={({ field }) => (
                  <Checkbox
                    id="report-is-active"
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    disabled={isPending}
                  />
                )}
              />
              <FieldLabel htmlFor="report-is-active" className="text-xs">
                Active
              </FieldLabel>
            </Field>
          </FieldGroup>

          <DialogFooter className="pt-1">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button type="submit" size="sm" disabled={isPending}>
              {isPending ? labels.pending : labels.submit}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
