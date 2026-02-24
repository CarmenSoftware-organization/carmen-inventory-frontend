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
import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FormToolbar } from "@/components/ui/form-toolbar";
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
  useCreatePriceListTemplate,
  useUpdatePriceListTemplate,
  useDeletePriceListTemplate,
  type CreatePriceListTemplateDto,
} from "@/hooks/use-price-list-template";
import { useCurrency } from "@/hooks/use-currency";
import { useProduct } from "@/hooks/use-product";
import { useUnit } from "@/hooks/use-unit";
import type { PriceListTemplate } from "@/types/price-list-template";
import type { FormMode } from "@/types/form";
import { PRICE_LIST_TEMPLATE_STATUS_OPTIONS } from "@/constant/price-list-template";
import { DeleteDialog } from "@/components/ui/delete-dialog";

const moqSchema = z.object({
  unit_id: z.string().min(1, "Unit is required"),
  unit_name: z.string(),
  note: z.string(),
  qty: z.coerce.number().min(0),
});

const productSchema = z.object({
  product_id: z.string().min(1, "Product is required"),
  moq: z.array(moqSchema),
});

const templateSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string(),
  status: z.enum(["draft", "active", "inactive"]),
  currency_id: z.string().min(1, "Currency is required"),
  valid_period: z.coerce.number().nullable(),
  vendor_instruction: z.string(),
  products: z.array(productSchema),
});

type TemplateFormValues = z.infer<typeof templateSchema>;

interface PriceListTemplateFormProps {
  readonly priceListTemplate?: PriceListTemplate;
}

