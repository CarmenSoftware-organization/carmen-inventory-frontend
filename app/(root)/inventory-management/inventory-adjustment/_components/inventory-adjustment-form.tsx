"use client";

import { useState } from "react";
import {
  useForm,
  useFieldArray,
  Controller,
  type Resolver,
  type UseFormReturn,
} from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { ArrowLeft, Pencil, Plus, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
  useCreateInventoryAdjustment,
  useUpdateInventoryAdjustment,
  useDeleteInventoryAdjustment,
} from "@/hooks/use-inventory-adjustment";
import { useProduct } from "@/hooks/use-product";
import { useLocation } from "@/hooks/use-location";
import type {
  InventoryAdjustment,
  InventoryAdjustmentType,
} from "@/types/inventory-adjustment";
import type { FormMode } from "@/types/form";
import { DeleteDialog } from "@/components/ui/delete-dialog";

const detailSchema = z.object({
  product_id: z.string().min(1, "Product is required"),
  product_name: z.string(),
  product_local_name: z.string(),
  location_id: z.string().min(1, "Location is required"),
  location_code: z.string(),
  location_name: z.string(),
  qty: z.coerce.number().min(1, "Quantity must be at least 1"),
  cost_per_unit: z.coerce.number().min(0, "Cost must be 0 or more"),
  total_cost: z.coerce.number(),
  description: z.string(),
  note: z.string(),
});

const adjSchema = z.object({
  description: z.string(),
  doc_status: z.string().min(1, "Status is required"),
  note: z.string(),
  items: z.array(detailSchema),
});

