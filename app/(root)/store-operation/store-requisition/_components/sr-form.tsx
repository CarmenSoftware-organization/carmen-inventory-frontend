"use client";

import { useState, useEffect } from "react";
import { useForm, useWatch, Controller, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldError,
} from "@/components/ui/field";
import { Textarea } from "@/components/ui/textarea";
import { FormToolbar } from "@/components/ui/form-toolbar";
import { DeleteDialog } from "@/components/ui/delete-dialog";
import { LookupLocation } from "@/components/lookup/lookup-location";
import { LookupWorkflow } from "@/components/lookup/lookup-workflow";
import { WORKFLOW_TYPE } from "@/types/workflows";
import { toast } from "sonner";
import {
  useCreateStoreRequisition,
  useUpdateStoreRequisition,
  useDeleteStoreRequisition,
  type CreateStoreRequisitionDto,
} from "@/hooks/use-store-requisition";
import { useProfile } from "@/hooks/use-profile";
import type { StoreRequisition } from "@/types/store-requisition";
import type { FormMode } from "@/types/form";
import { DatePicker } from "@/components/ui/date-picker";
import { srSchema, type SrFormValues } from "./sr-form-schema";
import { SrItemFields } from "./sr-item-fields";

interface StoreRequisitionFormProps {
  readonly storeRequisition?: StoreRequisition;
}

