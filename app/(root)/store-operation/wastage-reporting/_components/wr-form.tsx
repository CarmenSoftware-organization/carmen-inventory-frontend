"use client";

import { useState } from "react";
import { useForm, Controller, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { ArrowLeft, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldError,
} from "@/components/ui/field";
import { Badge } from "@/components/ui/badge";
import { DeleteDialog } from "@/components/ui/delete-dialog";
import { LookupLocation } from "@/components/lookup/lookup-location";
import { DatePicker } from "@/components/ui/date-picker";
import { toast } from "sonner";
import {
  useCreateWastageReport,
  useUpdateWastageReport,
  useDeleteWastageReport,
  type CreateWastageReportDto,
} from "@/hooks/use-wastage-report";
import { useProfile } from "@/hooks/use-profile";
import type { WastageReport } from "@/types/wastage-reporting";
import { WR_STATUS_CONFIG } from "@/constant/wastage-reporting";
import { getModeLabels, type FormMode } from "@/types/form";
import {
  wrSchema,
  type WrFormValues,
  mapItemToPayload,
} from "./wr-form-schema";
import { WrItemFields } from "./wr-item-fields";

interface WastageReportFormProps {
  readonly wastageReport?: WastageReport;
}

export function WastageReportForm({ wastageReport }: WastageReportFormProps) {
  const router = useRouter();
  const { data: profile } = useProfile();
  const [mode, setMode] = useState<FormMode>(wastageReport ? "view" : "add");
  const isView = mode === "view";
  const isEdit = mode === "edit";
  const isAdd = mode === "add";

  const createWr = useCreateWastageReport();
  const updateWr = useUpdateWastageReport();
  const deleteWr = useDeleteWastageReport();
  const [showDelete, setShowDelete] = useState(false);

  const isPending = createWr.isPending || updateWr.isPending;
  const isDisabled = isView || isPending;

  const reportorName = wastageReport?.reportor_name
    ?? (profile
      ? `${profile.user_info.firstname} ${profile.user_info.lastname}`
      : "");

  const defaultValues: WrFormValues = wastageReport
    ? {
        date: wastageReport.date ?? "",
        location_id: wastageReport.location_id ?? "",
        reason: wastageReport.reason ?? "",
        items:
          wastageReport.items?.map((d) => ({
            id: d.id,
            product_id: d.product_id,
            product_name: d.product_name,
            product_code: d.product_code,
            qty: d.qty,
            unit_id: d.unit_id,
            unit_name: d.unit_name,
            unit_cost: d.unit_cost,
          })) ?? [],
      }
    : {
        date: "",
        location_id: "",
        reason: "",
        items: [],
      };

  const form = useForm<WrFormValues>({
    resolver: zodResolver(wrSchema) as Resolver<WrFormValues>,
    defaultValues,
  });

  const onSubmit = (values: WrFormValues) => {
    const newItems = values.items.filter((item) => !item.id);
    const existingItems = values.items.filter(
      (item): item is typeof item & { id: string } => !!item.id,
    );

    const currentIds = new Set(existingItems.map((item) => item.id));
    const removedItems = defaultValues.items
      .filter(
        (item): item is typeof item & { id: string } =>
          !!item.id && !currentIds.has(item.id),
      )
      .map((item) => ({ id: item.id }));

    const updatedItems = existingItems.filter((item) => {
      const idx = values.items.findIndex((v) => v.id === item.id);
      const dirty = form.formState.dirtyFields.items?.[idx];
      return dirty != null && Object.keys(dirty).length > 0;
    });

    const wastage_report_detail: CreateWastageReportDto["wastage_report_detail"] =
      {};
    if (newItems.length > 0) {
      wastage_report_detail.add = newItems.map(mapItemToPayload);
    }
    if (updatedItems.length > 0) {
      wastage_report_detail.update = updatedItems.map((item) => ({
        id: item.id,
        ...mapItemToPayload(item),
      }));
    }
    if (removedItems.length > 0) {
      wastage_report_detail.remove = removedItems;
    }

    const payload: CreateWastageReportDto = {
      date: values.date,
      location_id: values.location_id,
      reason: values.reason,
      wastage_report_detail,
    };

    if (isEdit && wastageReport) {
      updateWr.mutate(
        { id: wastageReport.id, ...payload },
        {
          onSuccess: () => {
            toast.success("Wastage report updated successfully");
            router.push("/store-operation/wastage-reporting");
          },
          onError: (err) => toast.error(err.message),
        },
      );
    } else if (isAdd) {
      createWr.mutate(payload, {
        onSuccess: () => {
          toast.success("Wastage report created successfully");
          router.push("/store-operation/wastage-reporting");
        },
        onError: (err) => toast.error(err.message),
      });
    }
  };

  const handleCancel = () => {
    if (isEdit && wastageReport) {
      form.reset(defaultValues);
      setMode("view");
    } else {
      router.push("/store-operation/wastage-reporting");
    }
  };

  const labels = getModeLabels(mode, "Wastage Report");

  return (
    <div className="space-y-4">
      <div className="sticky top-0 z-10 bg-background flex items-center justify-between py-2">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="Go back"
            onClick={() => router.push("/store-operation/wastage-reporting")}
          >
            <ArrowLeft />
          </Button>
          {isAdd ? (
            <h1 className="font-semibold text-lg">New Wastage Report</h1>
          ) : (
            <div className="flex items-center gap-1.5">
              <h1 className="font-semibold text-lg">
                {wastageReport?.wr_no}
              </h1>
              {wastageReport?.status && (
                <Badge
                  variant={WR_STATUS_CONFIG[wastageReport.status]?.variant}
                >
                  {WR_STATUS_CONFIG[wastageReport.status]?.label ??
                    wastageReport.status}
                </Badge>
              )}
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          {isView ? (
            <Button size="sm" onClick={() => setMode("edit")}>
              <Pencil aria-hidden="true" />
              Edit
            </Button>
          ) : (
            <>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleCancel}
                disabled={isPending}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                form="wastage-report-form"
                disabled={isPending}
              >
                {isPending ? labels.pending : labels.submit}
              </Button>
            </>
          )}
          {isEdit && wastageReport && (
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={() => setShowDelete(true)}
              disabled={isPending || deleteWr.isPending}
            >
              <Trash2 aria-hidden="true" />
              Delete
            </Button>
          )}
        </div>
      </div>

      <form
        id="wastage-report-form"
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-4"
      >
        <div className="max-w-3xl space-y-3">
          <div className="flex gap-6">
            <InfoCell label="Reportor" value={reportorName} />
          </div>

          <section className="space-y-3">
            <FieldGroup className="gap-3">
              <div className="grid grid-cols-2 gap-3">
                <Field data-invalid={!!form.formState.errors.date}>
                  <FieldLabel className="text-xs">Date</FieldLabel>
                  <Controller
                    control={form.control}
                    name="date"
                    render={({ field }) => (
                      <DatePicker
                        value={field.value}
                        onValueChange={field.onChange}
                        disabled={isDisabled}
                        placeholder="Pick date"
                        className="w-full"
                      />
                    )}
                  />
                  <FieldError>
                    {form.formState.errors.date?.message}
                  </FieldError>
                </Field>

                <Field data-invalid={!!form.formState.errors.location_id}>
                  <FieldLabel className="text-xs">Location</FieldLabel>
                  <Controller
                    control={form.control}
                    name="location_id"
                    render={({ field }) => (
                      <LookupLocation
                        value={field.value}
                        onValueChange={field.onChange}
                        disabled={isDisabled}
                        className="w-full"
                      />
                    )}
                  />
                  <FieldError>
                    {form.formState.errors.location_id?.message}
                  </FieldError>
                </Field>
              </div>

              <Field data-invalid={!!form.formState.errors.reason}>
                <FieldLabel htmlFor="wr-reason" className="text-xs">
                  Reason
                </FieldLabel>
                <Textarea
                  id="wr-reason"
                  placeholder="Describe the cause of wastage"
                  className="text-xs min-h-13"
                  disabled={isDisabled}
                  maxLength={256}
                  {...form.register("reason")}
                />
                <FieldError>
                  {form.formState.errors.reason?.message}
                </FieldError>
              </Field>
            </FieldGroup>
          </section>
        </div>

        <WrItemFields form={form} disabled={isDisabled} />
      </form>

      {wastageReport && (
        <DeleteDialog
          open={showDelete}
          onOpenChange={(open) =>
            !open && !deleteWr.isPending && setShowDelete(false)
          }
          title="Delete Wastage Report"
          description={`Are you sure you want to delete "${wastageReport.wr_no}"? This action cannot be undone.`}
          isPending={deleteWr.isPending}
          onConfirm={() => {
            deleteWr.mutate(wastageReport.id, {
              onSuccess: () => {
                toast.success("Wastage report deleted successfully");
                router.push("/store-operation/wastage-reporting");
              },
              onError: (err) => toast.error(err.message),
            });
          }}
        />
      )}
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
