"use client";

import { useState } from "react";
import { useForm, Controller, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { FormToolbar } from "@/components/ui/form-toolbar";
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldError,
} from "@/components/ui/field";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import {
  useCreateInventoryAdjustment,
  useUpdateInventoryAdjustment,
  useDeleteInventoryAdjustment,
} from "@/hooks/use-inventory-adjustment";
import type {
  InventoryAdjustment,
  InventoryAdjustmentType,
} from "@/types/inventory-adjustment";
import type { FormMode } from "@/types/form";
import { DeleteDialog } from "@/components/ui/delete-dialog";
import {
  adjSchema,
  type AdjFormValues,
  getDefaultValues,
} from "./inv-adj-form-schema";
import { AdjItemFields } from "./inv-adj-item-fields";

interface InventoryAdjustmentFormProps {
  readonly adjustmentType: InventoryAdjustmentType;
  readonly inventoryAdjustment?: InventoryAdjustment;
}

export function InventoryAdjustmentForm({
  adjustmentType,
  inventoryAdjustment,
}: InventoryAdjustmentFormProps) {
  const router = useRouter();
  const [mode, setMode] = useState<FormMode>(
    inventoryAdjustment ? "view" : "add",
  );
  const isView = mode === "view";
  const isEdit = mode === "edit";
  const isAdd = mode === "add";

  const createAdj = useCreateInventoryAdjustment();
  const updateAdj = useUpdateInventoryAdjustment();
  const deleteAdj = useDeleteInventoryAdjustment();
  const [showDelete, setShowDelete] = useState(false);
  const isPending = createAdj.isPending || updateAdj.isPending;
  const isDisabled = isView || isPending;

  const defaultValues = getDefaultValues(inventoryAdjustment);

  const form = useForm<AdjFormValues>({
    resolver: zodResolver(adjSchema) as Resolver<AdjFormValues>,
    defaultValues,
  });

  const typeLabel = adjustmentType === "stock-in" ? "Stock In" : "Stock Out";

  const onSubmit = (values: AdjFormValues) => {
    const payload = {
      description: values.description,
      doc_status: values.doc_status,
      note: values.note,
      adjustment_type:
        adjustmentType === "stock-in" ? "stock_in" : "stock_out",
      details: {
        add: values.items.map((item) => ({
          product_id: item.product_id,
          product_name: item.product_name,
          product_local_name: item.product_local_name,
          location_id: item.location_id,
          location_code: item.location_code,
          location_name: item.location_name,
          qty: item.qty,
          cost_per_unit: item.cost_per_unit,
          total_cost: item.total_cost,
          description: item.description,
          note: item.note,
        })),
      },
    };

    if (isEdit && inventoryAdjustment) {
      updateAdj.mutate(
        { id: inventoryAdjustment.id, type: adjustmentType, ...payload },
        {
          onSuccess: () => {
            toast.success("Inventory adjustment updated successfully");
            router.push("/inventory-management/inventory-adjustment");
          },
          onError: (err) => toast.error(err.message),
        },
      );
    } else if (isAdd) {
      createAdj.mutate(
        { type: adjustmentType, ...payload },
        {
          onSuccess: () => {
            toast.success("Inventory adjustment created successfully");
            router.push("/inventory-management/inventory-adjustment");
          },
          onError: (err) => toast.error(err.message),
        },
      );
    }
  };

  const handleCancel = () => {
    if (isEdit && inventoryAdjustment) {
      form.reset(defaultValues);
      setMode("view");
    } else {
      router.push("/inventory-management/inventory-adjustment");
    }
  };

  return (
    <div className="space-y-4">
      <FormToolbar
        entity={typeLabel}
        mode={mode}
        formId="inventory-adjustment-form"
        isPending={isPending}
        onBack={() =>
          router.push("/inventory-management/inventory-adjustment")
        }
        onCancel={handleCancel}
        onEdit={() => setMode("edit")}
        onDelete={
          inventoryAdjustment ? () => setShowDelete(true) : undefined
        }
        deleteIsPending={deleteAdj.isPending}
      />

      <form
        id="inventory-adjustment-form"
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-4"
      >
        <div className="max-w-3xl">
          <FieldGroup className="gap-3">
            <div className="grid grid-cols-2 gap-3">
              <Field data-invalid={!!form.formState.errors.doc_status}>
                <FieldLabel>Status</FieldLabel>
                <Controller
                  control={form.control}
                  name="doc_status"
                  render={({ field }) => (
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                      disabled={isDisabled}
                    >
                      <SelectTrigger className="h-8 w-full text-xs">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="in_progress">
                          In Progress
                        </SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
                <FieldError>
                  {form.formState.errors.doc_status?.message}
                </FieldError>
              </Field>
            </div>

            <Field>
              <FieldLabel htmlFor="inv-adj-description">Description</FieldLabel>
              <Textarea
                id="inv-adj-description"
                placeholder="Optional description"
                className="text-xs min-h-13"
                disabled={isDisabled}
                maxLength={256}
                {...form.register("description")}
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="inv-adj-note">Note</FieldLabel>
              <Textarea
                id="inv-adj-note"
                placeholder="Optional note"
                className="text-xs min-h-13"
                disabled={isDisabled}
                maxLength={256}
                {...form.register("note")}
              />
            </Field>
          </FieldGroup>
        </div>

        <AdjItemFields form={form} disabled={isDisabled} />
      </form>

      {inventoryAdjustment && (
        <DeleteDialog
          open={showDelete}
          onOpenChange={(open) =>
            !open && !deleteAdj.isPending && setShowDelete(false)
          }
          title="Delete Inventory Adjustment"
          description={`Are you sure you want to delete "${inventoryAdjustment.document_no}"? This action cannot be undone.`}
          isPending={deleteAdj.isPending}
          onConfirm={() => {
            deleteAdj.mutate(
              { id: inventoryAdjustment.id, type: adjustmentType },
              {
                onSuccess: () => {
                  toast.success(
                    "Inventory adjustment deleted successfully",
                  );
                  router.push("/inventory-management/inventory-adjustment");
                },
                onError: (err) => toast.error(err.message),
              },
            );
          }}
        />
      )}
    </div>
  );
}
