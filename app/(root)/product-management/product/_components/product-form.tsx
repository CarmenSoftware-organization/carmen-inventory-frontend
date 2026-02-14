"use client";

import { useState } from "react";
import { useForm, useFieldArray, Controller, type Resolver } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { ArrowLeft, Pencil, Plus, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
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
  useCreateProduct,
  useUpdateProduct,
  useDeleteProduct,
} from "@/hooks/use-product";
import { useTaxProfile } from "@/hooks/use-tax-profile";
import { useLocation } from "@/hooks/use-location";
import { LookupUnit } from "@/components/lookup/lookup-unit";
import type { ProductDetail } from "@/types/product";
import type { FormMode } from "@/types/form";
import { DeleteDialog } from "@/components/ui/delete-dialog";

const productSchema = z.object({
  name: z.string().min(1, "Name is required"),
  code: z.string().min(1, "Code is required"),
  local_name: z.string(),
  description: z.string(),
  inventory_unit_id: z.string().min(1, "Inventory unit is required"),
  product_status_type: z.enum(["active", "inactive"]),
  tax_profile_id: z.string(),
  is_used_in_recipe: z.boolean(),
  is_sold_directly: z.boolean(),
  barcode: z.string(),
  sku: z.string(),
  price_deviation_limit: z.coerce.number().nullable(),
  qty_deviation_limit: z.coerce.number().nullable(),
  info: z.array(
    z.object({
      label: z.string().min(1, "Label is required"),
      value: z.string(),
      data_type: z.string(),
    }),
  ),
  location_ids: z.array(z.string()),
  order_units: z.array(
    z.object({
      from_unit_id: z.string().min(1, "Unit is required"),
      from_unit_qty: z.coerce.number().min(0),
      to_unit_id: z.string().min(1, "Unit is required"),
      to_unit_qty: z.coerce.number().min(0),
      description: z.string(),
      is_default: z.boolean(),
      is_active: z.boolean(),
    }),
  ),
  ingredient_units: z.array(
    z.object({
      from_unit_id: z.string().min(1, "Unit is required"),
      from_unit_qty: z.coerce.number().min(0),
      to_unit_id: z.string().min(1, "Unit is required"),
      to_unit_qty: z.coerce.number().min(0),
      description: z.string(),
      is_default: z.boolean(),
      is_active: z.boolean(),
    }),
  ),
});

type ProductFormValues = z.infer<typeof productSchema>;

interface ProductFormProps {
  readonly product?: ProductDetail;
}