export function PriceListTemplateForm({
  priceListTemplate,
}: PriceListTemplateFormProps) {
  const router = useRouter();
  const [mode, setMode] = useState<FormMode>(
    priceListTemplate ? "view" : "add",
  );
  const isView = mode === "view";
  const isEdit = mode === "edit";
  const isAdd = mode === "add";

  const createTemplate = useCreatePriceListTemplate();
  const updateTemplate = useUpdatePriceListTemplate();
  const deleteTemplate = useDeletePriceListTemplate();
  const [showDelete, setShowDelete] = useState(false);
  const isPending = createTemplate.isPending || updateTemplate.isPending;
  const isDisabled = isView || isPending;

  const { data: currencyData } = useCurrency({ perpage: -1 });
  const currencies = currencyData?.data?.filter((c) => c.is_active) ?? [];

  const { data: productData } = useProduct({ perpage: -1 });
  const productList = productData?.data ?? [];

  const { data: unitData } = useUnit({ perpage: -1 });
  const units = unitData?.data?.filter((u) => u.is_active) ?? [];

  const defaultValues: TemplateFormValues = priceListTemplate
    ? {
        name: priceListTemplate.name,
        description: priceListTemplate.description ?? "",
        status: priceListTemplate.status,
        currency_id: priceListTemplate.currency?.id ?? "",
        valid_period: priceListTemplate.validity_period,
        vendor_instruction: priceListTemplate.vendor_instructions ?? "",
        products:
          priceListTemplate.products?.map((p) => ({
            product_id: p.product_id,
            moq:
              p.moq?.map((m) => ({
                unit_id: m.unit_id,
                unit_name: m.unit_name,
                note: m.note ?? "",
                qty: m.qty,
              })) ?? [],
          })) ?? [],
      }
    : {
        name: "",
        description: "",
        status: "draft",
        currency_id: "",
        valid_period: null,
        vendor_instruction: "",
        products: [],
      };

  const form = useForm<TemplateFormValues>({
    resolver: zodResolver(templateSchema) as Resolver<TemplateFormValues>,
    defaultValues,
  });

  const {
    fields: productFields,
    append: appendProduct,
    remove: removeProduct,
  } = useFieldArray({ control: form.control, name: "products" });

  const onSubmit = (values: TemplateFormValues) => {
    const payload: CreatePriceListTemplateDto = {
      name: values.name,
      description: values.description,
      status: values.status,
      currency_id: values.currency_id,
      valid_period: values.valid_period,
      vendor_instruction: values.vendor_instruction,
      products: {
        add: values.products.map((p) => ({
          product_id: p.product_id,
          moq: p.moq.map((m) => ({
            unit_id: m.unit_id,
            unit_name: m.unit_name,
            note: m.note,
            qty: m.qty,
          })),
        })),
      },
    };

    if (isEdit && priceListTemplate) {
      updateTemplate.mutate(
        { id: priceListTemplate.id, ...payload },
        {
          onSuccess: () => {
            toast.success("Price list template updated successfully");
            router.push("/vendor-management/price-list-template");
          },
          onError: (err) => toast.error(err.message),
        },
      );
    } else if (isAdd) {
      createTemplate.mutate(payload, {
        onSuccess: () => {
          toast.success("Price list template created successfully");
          router.push("/vendor-management/price-list-template");
        },
        onError: (err) => toast.error(err.message),
      });
    }
  };

  const handleCancel = () => {
    if (isEdit && priceListTemplate) {
      form.reset(defaultValues);
      setMode("view");
    } else {
      router.push("/vendor-management/price-list-template");
    }
  };

  return (
    <div className="space-y-4">
      <FormToolbar
        entity="Price List Template"
        mode={mode}
        formId="price-list-template-form"
        isPending={isPending}
        onBack={() => router.push("/vendor-management/price-list-template")}
        onCancel={handleCancel}
        onEdit={() => setMode("edit")}
        onDelete={() => setShowDelete(true)}
        deleteIsPending={deleteTemplate.isPending}
      />

      <form
        id="price-list-template-form"
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-4"
      >
        <Tabs defaultValue="general">
          <TabsList variant="line">
            <TabsTrigger value="general" className="text-xs">
              General
            </TabsTrigger>
            <TabsTrigger value="products" className="text-xs">
              Products
            </TabsTrigger>
          </TabsList>

          {/* Tab 1: General */}
          <TabsContent value="general">
            <FieldGroup className="max-w-2xl gap-3 pt-4">
              <Field data-invalid={!!form.formState.errors.name}>
                <FieldLabel className="text-xs">Name</FieldLabel>
                <Input
                  placeholder="e.g. Fresh Produce Template"
                  className="h-8 text-sm"
                  disabled={isDisabled}
                  maxLength={100}
                  {...form.register("name")}
                />
                <FieldError>{form.formState.errors.name?.message}</FieldError>
              </Field>

              <Field>
                <FieldLabel className="text-xs">Description</FieldLabel>
                <Textarea
                  placeholder="Optional"
                  className="text-sm"
                  disabled={isDisabled}
                  maxLength={256}
                  {...form.register("description")}
                />
              </Field>

              <Field data-invalid={!!form.formState.errors.status}>
                <FieldLabel className="text-xs">Status</FieldLabel>
                <Controller
                  control={form.control}
                  name="status"
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
                        {PRICE_LIST_TEMPLATE_STATUS_OPTIONS.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </Field>

              <Field data-invalid={!!form.formState.errors.currency_id}>
                <FieldLabel className="text-xs">Currency</FieldLabel>
                <Controller
                  control={form.control}
                  name="currency_id"
                  render={({ field }) => (
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                      disabled={isDisabled}
                    >
                      <SelectTrigger className="h-8 w-full text-sm">
                        <SelectValue placeholder="Select currency" />
                      </SelectTrigger>
                      <SelectContent>
                        {currencies.map((c) => (
                          <SelectItem key={c.id} value={c.id}>
                            {c.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                <FieldError>
                  {form.formState.errors.currency_id?.message}
                </FieldError>
              </Field>

              <Field>
                <FieldLabel className="text-xs">
                  Validity Period (days)
                </FieldLabel>
                <Input
                  type="number"
                  min={0}
                  placeholder="e.g. 30"
                  className="h-8 text-sm"
                  disabled={isDisabled}
                  {...form.register("valid_period", { valueAsNumber: true })}
                />
              </Field>

              <Field>
                <FieldLabel className="text-xs">Vendor Instruction</FieldLabel>
                <Textarea
                  placeholder="Optional"
                  className="text-sm"
                  disabled={isDisabled}
                  maxLength={256}
                  {...form.register("vendor_instruction")}
                />
              </Field>
            </FieldGroup>
          </TabsContent>

          {/* Tab 2: Products */}
          <TabsContent value="products">
            <div className="space-y-3 pt-4">
              {!isDisabled && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    appendProduct({
                      product_id: "",
                      moq: [{ unit_id: "", unit_name: "", note: "", qty: 1 }],
                    })
                  }
                >
                  <Plus />
                  Add Product
                </Button>
              )}

              {productFields.length === 0 ? (
                <p className="text-xs text-muted-foreground">
                  No products added
                </p>
              ) : (
                <div className="space-y-3">
                  {productFields.map((field, index) => (
                    <ProductRow
                      key={field.id}
                      form={form}
                      index={index}
                      isDisabled={isDisabled}
                      productList={productList}
                      units={units}
                      onRemove={() => removeProduct(index)}
                    />
                  ))}
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </form>

      {priceListTemplate && (
        <DeleteDialog
          open={showDelete}
          onOpenChange={(open) =>
            !open && !deleteTemplate.isPending && setShowDelete(false)
          }
          title="Delete Price List Template"
          description={`Are you sure you want to delete template "${priceListTemplate.name}"? This action cannot be undone.`}
          isPending={deleteTemplate.isPending}
          onConfirm={() => {
            deleteTemplate.mutate(priceListTemplate.id, {
              onSuccess: () => {
                toast.success("Price list template deleted successfully");
                router.push("/vendor-management/price-list-template");
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
/* Product Row (with nested MOQ array)                                 */
/* ------------------------------------------------------------------ */

interface ProductRowProps {
  form: UseFormReturn<TemplateFormValues>;
  index: number;
  isDisabled: boolean;
  productList: { id: string; name: string }[];
  units: { id: string; name: string }[];
  onRemove: () => void;
}

const ProductRow = ({
  form,
  index,
  isDisabled,
  productList,
  units,
  onRemove,
}: ProductRowProps) => {
  const {
    fields: moqFields,
    append: appendMoq,
    remove: removeMoq,
  } = useFieldArray({
    control: form.control,
    name: `products.${index}.moq`,
  });

  return (
    <div className="rounded-md border p-3 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-muted-foreground">
          Product #{index + 1}
        </span>
        {!isDisabled && (
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            aria-label="Remove product"
            onClick={onRemove}
          >
            <X />
          </Button>
        )}
      </div>

      <Field
        data-invalid={!!form.formState.errors.products?.[index]?.product_id}
      >
        <FieldLabel className="text-xs">Product</FieldLabel>
        <Controller
          control={form.control}
          name={`products.${index}.product_id`}
          render={({ field }) => (
            <Select
              value={field.value}
              onValueChange={field.onChange}
              disabled={isDisabled}
            >
              <SelectTrigger className="h-8 w-full text-sm">
                <SelectValue placeholder="Select product" />
              </SelectTrigger>
              <SelectContent>
                {productList.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
        <FieldError>
          {form.formState.errors.products?.[index]?.product_id?.message}
        </FieldError>
      </Field>

      {/* MOQ sub-array */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-muted-foreground">MOQ</span>
          {!isDisabled && (
            <Button
              type="button"
              variant="outline"
              size="xs"
              onClick={() =>
                appendMoq({ unit_id: "", unit_name: "", note: "", qty: 1 })
              }
            >
              <Plus />
              Add MOQ
            </Button>
          )}
        </div>

        {moqFields.length === 0 ? (
          <p className="text-xs text-muted-foreground pl-2">No MOQ entries</p>
        ) : (
          <div className="space-y-2">
            {moqFields.map((moqField, moqIndex) => (
              <div
                key={moqField.id}
                className="rounded border bg-muted/30 p-2 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    MOQ #{moqIndex + 1}
                  </span>
                  {!isDisabled && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-xs"
                      aria-label="Remove MOQ"
                      onClick={() => removeMoq(moqIndex)}
                    >
                      <X />
                    </Button>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <Field
                    data-invalid={
                      !!form.formState.errors.products?.[index]?.moq?.[moqIndex]
                        ?.unit_id
                    }
                  >
                    <FieldLabel className="text-xs">Unit</FieldLabel>
                    <Controller
                      control={form.control}
                      name={`products.${index}.moq.${moqIndex}.unit_id`}
                      render={({ field }) => (
                        <Select
                          value={field.value}
                          onValueChange={(value) => {
                            field.onChange(value);
                            const unitName =
                              units.find((u) => u.id === value)?.name ?? "";
                            form.setValue(
                              `products.${index}.moq.${moqIndex}.unit_name`,
                              unitName,
                            );
                          }}
                          disabled={isDisabled}
                        >
                          <SelectTrigger className="h-8 w-full text-sm">
                            <SelectValue placeholder="Select unit" />
                          </SelectTrigger>
                          <SelectContent>
                            {units.map((u) => (
                              <SelectItem key={u.id} value={u.id}>
                                {u.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </Field>

                  <Field>
                    <FieldLabel className="text-xs">Qty</FieldLabel>
                    <Input
                      type="number"
                      min={0}
                      className="h-8 text-sm"
                      disabled={isDisabled}
                      {...form.register(
                        `products.${index}.moq.${moqIndex}.qty`,
                      )}
                    />
                  </Field>

                  <Field className="col-span-2">
                    <FieldLabel className="text-xs">Note</FieldLabel>
                    <Input
                      placeholder="Optional"
                      className="h-8 text-sm"
                      disabled={isDisabled}
                      {...form.register(
                        `products.${index}.moq.${moqIndex}.note`,
                      )}
                    />
                  </Field>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
