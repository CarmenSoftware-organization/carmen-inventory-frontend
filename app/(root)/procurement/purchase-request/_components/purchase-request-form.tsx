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
  useCreatePurchaseRequest,
  useUpdatePurchaseRequest,
  useDeletePurchaseRequest,
  type CreatePurchaseRequestDto,
} from "@/hooks/use-purchase-request";
import { useDepartment } from "@/hooks/use-department";
import { useVendor } from "@/hooks/use-vendor";
import { useProduct } from "@/hooks/use-product";
import type {
  PurchaseRequest,
  PurchaseRequestTemplate,
} from "@/types/purchase-request";
import type { FormMode } from "@/types/form";
import { DeleteDialog } from "@/components/ui/delete-dialog";
import { isoToDateInput } from "@/lib/date-utils";

const detailSchema = z.object({
  product_id: z.string().min(1, "Product is required"),
  product_name: z.string(),
  description: z.string(),
  requested_qty: z.coerce.number().min(1, "Quantity must be at least 1"),
  unit_price: z.coerce.number().min(0, "Unit price must be at least 0"),
  current_stage_status: z.string(),
});

const prSchema = z.object({
  pr_date: z.string().min(1, "PR date is required"),
  expected_date: z.string().min(1, "Expected date is required"),
  description: z.string(),
  workflow_id: z.string(),
  requestor_id: z.string(),
  department_id: z.string().min(1, "Department is required"),
  vendor_id: z.string().min(1, "Vendor is required"),
  items: z.array(detailSchema),
});

type PrFormValues = z.infer<typeof prSchema>;

interface PurchaseRequestFormProps {
  readonly purchaseRequest?: PurchaseRequest;
  readonly template?: PurchaseRequestTemplate;
}