export function ProductForm({ product }: ProductFormProps) {
  const router = useRouter();
  const [mode, setMode] = useState<FormMode>(product ? "view" : "add");
  const isView = mode === "view";
  const isEdit = mode === "edit";
  const isAdd = mode === "add";

  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const deleteProduct = useDeleteProduct();
  const [showDelete, setShowDelete] = useState(false);
  const isPending = createProduct.isPending || updateProduct.isPending;
  const isDisabled = isView || isPending;

  const { data: taxData } = useTaxProfile({ perpage: 9999 });
  const taxProfiles = taxData?.data?.filter((t) => t.is_active) ?? [];

  const { data: locationData } = useLocation({ perpage: 9999 });
  const allLocations = locationData?.data?.filter((l) => l.is_active) ?? [];

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema) as Resolver<ProductFormValues>,
    defaultValues: product
      ? {
          name: product.name,
          code: product.code,
          local_name: product.local_name ?? "",
          description: product.description ?? "",
          inventory_unit_id: product.inventory_unit_id ?? "",
          product_status_type: product.product_status_type,
          tax_profile_id: product.tax_profile_id ?? "",
          is_used_in_recipe: product.product_info?.is_used_in_recipe ?? false,
          is_sold_directly: product.product_info?.is_sold_directly ?? false,
          barcode: product.product_info?.barcode ?? "",
          sku: product.product_info?.sku ?? "",
          price_deviation_limit:
            product.product_info?.price_deviation_limit ?? null,
          qty_deviation_limit:
            product.product_info?.qty_deviation_limit ?? null,
          info: product.product_info?.info ?? [],
          location_ids:
            product.locations?.map((l) => l.location_id) ?? [],
          order_units: product.order_units ?? [],
          ingredient_units: product.ingredient_units ?? [],
        }
      : {
          name: "",
          code: "",
          local_name: "",
          description: "",
          inventory_unit_id: "",
          product_status_type: "active" as const,
          tax_profile_id: "",
          is_used_in_recipe: false,
          is_sold_directly: false,
          barcode: "",
          sku: "",
          price_deviation_limit: null,
          qty_deviation_limit: null,
          info: [],
          location_ids: [],
          order_units: [],
          ingredient_units: [],
        },
  });

  const {
    fields: infoFields,
    append: appendInfo,
    remove: removeInfo,
  } = useFieldArray({ control: form.control, name: "info" });

  const {
    fields: orderUnitFields,
    append: appendOrderUnit,
    remove: removeOrderUnit,
  } = useFieldArray({ control: form.control, name: "order_units" });

  const {
    fields: ingredientUnitFields,
    append: appendIngredientUnit,
    remove: removeIngredientUnit,
  } = useFieldArray({ control: form.control, name: "ingredient_units" });

  const watchedLocationIds = form.watch("location_ids");
  const availableLocations = allLocations.filter(
    (l) => !watchedLocationIds.includes(l.id),
  );

  const onSubmit = (values: ProductFormValues) => {
    const payload = {
      name: values.name,
      code: values.code,
      local_name: values.local_name,
      description: values.description,
      inventory_unit_id: values.inventory_unit_id,
      product_status_type: values.product_status_type,
      tax_profile_id: values.tax_profile_id || undefined,
      product_info: {
        is_used_in_recipe: values.is_used_in_recipe,
        is_sold_directly: values.is_sold_directly,
        barcode: values.barcode,
        sku: values.sku,
        price_deviation_limit: values.price_deviation_limit,
        qty_deviation_limit: values.qty_deviation_limit,
        info: values.info,
      },
      locations: {
        add: values.location_ids.map((id) => ({ location_id: id })),
      },
      order_units: {
        add: values.order_units.map((u) => ({
          from_unit_id: u.from_unit_id,
          from_unit_qty: u.from_unit_qty,
          to_unit_id: u.to_unit_id,
          to_unit_qty: u.to_unit_qty,
          description: u.description,
          is_default: u.is_default,
          is_active: u.is_active,
        })),
      },
      ingredient_units: {
        add: values.ingredient_units.map((u) => ({
          from_unit_id: u.from_unit_id,
          from_unit_qty: u.from_unit_qty,
          to_unit_id: u.to_unit_id,
          to_unit_qty: u.to_unit_qty,
          description: u.description,
          is_default: u.is_default,
          is_active: u.is_active,
        })),
      },
    };

    if (isEdit && product) {
      updateProduct.mutate(
        { id: product.id, ...payload } as never,
        {
          onSuccess: () => {
            toast.success("Product updated successfully");
            router.push("/product-management/product");
          },
          onError: (err) => toast.error(err.message),
        },
      );
    } else if (isAdd) {
      createProduct.mutate(payload as never, {
        onSuccess: () => {
          toast.success("Product created successfully");
          router.push("/product-management/product");
        },
        onError: (err) => toast.error(err.message),
      });
    }
  };

  const handleCancel = () => {
    if (isEdit && product) {
      form.reset({
        name: product.name,
        code: product.code,
        local_name: product.local_name ?? "",
        description: product.description ?? "",
        inventory_unit_id: product.inventory_unit_id ?? "",
        product_status_type: product.product_status_type,
        tax_profile_id: product.tax_profile_id ?? "",
        is_used_in_recipe: product.product_info?.is_used_in_recipe ?? false,
        is_sold_directly: product.product_info?.is_sold_directly ?? false,
        barcode: product.product_info?.barcode ?? "",
        sku: product.product_info?.sku ?? "",
        price_deviation_limit:
          product.product_info?.price_deviation_limit ?? null,
        qty_deviation_limit:
          product.product_info?.qty_deviation_limit ?? null,
        info: product.product_info?.info ?? [],
        location_ids: product.locations?.map((l) => l.location_id) ?? [],
        order_units: product.order_units ?? [],
        ingredient_units: product.ingredient_units ?? [],
      });
      setMode("view");
    } else {
      router.push("/product-management/product");
    }
  };

  const title = isAdd
    ? "Add Product"
    : isEdit
      ? "Edit Product"
      : "Product";

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => router.push("/product-management/product")}
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
                form="product-form"
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
          {isEdit && product && (
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={() => setShowDelete(true)}
              disabled={isPending || deleteProduct.isPending}
            >
              <Trash2 />
              Delete
            </Button>
          )}
        </div>
      </div>

      <form
        id="product-form"
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-4"
      >
        <Tabs defaultValue="general">
          <TabsList variant="line">
            <TabsTrigger value="general" className="text-xs">
              General
            </TabsTrigger>
            <TabsTrigger value="product-info" className="text-xs">
              Product Info
            </TabsTrigger>
            <TabsTrigger value="locations" className="text-xs">
              Locations
            </TabsTrigger>
            <TabsTrigger value="order-units" className="text-xs">
              Order Units
            </TabsTrigger>
            <TabsTrigger value="ingredient-units" className="text-xs">
              Ingredient Units
            </TabsTrigger>
          </TabsList>

          {/* Tab 1: General */}
          <TabsContent value="general">
            <FieldGroup className="max-w-2xl gap-3 pt-4">
              <Field data-invalid={!!form.formState.errors.code}>
                <FieldLabel htmlFor="product-code" className="text-xs">
                  Code
                </FieldLabel>
                <Input
                  id="product-code"
                  placeholder="e.g. ESP-250G"
                  className="h-8 text-sm"
                  disabled={isDisabled}
                  {...form.register("code")}
                />
                <FieldError>
                  {form.formState.errors.code?.message}
                </FieldError>
              </Field>

              <Field data-invalid={!!form.formState.errors.name}>
                <FieldLabel htmlFor="product-name" className="text-xs">
                  Name
                </FieldLabel>
                <Input
                  id="product-name"
                  placeholder="e.g. Coffee Beans"
                  className="h-8 text-sm"
                  disabled={isDisabled}
                  {...form.register("name")}
                />
                <FieldError>
                  {form.formState.errors.name?.message}
                </FieldError>
              </Field>

              <Field>
                <FieldLabel htmlFor="product-local-name" className="text-xs">
                  Local Name
                </FieldLabel>
                <Input
                  id="product-local-name"
                  placeholder="e.g. เมล็ดกาแฟ"
                  className="h-8 text-sm"
                  disabled={isDisabled}
                  {...form.register("local_name")}
                />
              </Field>

              <Field>
                <FieldLabel
                  htmlFor="product-description"
                  className="text-xs"
                >
                  Description
                </FieldLabel>
                <Textarea
                  id="product-description"
                  placeholder="Optional"
                  className="text-sm"
                  disabled={isDisabled}
                  {...form.register("description")}
                />
              </Field>

              <Field
                data-invalid={!!form.formState.errors.inventory_unit_id}
              >
                <FieldLabel className="text-xs">Inventory Unit</FieldLabel>
                <Controller
                  control={form.control}
                  name="inventory_unit_id"
                  render={({ field }) => (
                    <LookupUnit
                      value={field.value}
                      onValueChange={field.onChange}
                      disabled={isDisabled}
                    />
                  )}
                />
                <FieldError>
                  {form.formState.errors.inventory_unit_id?.message}
                </FieldError>
              </Field>

              <Field>
                <FieldLabel className="text-xs">Status</FieldLabel>
                <Controller
                  control={form.control}
                  name="product_status_type"
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
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </Field>

              <Field>
                <FieldLabel className="text-xs">Tax Profile</FieldLabel>
                <Controller
                  control={form.control}
                  name="tax_profile_id"
                  render={({ field }) => (
                    <Select
                      value={field.value || "none"}
                      onValueChange={(v) =>
                        field.onChange(v === "none" ? "" : v)
                      }
                      disabled={isDisabled}
                    >
                      <SelectTrigger className="h-8 w-full text-sm">
                        <SelectValue placeholder="Select tax profile" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        {taxProfiles.map((tp) => (
                          <SelectItem key={tp.id} value={tp.id}>
                            {tp.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </Field>
            </FieldGroup>
          </TabsContent>

          {/* Tab 2: Product Info */}
          <TabsContent value="product-info">
            <FieldGroup className="max-w-2xl gap-3 pt-4">
              <Field orientation="horizontal">
                <Controller
                  control={form.control}
                  name="is_used_in_recipe"
                  render={({ field }) => (
                    <Checkbox
                      id="product-is-used-in-recipe"
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={isDisabled}
                    />
                  )}
                />
                <FieldLabel
                  htmlFor="product-is-used-in-recipe"
                  className="text-xs"
                >
                  Used in Recipe
                </FieldLabel>
              </Field>

              <Field orientation="horizontal">
                <Controller
                  control={form.control}
                  name="is_sold_directly"
                  render={({ field }) => (
                    <Checkbox
                      id="product-is-sold-directly"
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={isDisabled}
                    />
                  )}
                />
                <FieldLabel
                  htmlFor="product-is-sold-directly"
                  className="text-xs"
                >
                  Sold Directly
                </FieldLabel>
              </Field>

              <Field>
                <FieldLabel htmlFor="product-barcode" className="text-xs">
                  Barcode
                </FieldLabel>
                <Input
                  id="product-barcode"
                  placeholder="e.g. 8851234567890"
                  className="h-8 text-sm"
                  disabled={isDisabled}
                  {...form.register("barcode")}
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="product-sku" className="text-xs">
                  SKU
                </FieldLabel>
                <Input
                  id="product-sku"
                  placeholder="e.g. ESP-250G-TH"
                  className="h-8 text-sm"
                  disabled={isDisabled}
                  {...form.register("sku")}
                />
              </Field>

              <div className="grid grid-cols-2 gap-3">
                <Field>
                  <FieldLabel className="text-xs">
                    Price Deviation Limit
                  </FieldLabel>
                  <Input
                    type="number"
                    step="any"
                    placeholder="0"
                    className="h-8 text-sm"
                    disabled={isDisabled}
                    {...form.register("price_deviation_limit")}
                  />
                </Field>

                <Field>
                  <FieldLabel className="text-xs">
                    Qty Deviation Limit
                  </FieldLabel>
                  <Input
                    type="number"
                    step="any"
                    placeholder="0"
                    className="h-8 text-sm"
                    disabled={isDisabled}
                    {...form.register("qty_deviation_limit")}
                  />
                </Field>
              </div>

              {/* Dynamic Info Array */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium">
                    Additional Info
                  </span>
                  {!isDisabled && (
                    <Button
                      type="button"
                      variant="outline"
                      size="xs"
                      onClick={() =>
                        appendInfo({
                          label: "",
                          value: "",
                          data_type: "string",
                        })
                      }
                    >
                      <Plus />
                      Add
                    </Button>
                  )}
                </div>
                {infoFields.length === 0 ? (
                  <p className="text-xs text-muted-foreground">
                    No additional info
                  </p>
                ) : (
                  <div className="space-y-2">
                    {infoFields.map((field, index) => (
                      <div
                        key={field.id}
                        className="flex items-start gap-2"
                      >
                        <Input
                          placeholder="Label"
                          className="h-8 text-sm flex-1"
                          disabled={isDisabled}
                          {...form.register(`info.${index}.label`)}
                        />
                        <Input
                          placeholder="Value"
                          className="h-8 text-sm flex-1"
                          disabled={isDisabled}
                          {...form.register(`info.${index}.value`)}
                        />
                        <Controller
                          control={form.control}
                          name={`info.${index}.data_type`}
                          render={({ field: dtField }) => (
                            <Select
                              value={dtField.value}
                              onValueChange={dtField.onChange}
                              disabled={isDisabled}
                            >
                              <SelectTrigger className="h-8 w-28 text-sm">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="string">
                                  String
                                </SelectItem>
                                <SelectItem value="number">
                                  Number
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          )}
                        />
                        {!isDisabled && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon-xs"
                            onClick={() => removeInfo(index)}
                          >
                            <X />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </FieldGroup>
          </TabsContent>

          {/* Tab 3: Locations */}
          <TabsContent value="locations">
            <div className="max-w-2xl space-y-3 pt-4">
              {!isDisabled && (
                <Select
                  onValueChange={(locationId) => {
                    const current = form.getValues("location_ids");
                    if (!current.includes(locationId)) {
                      form.setValue("location_ids", [
                        ...current,
                        locationId,
                      ]);
                    }
                  }}
                >
                  <SelectTrigger className="h-8 w-full text-sm">
                    <SelectValue placeholder="Add location..." />
                  </SelectTrigger>
                  <SelectContent>
                    {availableLocations.map((loc) => (
                      <SelectItem key={loc.id} value={loc.id}>
                        {loc.code} — {loc.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}

              {watchedLocationIds.length === 0 ? (
                <p className="text-xs text-muted-foreground">
                  No locations assigned
                </p>
              ) : (
                <div className="rounded-md border">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b bg-muted/50">
                        <th className="px-3 py-1.5 text-left font-medium">
                          Code
                        </th>
                        <th className="px-3 py-1.5 text-left font-medium">
                          Name
                        </th>
                        {!isDisabled && (
                          <th className="px-3 py-1.5 w-10" />
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {watchedLocationIds.map((locId) => {
                        const loc = allLocations.find(
                          (l) => l.id === locId,
                        );
                        return (
                          <tr
                            key={locId}
                            className="border-b last:border-0"
                          >
                            <td className="px-3 py-1.5 font-medium">
                              {loc?.code ?? locId}
                            </td>
                            <td className="px-3 py-1.5">
                              {loc?.name ?? "—"}
                            </td>
                            {!isDisabled && (
                              <td className="px-3 py-1.5">
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon-xs"
                                  onClick={() => {
                                    form.setValue(
                                      "location_ids",
                                      watchedLocationIds.filter(
                                        (id) => id !== locId,
                                      ),
                                    );
                                  }}
                                >
                                  <X />
                                </Button>
                              </td>
                            )}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </TabsContent>

          {/* Tab 4: Order Units */}
          <TabsContent value="order-units">
            <div className="space-y-3 pt-4">
              {!isDisabled && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    appendOrderUnit({
                      from_unit_id: "",
                      from_unit_qty: 1,
                      to_unit_id: "",
                      to_unit_qty: 1,
                      description: "",
                      is_default: false,
                      is_active: true,
                    })
                  }
                >
                  <Plus />
                  Add Order Unit
                </Button>
              )}

              {orderUnitFields.length === 0 ? (
                <p className="text-xs text-muted-foreground">
                  No order units defined
                </p>
              ) : (
                <div className="space-y-3">
                  {orderUnitFields.map((field, index) => (
                    <UnitConversionRow
                      key={field.id}
                      form={form}
                      prefix={`order_units.${index}`}
                      isDisabled={isDisabled}
                      onRemove={() => removeOrderUnit(index)}
                    />
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          {/* Tab 5: Ingredient Units */}
          <TabsContent value="ingredient-units">
            <div className="space-y-3 pt-4">
              {!isDisabled && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    appendIngredientUnit({
                      from_unit_id: "",
                      from_unit_qty: 1,
                      to_unit_id: "",
                      to_unit_qty: 1,
                      description: "",
                      is_default: false,
                      is_active: true,
                    })
                  }
                >
                  <Plus />
                  Add Ingredient Unit
                </Button>
              )}

              {ingredientUnitFields.length === 0 ? (
                <p className="text-xs text-muted-foreground">
                  No ingredient units defined
                </p>
              ) : (
                <div className="space-y-3">
                  {ingredientUnitFields.map((field, index) => (
                    <UnitConversionRow
                      key={field.id}
                      form={form}
                      prefix={`ingredient_units.${index}`}
                      isDisabled={isDisabled}
                      onRemove={() => removeIngredientUnit(index)}
                    />
                  ))}
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </form>

      {product && (
        <DeleteDialog
          open={showDelete}
          onOpenChange={(open) =>
            !open && !deleteProduct.isPending && setShowDelete(false)
          }
          title="Delete Product"
          description={`Are you sure you want to delete product "${product.name}"? This action cannot be undone.`}
          isPending={deleteProduct.isPending}
          onConfirm={() => {
            deleteProduct.mutate(product.id, {
              onSuccess: () => {
                toast.success("Product deleted successfully");
                router.push("/product-management/product");
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
/* Shared Unit Conversion Row                                         */
/* ------------------------------------------------------------------ */

interface UnitConversionRowProps {
  form: ReturnType<typeof useForm<ProductFormValues>>;
  prefix: string;
  isDisabled: boolean;
  onRemove: () => void;
}

function UnitConversionRow({
  form,
  prefix,
  isDisabled,
  onRemove,
}: UnitConversionRowProps) {
  return (
    <div className="rounded-md border p-3 space-y-2">
      <div className="grid grid-cols-2 gap-2">
        <Field>
          <FieldLabel className="text-xs">From Unit</FieldLabel>
          <Controller
            control={form.control}
            name={`${prefix}.from_unit_id` as never}
            render={({ field }) => (
              <LookupUnit
                value={field.value as string}
                onValueChange={field.onChange}
                disabled={isDisabled}
              />
            )}
          />
        </Field>

        <Field>
          <FieldLabel className="text-xs">From Qty</FieldLabel>
          <Input
            type="number"
            step="any"
            className="h-8 text-sm"
            disabled={isDisabled}
            {...form.register(`${prefix}.from_unit_qty` as never)}
          />
        </Field>

        <Field>
          <FieldLabel className="text-xs">To Unit</FieldLabel>
          <Controller
            control={form.control}
            name={`${prefix}.to_unit_id` as never}
            render={({ field }) => (
              <LookupUnit
                value={field.value as string}
                onValueChange={field.onChange}
                disabled={isDisabled}
              />
            )}
          />
        </Field>

        <Field>
          <FieldLabel className="text-xs">To Qty</FieldLabel>
          <Input
            type="number"
            step="any"
            className="h-8 text-sm"
            disabled={isDisabled}
            {...form.register(`${prefix}.to_unit_qty` as never)}
          />
        </Field>
      </div>

      <Field>
        <FieldLabel className="text-xs">Description</FieldLabel>
        <Input
          placeholder="e.g. 1 bag = 250 grams"
          className="h-8 text-sm"
          disabled={isDisabled}
          {...form.register(`${prefix}.description` as never)}
        />
      </Field>

      <div className="flex items-center gap-4">
        <Field orientation="horizontal">
          <Controller
            control={form.control}
            name={`${prefix}.is_default` as never}
            render={({ field }) => (
              <Checkbox
                checked={field.value as boolean}
                onCheckedChange={field.onChange}
                disabled={isDisabled}
              />
            )}
          />
          <FieldLabel className="text-xs">Default</FieldLabel>
        </Field>

        <Field orientation="horizontal">
          <Controller
            control={form.control}
            name={`${prefix}.is_active` as never}
            render={({ field }) => (
              <Checkbox
                checked={field.value as boolean}
                onCheckedChange={field.onChange}
                disabled={isDisabled}
              />
            )}
          />
          <FieldLabel className="text-xs">Active</FieldLabel>
        </Field>

        {!isDisabled && (
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            className="ml-auto"
            onClick={onRemove}
          >
            <X />
          </Button>
        )}
      </div>
    </div>
  );
}
