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
  useCreateStoreRequisition,
  useUpdateStoreRequisition,
  useDeleteStoreRequisition,
  type CreateStoreRequisitionDto,
} from "@/hooks/use-store-requisition";
import { useDepartment } from "@/hooks/use-department";
import { useLocation } from "@/hooks/use-location";
import { useProduct } from "@/hooks/use-product";
import type { StoreRequisition } from "@/types/store-requisition";
import type { FormMode } from "@/types/form";
import { DeleteDialog } from "@/components/ui/delete-dialog";

const detailSchema = z.object({
  product_id: z.string().min(1, "Product is required"),
  product_name: z.string(),
  description: z.string(),
  requested_qty: z.coerce.number().min(1, "Quantity must be at least 1"),
  current_stage_status: z.string(),
});

const srSchema = z.object({
  sr_date: z.string().min(1, "SR date is required"),
  expected_date: z.string().min(1, "Expected date is required"),
  description: z.string(),
  workflow_id: z.string(),
  requestor_id: z.string(),
  department_id: z.string().min(1, "Department is required"),
  from_location_id: z.string().min(1, "From location is required"),
  to_location_id: z.string().min(1, "To location is required"),
  items: z.array(detailSchema),
});

type SrFormValues = z.infer<typeof srSchema>;

function isoToDateInput(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toISOString().split("T")[0];
}

interface StoreRequisitionFormProps {
  readonly storeRequisition?: StoreRequisition;
}