export function PurchaseRequestForm({
  purchaseRequest,
  template,
}: PurchaseRequestFormProps) {
  const router = useRouter();
  const [mode, setMode] = useState<FormMode>(
    purchaseRequest ? "view" : "add",
  );
  const isView = mode === "view";
  const isEdit = mode === "edit";
  const isAdd = mode === "add";

  const createPr = useCreatePurchaseRequest();
  const updatePr = useUpdatePurchaseRequest();
  const deletePr = useDeletePurchaseRequest();
  const [showDelete, setShowDelete] = useState(false);
  const isPending = createPr.isPending || updatePr.isPending;
  const isDisabled = isView || isPending;

  const { data: deptData } = useDepartment({ perpage: 9999 });
  const departments =
    deptData?.data?.filter((d) => d.is_active) ?? [];

  const { data: vendorData } = useVendor({ perpage: 9999 });
  const vendors =
    vendorData?.data?.filter((v) => v.is_active) ?? [];

  const { data: productData } = useProduct({ perpage: 9999 });
  const products = productData?.data ?? [];

  const defaultValues: PrFormValues = purchaseRequest
    ? {
        pr_date: isoToDateInput(purchaseRequest.pr_date),
        expected_date: isoToDateInput(purchaseRequest.expected_date),
        description: purchaseRequest.description ?? "",
        workflow_id: purchaseRequest.workflow_id ?? "",
        requestor_id: purchaseRequest.requestor_id ?? "",
        department_id: purchaseRequest.department_id ?? "",
        vendor_id: purchaseRequest.vendor_id ?? "",
        items:
          purchaseRequest.purchase_request_detail?.map((d) => ({
            product_id: d.product_id,
            product_name: d.product_name,
            description: d.description ?? "",
            requested_qty: d.requested_qty,
            unit_price: d.unit_price,
            current_stage_status: d.current_stage_status ?? "draft",
          })) ?? [],
      }
    : template
      ? {
          pr_date: "",
          expected_date: "",
          description: template.description ?? "",
          workflow_id: template.workflow_id ?? "",
          requestor_id: "",
          department_id: template.department_id ?? "",
          vendor_id: "",
          items:
            template.purchase_request_template_detail?.map((d) => ({
              product_id: d.product_id,
              product_name: d.product_name,
              description: d.description ?? "",
              requested_qty: d.requested_qty,
              unit_price: 0,
              current_stage_status: "draft",
            })) ?? [],
        }
      : {
          pr_date: "",
          expected_date: "",
          description: "",
          workflow_id: "",
          requestor_id: "",
          department_id: "",
          vendor_id: "",
          items: [],
        };

  const form = useForm<PrFormValues>({
    resolver: zodResolver(prSchema) as Resolver<PrFormValues>,
    defaultValues,
  });

  const {
    fields: itemFields,
    append: appendItem,
    remove: removeItem,
  } = useFieldArray({ control: form.control, name: "items" });

  const onSubmit = (values: PrFormValues) => {
    const details: CreatePurchaseRequestDto["details"] = {
      pr_date: new Date(values.pr_date).toISOString(),
      expected_date: new Date(values.expected_date).toISOString(),
      description: values.description,
      requestor_id: values.requestor_id,
      workflow_id: values.workflow_id,
      department_id: values.department_id,
      vendor_id: values.vendor_id,
      purchase_request_detail: {
        add: values.items.map((item) => ({
          product_id: item.product_id,
          description: item.description,
          requested_qty: item.requested_qty,
          unit_price: item.unit_price,
          current_stage_status: item.current_stage_status || "draft",
        })),
      },
    };

    if (isEdit && purchaseRequest) {
      updatePr.mutate(
        {
          id: purchaseRequest.id,
          state_role: "update",
          details,
        },
        {
          onSuccess: () => {
            toast.success("Purchase request updated successfully");
            router.push("/procurement/purchase-request");
          },
          onError: (err) => toast.error(err.message),
        },
      );
    } else if (isAdd) {
      createPr.mutate(
        { state_role: "create", details },
        {
          onSuccess: () => {
            toast.success("Purchase request created successfully");
            router.push("/procurement/purchase-request");
          },
          onError: (err) => toast.error(err.message),
        },
      );
    }
  };

  const handleCancel = () => {
    if (isEdit && purchaseRequest) {
      form.reset(defaultValues);
      setMode("view");
    } else {
      router.push("/procurement/purchase-request");
    }
  };

  const title = isAdd
    ? "Add Purchase Request"
    : isEdit
      ? "Edit Purchase Request"
      : "Purchase Request";

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() =>
              router.push("/procurement/purchase-request")
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
                form="purchase-request-form"
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
          {isEdit && purchaseRequest && (
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={() => setShowDelete(true)}
              disabled={isPending || deletePr.isPending}
            >
              <Trash2 />
              Delete
            </Button>
          )}
        </div>
      </div>

      <form
        id="purchase-request-form"
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
                <Field data-invalid={!!form.formState.errors.pr_date}>
                  <FieldLabel className="text-xs">PR Date</FieldLabel>
                  <Input
                    type="date"
                    className="h-8 text-sm"
                    disabled={isDisabled}
                    {...form.register("pr_date")}
                  />
                  <FieldError>
                    {form.formState.errors.pr_date?.message}
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

              <Field
                data-invalid={!!form.formState.errors.vendor_id}
              >
                <FieldLabel className="text-xs">Vendor</FieldLabel>
                <Controller
                  control={form.control}
                  name="vendor_id"
                  render={({ field }) => (
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                      disabled={isDisabled}
                    >
                      <SelectTrigger className="h-8 w-full text-sm">
                        <SelectValue placeholder="Select vendor" />
                      </SelectTrigger>
                      <SelectContent>
                        {vendors.map((v) => (
                          <SelectItem key={v.id} value={v.id}>
                            {v.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                <FieldError>
                  {form.formState.errors.vendor_id?.message}
                </FieldError>
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
                      description: "",
                      requested_qty: 1,
                      unit_price: 0,
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

      {purchaseRequest && (
        <DeleteDialog
          open={showDelete}
          onOpenChange={(open) =>
            !open && !deletePr.isPending && setShowDelete(false)
          }
          title="Delete Purchase Request"
          description={`Are you sure you want to delete "${purchaseRequest.pr_no}"? This action cannot be undone.`}
          isPending={deletePr.isPending}
          onConfirm={() => {
            deletePr.mutate(purchaseRequest.id, {
              onSuccess: () => {
                toast.success("Purchase request deleted successfully");
                router.push("/procurement/purchase-request");
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
  form: UseFormReturn<PrFormValues>;
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

        <Field
          data-invalid={
            !!form.formState.errors.items?.[index]?.unit_price
          }
        >
          <FieldLabel className="text-xs">Unit Price</FieldLabel>
          <Input
            type="number"
            min={0}
            step="0.01"
            placeholder="e.g. 100.00"
            className="h-8 text-sm"
            disabled={isDisabled}
            {...form.register(`items.${index}.unit_price`, {
              valueAsNumber: true,
            })}
          />
          <FieldError>
            {form.formState.errors.items?.[index]?.unit_price?.message}
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