type AdjFormValues = z.infer<typeof adjSchema>;

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

  const { data: productData } = useProduct({ perpage: 9999 });
  const products = productData?.data ?? [];

  const { data: locData } = useLocation({ perpage: 9999 });
  const locations = locData?.data?.filter((l) => l.is_active) ?? [];

  const defaultValues: AdjFormValues = inventoryAdjustment
    ? {
        description: inventoryAdjustment.description ?? "",
        doc_status: inventoryAdjustment.doc_status ?? "in_progress",
        note: inventoryAdjustment.note ?? "",
        items:
          inventoryAdjustment.details?.map((d) => ({
            product_id: d.product_id,
            product_name: d.product_name,
            product_local_name: d.product_local_name,
            location_id: d.location_id,
            location_code: d.location_code,
            location_name: d.location_name,
            qty: d.qty,
            cost_per_unit: d.cost_per_unit,
            total_cost: d.total_cost,
            description: d.description ?? "",
            note: d.note ?? "",
          })) ?? [],
      }
    : {
        description: "",
        doc_status: "in_progress",
        note: "",
        items: [],
      };

  const form = useForm<AdjFormValues>({
    resolver: zodResolver(adjSchema) as Resolver<AdjFormValues>,
    defaultValues,
  });

  const {
    fields: itemFields,
    append: appendItem,
    remove: removeItem,
  } = useFieldArray({ control: form.control, name: "items" });

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

  const title = isAdd
    ? `Add ${typeLabel}`
    : isEdit
      ? `Edit ${typeLabel}`
      : typeLabel;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() =>
              router.push("/inventory-management/inventory-adjustment")
            }
          >
            <ArrowLeft />
          </Button>
          <h1 className="text-lg font-semibold">{title}</h1>
        </div>
        <div className="flex items-center gap-2">
          {isView ? (
            <Button size="sm" onClick={() => setMode("edit")}>
              <Pencil />
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
                form="inventory-adjustment-form"
                disabled={isPending}
              >
                {isPending
                  ? isEdit
                    ? "Saving..."
                    : "Creating..."
                  : isEdit
                    ? "Save"
                    : "Create"}
              </Button>
            </>
          )}
          {isEdit && inventoryAdjustment && (
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={() => setShowDelete(true)}
              disabled={isPending || deleteAdj.isPending}
            >
              <Trash2 />
              Delete
            </Button>
          )}
        </div>
      </div>

      <form
        id="inventory-adjustment-form"
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-4"
      >
        <Tabs defaultValue="general">
          <TabsList variant="line">
            <TabsTrigger value="general" className="text-xs">
              General
            </TabsTrigger>
            <TabsTrigger value="items" className="text-xs">
              Items
            </TabsTrigger>
          </TabsList>

          {/* Tab 1: General */}
          <TabsContent value="general">
            <FieldGroup className="max-w-2xl gap-3 pt-4">
              <Field>
                <FieldLabel className="text-xs">Description</FieldLabel>
                <Textarea
                  placeholder="Optional description"
                  className="text-sm"
                  disabled={isDisabled}
                  {...form.register("description")}
                />
              </Field>

              <Field data-invalid={!!form.formState.errors.doc_status}>
                <FieldLabel className="text-xs">Status</FieldLabel>
                <Controller
                  control={form.control}
                  name="doc_status"
                  render={({ field }) => (
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                      disabled={isDisabled}
                    >
                      <SelectTrigger className="h-8 w-full text-sm">
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

              <Field>
                <FieldLabel className="text-xs">Note</FieldLabel>
                <Textarea
                  placeholder="Optional note"
                  className="text-sm"
                  disabled={isDisabled}
                  {...form.register("note")}
                />
              </Field>
            </FieldGroup>
          </TabsContent>

          {/* Tab 2: Items */}
          <TabsContent value="items">
            <div className="space-y-3 pt-4">
              {!isDisabled && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    appendItem({
                      product_id: "",
                      product_name: "",
                      product_local_name: "",
                      location_id: "",
                      location_code: "",
                      location_name: "",
                      qty: 1,
                      cost_per_unit: 0,
                      total_cost: 0,
                      description: "",
                      note: "",
                    })
                  }
                >
                  <Plus />
                  Add Item
                </Button>
              )}

              {itemFields.length === 0 ? (
                <p className="text-xs text-muted-foreground">
                  No items added
                </p>
              ) : (
                <div className="space-y-3">
                  {itemFields.map((field, index) => (
                    <ItemRow
                      key={field.id}
                      form={form}
                      index={index}
                      isDisabled={isDisabled}
                      products={products}
                      locations={locations}
                      onRemove={() => removeItem(index)}
                    />
                  ))}
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
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

/* ------------------------------------------------------------------ */
/* Item Row                                                            */
/* ------------------------------------------------------------------ */

interface ItemRowProps {
  form: UseFormReturn<AdjFormValues>;
  index: number;
  isDisabled: boolean;
  products: { id: string; name: string; code: string; local_name: string }[];
  locations: { id: string; name: string; code: string }[];
  onRemove: () => void;
}

function ItemRow({
  form,
  index,
  isDisabled,
  products,
  locations,
  onRemove,
}: ItemRowProps) {
  const recalcTotal = (
    qtyField: "qty" | "cost_per_unit",
    newValue: number,
  ) => {
    const qty =
      qtyField === "qty"
        ? newValue
        : form.getValues(`items.${index}.qty`);
    const cost =
      qtyField === "cost_per_unit"
        ? newValue
        : form.getValues(`items.${index}.cost_per_unit`);
    form.setValue(`items.${index}.total_cost`, qty * cost);
  };

  return (
    <div className="rounded-md border p-3 space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-muted-foreground">
          Item #{index + 1}
        </span>
        {!isDisabled && (
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            onClick={onRemove}
          >
            <X />
          </Button>
        )}
      </div>

      <div className="grid grid-cols-2 gap-2">
        <Field
          data-invalid={
            !!form.formState.errors.items?.[index]?.product_id
          }
          className="col-span-2"
        >
          <FieldLabel className="text-xs">Product</FieldLabel>
          <Controller
            control={form.control}
            name={`items.${index}.product_id`}
            render={({ field }) => (
              <Select
                value={field.value}
                onValueChange={(value) => {
                  field.onChange(value);
                  const product = products.find((p) => p.id === value);
                  if (product) {
                    form.setValue(
                      `items.${index}.product_name`,
                      product.name,
                    );
                    form.setValue(
                      `items.${index}.product_local_name`,
                      product.local_name ?? "",
                    );
                  }
                }}
                disabled={isDisabled}
              >
                <SelectTrigger className="h-8 w-full text-sm">
                  <SelectValue placeholder="Select product" />
                </SelectTrigger>
                <SelectContent>
                  {products.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          <FieldError>
            {form.formState.errors.items?.[index]?.product_id?.message}
          </FieldError>
        </Field>

        <Field
          data-invalid={
            !!form.formState.errors.items?.[index]?.location_id
          }
          className="col-span-2"
        >
          <FieldLabel className="text-xs">Location</FieldLabel>
          <Controller
            control={form.control}
            name={`items.${index}.location_id`}
            render={({ field }) => (
              <Select
                value={field.value}
                onValueChange={(value) => {
                  field.onChange(value);
                  const loc = locations.find((l) => l.id === value);
                  if (loc) {
                    form.setValue(
                      `items.${index}.location_code`,
                      loc.code,
                    );
                    form.setValue(
                      `items.${index}.location_name`,
                      loc.name,
                    );
                  }
                }}
                disabled={isDisabled}
              >
                <SelectTrigger className="h-8 w-full text-sm">
                  <SelectValue placeholder="Select location" />
                </SelectTrigger>
                <SelectContent>
                  {locations.map((l) => (
                    <SelectItem key={l.id} value={l.id}>
                      {l.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          <FieldError>
            {form.formState.errors.items?.[index]?.location_id?.message}
          </FieldError>
        </Field>

        <Field
          data-invalid={!!form.formState.errors.items?.[index]?.qty}
        >
          <FieldLabel className="text-xs">Qty</FieldLabel>
          <Input
            type="number"
            min={1}
            placeholder="e.g. 10"
            className="h-8 text-sm"
            disabled={isDisabled}
            {...form.register(`items.${index}.qty`, {
              valueAsNumber: true,
              onChange: (e) =>
                recalcTotal("qty", Number(e.target.value) || 0),
            })}
          />
          <FieldError>
            {form.formState.errors.items?.[index]?.qty?.message}
          </FieldError>
        </Field>

        <Field
          data-invalid={
            !!form.formState.errors.items?.[index]?.cost_per_unit
          }
        >
          <FieldLabel className="text-xs">Cost per Unit</FieldLabel>
          <Input
            type="number"
            min={0}
            step="0.01"
            placeholder="e.g. 100"
            className="h-8 text-sm"
            disabled={isDisabled}
            {...form.register(`items.${index}.cost_per_unit`, {
              valueAsNumber: true,
              onChange: (e) =>
                recalcTotal("cost_per_unit", Number(e.target.value) || 0),
            })}
          />
          <FieldError>
            {form.formState.errors.items?.[index]?.cost_per_unit?.message}
          </FieldError>
        </Field>

        <Field>
          <FieldLabel className="text-xs">Total Cost</FieldLabel>
          <Input
            type="number"
            className="h-8 text-sm bg-muted"
            disabled
            {...form.register(`items.${index}.total_cost`, {
              valueAsNumber: true,
            })}
          />
        </Field>

        <Field>
          <FieldLabel className="text-xs">Description</FieldLabel>
          <Input
            placeholder="Optional"
            className="h-8 text-sm"
            disabled={isDisabled}
            {...form.register(`items.${index}.description`)}
          />
        </Field>

        <Field className="col-span-2">
          <FieldLabel className="text-xs">Note</FieldLabel>
          <Input
            placeholder="Optional"
            className="h-8 text-sm"
            disabled={isDisabled}
            {...form.register(`items.${index}.note`)}
          />
        </Field>
      </div>
    </div>
  );
}