export function StoreRequisitionForm({
  storeRequisition,
}: StoreRequisitionFormProps) {
  const router = useRouter();
  const { data: profile, defaultBu } = useProfile();
  const [mode, setMode] = useState<FormMode>(storeRequisition ? "view" : "add");
  const isView = mode === "view";
  const isEdit = mode === "edit";
  const isAdd = mode === "add";

  const createSr = useCreateStoreRequisition();
  const updateSr = useUpdateStoreRequisition();
  const deleteSr = useDeleteStoreRequisition();
  const [showDelete, setShowDelete] = useState(false);

  const isPending = createSr.isPending || updateSr.isPending;
  const isDisabled = isView || isPending;

  const requestorName = profile
    ? `${profile.user_info.firstname} ${profile.user_info.lastname}`
    : "";
  const reqName = storeRequisition?.requestor_name ?? requestorName;
  const defaultRequestorId = profile?.id ?? "";
  const departmentName =
    storeRequisition?.department_name ?? defaultBu?.department.name ?? "";
  const defaultDepartmentId = defaultBu?.department.id ?? "";

  const defaultValues: SrFormValues = storeRequisition
    ? {
        sr_date: storeRequisition.sr_date ?? "",
        expected_date: storeRequisition.expected_date ?? "",
        description: storeRequisition.description ?? "",
        workflow_id: storeRequisition.workflow_id ?? "",
        requestor_id: storeRequisition.requestor_id ?? defaultRequestorId,
        department_id: storeRequisition.department_id ?? defaultDepartmentId,
        from_location_id: storeRequisition.from_location_id ?? "",
        to_location_id: storeRequisition.to_location_id ?? "",
        items:
          storeRequisition.store_requisition_detail?.map((d) => ({
            id: d.id,
            product_id: d.product_id,
            product_name: d.product_name,
            description: d.description ?? "",
            requested_qty: d.requested_qty,
            approved_qty: d.approved_qty ?? 0,
            issued_qty: d.issued_qty ?? 0,
            current_stage_status: d.current_stage_status ?? "pending",
          })) ?? [],
      }
    : {
        sr_date: "",
        expected_date: "",
        description: "",
        workflow_id: "",
        requestor_id: "",
        department_id: "",
        from_location_id: "",
        to_location_id: "",
        items: [],
      };

  const form = useForm<SrFormValues>({
    resolver: zodResolver(srSchema) as Resolver<SrFormValues>,
    defaultValues,
  });

  const fromLocationId = useWatch({ control: form.control, name: "from_location_id" });
  const srDate = useWatch({ control: form.control, name: "sr_date" });

  useEffect(() => {
    if (!profile || !defaultBu) return;
    if (!form.getValues("requestor_id")) {
      form.setValue("requestor_id", defaultRequestorId);
    }
    if (!form.getValues("department_id")) {
      form.setValue("department_id", defaultDepartmentId);
    }
  }, [profile, defaultBu, form, defaultRequestorId, defaultDepartmentId]);

  const mapItemToPayload = (item: SrFormValues["items"][number]) => ({
    product_id: item.product_id,
    description: item.description,
    requested_qty: item.requested_qty,
    approved_qty: item.approved_qty,
    issued_qty: item.issued_qty,
    current_stage_status: item.current_stage_status || "pending",
  });

  const onSubmit = (values: SrFormValues) => {
    const newItems = values.items.filter((item) => !item.id);
    const existingItems = values.items.filter(
      (item): item is typeof item & { id: string } => !!item.id,
    );

    // Items in defaults but no longer in form → removed
    const currentIds = new Set(existingItems.map((item) => item.id));
    const removedItems = defaultValues.items
      .filter(
        (item): item is typeof item & { id: string } =>
          !!item.id && !currentIds.has(item.id),
      )
      .map((item) => ({ id: item.id }));

    // Existing items that changed → update
    const updatedItems = existingItems.filter((item) => {
      const idx = values.items.findIndex((v) => v.id === item.id);
      const dirty = form.formState.dirtyFields.items?.[idx];
      return dirty != null && Object.keys(dirty).length > 0;
    });

    const store_requisition_detail: CreateStoreRequisitionDto["details"]["store_requisition_detail"] =
      {};
    if (newItems.length > 0) {
      store_requisition_detail.add = newItems.map(mapItemToPayload);
    }
    if (updatedItems.length > 0) {
      store_requisition_detail.update = updatedItems.map((item) => ({
        id: item.id,
        ...mapItemToPayload(item),
      }));
    }
    if (removedItems.length > 0) {
      store_requisition_detail.remove = removedItems;
    }

    const details: CreateStoreRequisitionDto["details"] = {
      sr_date: values.sr_date,
      expected_date: values.expected_date,
      description: values.description,
      requestor_id: values.requestor_id,
      workflow_id: values.workflow_id,
      department_id: values.department_id,
      from_location_id: values.from_location_id,
      to_location_id: values.to_location_id,
      doc_version: storeRequisition?.doc_version ?? 0,
      store_requisition_detail,
    };

    if (isEdit && storeRequisition) {
      updateSr.mutate(
        {
          id: storeRequisition.id,
          state_role: "create",
          details,
        },
        {
          onSuccess: () => {
            toast.success("Store requisition updated successfully");
            router.push("/store-operation/store-requisition");
          },
          onError: (err) => toast.error(err.message),
        },
      );
    } else if (isAdd) {
      createSr.mutate(
        { state_role: "create", details },
        {
          onSuccess: () => {
            toast.success("Store requisition created successfully");
            router.push("/store-operation/store-requisition");
          },
          onError: (err) => toast.error(err.message),
        },
      );
    }
  };

  const handleCancel = () => {
    if (isEdit && storeRequisition) {
      form.reset(defaultValues);
      setMode("view");
    } else {
      router.push("/store-operation/store-requisition");
    }
  };

  return (
    <div className="space-y-4">
      <FormToolbar
        entity="Store Requisition"
        mode={mode}
        formId="store-requisition-form"
        isPending={isPending}
        onBack={() => router.push("/store-operation/store-requisition")}
        onEdit={() => setMode("edit")}
        onCancel={handleCancel}
        onDelete={storeRequisition ? () => setShowDelete(true) : undefined}
        deleteIsPending={deleteSr.isPending}
      />

      <form
        id="store-requisition-form"
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-4"
      >
        <div className="max-w-3xl space-y-3">
          <div className="flex gap-6">
            <InfoCell label="Requestor" value={reqName} />
            <InfoCell label="Department" value={departmentName} />
          </div>

          {/* ── Assignment ── */}
          <section className="space-y-3">
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
                        workflowType={WORKFLOW_TYPE.SR}
                        disabled={isDisabled}
                      />
                    )}
                  />
                </Field>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Field data-invalid={!!form.formState.errors.from_location_id}>
                  <FieldLabel className="text-xs">From Location</FieldLabel>
                  <Controller
                    control={form.control}
                    name="from_location_id"
                    render={({ field }) => (
                      <LookupLocation
                        value={field.value}
                        onValueChange={(val) => {
                          field.onChange(val);
                          if (val && val === form.getValues("to_location_id")) {
                            form.setValue("to_location_id", "");
                          }
                        }}
                        disabled={isDisabled}
                        className="w-full"
                      />
                    )}
                  />
                  <FieldError>
                    {form.formState.errors.from_location_id?.message}
                  </FieldError>
                </Field>

                <Field data-invalid={!!form.formState.errors.to_location_id}>
                  <FieldLabel className="text-xs">To Location</FieldLabel>
                  <Controller
                    control={form.control}
                    name="to_location_id"
                    render={({ field }) => (
                      <LookupLocation
                        value={field.value}
                        onValueChange={field.onChange}
                        disabled={isDisabled || !fromLocationId}
                        excludeIds={fromLocationId ? [fromLocationId] : undefined}
                        className="w-full"
                      />
                    )}
                  />
                  <FieldError>
                    {form.formState.errors.to_location_id?.message}
                  </FieldError>
                </Field>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Field data-invalid={!!form.formState.errors.sr_date}>
                  <FieldLabel className="text-xs">SR Date</FieldLabel>
                  <Controller
                    control={form.control}
                    name="sr_date"
                    render={({ field }) => (
                      <DatePicker
                        value={field.value}
                        onValueChange={(val) => {
                          field.onChange(val);
                          const expected = form.getValues("expected_date");
                          if (val && expected && new Date(expected) < new Date(val)) {
                            form.setValue("expected_date", "");
                          }
                        }}
                        disabled={isDisabled}
                        placeholder="Pick SR date"
                        className="w-full"
                      />
                    )}
                  />
                  <FieldError>
                    {form.formState.errors.sr_date?.message}
                  </FieldError>
                </Field>

                <Field data-invalid={!!form.formState.errors.expected_date}>
                  <FieldLabel className="text-xs">Expected Date</FieldLabel>
                  <Controller
                    control={form.control}
                    name="expected_date"
                    render={({ field }) => (
                      <DatePicker
                        value={field.value}
                        onValueChange={field.onChange}
                        disabled={isDisabled || !srDate}
                        fromDate={srDate ? new Date(srDate) : undefined}
                        placeholder="Pick expected date"
                        className="w-full"
                      />
                    )}
                  />
                  <FieldError>
                    {form.formState.errors.expected_date?.message}
                  </FieldError>
                </Field>
              </div>

              <Field>
                <FieldLabel className="text-xs">Description</FieldLabel>
                <Textarea
                  placeholder="Optional description"
                  className="text-xs min-h-13"
                  disabled={isDisabled}
                  maxLength={256}
                  {...form.register("description")}
                />
              </Field>
            </FieldGroup>
          </section>
        </div>
        <SrItemFields form={form} disabled={isDisabled} />
      </form>

      {storeRequisition && (
        <DeleteDialog
          open={showDelete}
          onOpenChange={(open) =>
            !open && !deleteSr.isPending && setShowDelete(false)
          }
          title="Delete Store Requisition"
          description={`Are you sure you want to delete "${storeRequisition.sr_no}"? This action cannot be undone.`}
          isPending={deleteSr.isPending}
          onConfirm={() => {
            deleteSr.mutate(storeRequisition.id, {
              onSuccess: () => {
                toast.success("Store requisition deleted successfully");
                router.push("/store-operation/store-requisition");
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