export function StoreRequisitionForm({
  storeRequisition,
}: StoreRequisitionFormProps) {
  const router = useRouter();
  const [mode, setMode] = useState<FormMode>(
    storeRequisition ? "view" : "add",
  );
  const isView = mode === "view";
  const isEdit = mode === "edit";
  const isAdd = mode === "add";

  const createSr = useCreateStoreRequisition();
  const updateSr = useUpdateStoreRequisition();
  const deleteSr = useDeleteStoreRequisition();
  const [showDelete, setShowDelete] = useState(false);
  const isPending = createSr.isPending || updateSr.isPending;
  const isDisabled = isView || isPending;

  const { data: deptData } = useDepartment({ perpage: 9999 });
  const departments =
    deptData?.data?.filter((d) => d.is_active) ?? [];

  const { data: locData } = useLocation({ perpage: 9999 });
  const locations =
    locData?.data?.filter((l) => l.is_active) ?? [];

  const { data: productData } = useProduct({ perpage: 9999 });
  const products = productData?.data ?? [];

  const defaultValues: SrFormValues = storeRequisition
    ? {
        sr_date: isoToDateInput(storeRequisition.sr_date),
        expected_date: isoToDateInput(storeRequisition.expected_date),
        description: storeRequisition.description ?? "",
        workflow_id: storeRequisition.workflow_id ?? "",
        requestor_id: storeRequisition.requestor_id ?? "",
        department_id: storeRequisition.department_id ?? "",
        from_location_id: storeRequisition.from_location_id ?? "",
        to_location_id: storeRequisition.to_location_id ?? "",
        items:
          storeRequisition.store_requisition_detail?.map((d) => ({
            product_id: d.product_id,
            product_name: d.product_name,
            description: d.description ?? "",
            requested_qty: d.requested_qty,
            current_stage_status: d.current_stage_status ?? "draft",
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

  const {
    fields: itemFields,
    append: appendItem,
    remove: removeItem,
  } = useFieldArray({ control: form.control, name: "items" });

  const onSubmit = (values: SrFormValues) => {
    const details: CreateStoreRequisitionDto["details"] = {
      sr_date: new Date(values.sr_date).toISOString(),
      expected_date: new Date(values.expected_date).toISOString(),
      description: values.description,
      requestor_id: values.requestor_id,
      workflow_id: values.workflow_id,
      department_id: values.department_id,
      from_location_id: values.from_location_id,
      to_location_id: values.to_location_id,
      store_requisition_detail: {
        add: values.items.map((item) => ({
          product_id: item.product_id,
          description: item.description,
          requested_qty: item.requested_qty,
          current_stage_status: item.current_stage_status || "draft",
        })),
      },
    };

    if (isEdit && storeRequisition) {
      updateSr.mutate(
        {
          id: storeRequisition.id,
          state_role: "update",
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

  const title = isAdd
    ? "Add Store Requisition"
    : isEdit
      ? "Edit Store Requisition"
      : "Store Requisition";

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() =>
              router.push("/store-operation/store-requisition")
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
                form="store-requisition-form"
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
          {isEdit && storeRequisition && (
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={() => setShowDelete(true)}
              disabled={isPending || deleteSr.isPending}
            >
              <Trash2 />
              Delete
            </Button>
          )}
        </div>
      </div>

      <form
        id="store-requisition-form"
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
              <div className="grid grid-cols-2 gap-3">
                <Field data-invalid={!!form.formState.errors.sr_date}>
                  <FieldLabel className="text-xs">SR Date</FieldLabel>
                  <Input
                    type="date"
                    className="h-8 text-sm"
                    disabled={isDisabled}
                    {...form.register("sr_date")}
                  />
                  <FieldError>
                    {form.formState.errors.sr_date?.message}
                  </FieldError>
                </Field>

                <Field data-invalid={!!form.formState.errors.expected_date}>
                  <FieldLabel className="text-xs">Expected Date</FieldLabel>
                  <Input
                    type="date"
                    className="h-8 text-sm"
                    disabled={isDisabled}
                    {...form.register("expected_date")}
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
                  className="text-sm"
                  disabled={isDisabled}
                  {...form.register("description")}
                />
              </Field>

              <div className="grid grid-cols-2 gap-3">
                <Field>
                  <FieldLabel className="text-xs">Workflow ID</FieldLabel>
                  <Input
                    placeholder="e.g. wf-001"
                    className="h-8 text-sm"
                    disabled={isDisabled}
                    {...form.register("workflow_id")}
                  />
                </Field>

                <Field>
                  <FieldLabel className="text-xs">Requestor ID</FieldLabel>
                  <Input
                    placeholder="e.g. usr-001"
                    className="h-8 text-sm"
                    disabled={isDisabled}
                    {...form.register("requestor_id")}
                  />
                </Field>
              </div>

              <Field
                data-invalid={!!form.formState.errors.department_id}
              >
                <FieldLabel className="text-xs">Department</FieldLabel>
                <Controller
                  control={form.control}
                  name="department_id"
                  render={({ field }) => (
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                      disabled={isDisabled}
                    >
                      <SelectTrigger className="h-8 w-full text-sm">
                        <SelectValue placeholder="Select department" />
                      </SelectTrigger>
                      <SelectContent>
                        {departments.map((d) => (
                          <SelectItem key={d.id} value={d.id}>
                            {d.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                <FieldError>
                  {form.formState.errors.department_id?.message}
                </FieldError>
              </Field>

              <div className="grid grid-cols-2 gap-3">
                <Field
                  data-invalid={!!form.formState.errors.from_location_id}
                >
                  <FieldLabel className="text-xs">From Location</FieldLabel>
                  <Controller
                    control={form.control}
                    name="from_location_id"
                    render={({ field }) => (
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
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
                    {form.formState.errors.from_location_id?.message}
                  </FieldError>
                </Field>

                <Field
                  data-invalid={!!form.formState.errors.to_location_id}
                >
                  <FieldLabel className="text-xs">To Location</FieldLabel>
                  <Controller
                    control={form.control}
                    name="to_location_id"
                    render={({ field }) => (
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
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
                    {form.formState.errors.to_location_id?.message}
                  </FieldError>
                </Field>
              </div>
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
                      description: "",
                      requested_qty: 1,
                      current_stage_status: "draft",
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
                      onRemove={() => removeItem(index)}
                    />
                  ))}
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
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

/* ------------------------------------------------------------------ */
/* Item Row                                                            */
/* ------------------------------------------------------------------ */

interface ItemRowProps {
  form: UseFormReturn<SrFormValues>;
  index: number;
  isDisabled: boolean;
  products: { id: string; name: string; code: string }[];
  onRemove: () => void;
}

function ItemRow({
  form,
  index,
  isDisabled,
  products,
  onRemove,
}: ItemRowProps) {
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
            !!form.formState.errors.items?.[index]?.requested_qty
          }
        >
          <FieldLabel className="text-xs">Requested Qty</FieldLabel>
          <Input
            type="number"
            min={1}
            placeholder="e.g. 10"
            className="h-8 text-sm"
            disabled={isDisabled}
            {...form.register(`items.${index}.requested_qty`, {
              valueAsNumber: true,
            })}
          />
          <FieldError>
            {form.formState.errors.items?.[index]?.requested_qty?.message}
          </FieldError>
        </Field>

        <Field className="col-span-2">
          <FieldLabel className="text-xs">Description</FieldLabel>
          <Input
            placeholder="Optional"
            className="h-8 text-sm"
            disabled={isDisabled}
            {...form.register(`items.${index}.description`)}
          />
        </Field>
      </div>
    </div>
  );
}
