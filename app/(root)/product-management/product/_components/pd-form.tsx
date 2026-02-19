"use client";

import { useState } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter, useSearchParams } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
  useCreateProduct,
  useUpdateProduct,
  useDeleteProduct,
  type CreateProductDto,
} from "@/hooks/use-product";
import {
  type ProductDetail,
  type ProductFormValues,
  type ProductUnitConversion,
  productSchema,
} from "@/types/product";
import type { FormMode } from "@/types/form";
import { DeleteDialog } from "@/components/ui/delete-dialog";
import FormToolbar from "./pd-form-toolbar";
import GeneralTab from "./pd-general-tab";
import ProductInfoTab from "./pd-info-tab";
import LocationsTab from "./pd-location-tab";
import UnitConversionTab from "./pd-unit-conversion-tab";

const getDefaultValues = (product?: ProductDetail): ProductFormValues => {
  if (!product) {
    return {
      name: "",
      code: "",
      local_name: "",
      description: "",
      inventory_unit_id: "",
      product_item_group_id: "",
      product_status_type: "active",
      tax_profile_id: "",
      is_used_in_recipe: false,
      is_sold_directly: false,
      barcode: "",
      sku: "",
      price: null,
      price_deviation_limit: null,
      qty_deviation_limit: null,
      info: [],
      locations: [],
      order_units: [],
      ingredient_units: [],
    };
  }

  return {
    name: product.name,
    code: product.code,
    local_name: product.local_name ?? "",
    description: product.description ?? "",
    inventory_unit_id: product.inventory_unit.id ?? "",
    product_item_group_id: product.product_item_group?.id ?? "",
    product_status_type: product.product_status_type,
    tax_profile_id: product.tax_profile_id ?? "",
    is_used_in_recipe: product.product_info?.is_used_in_recipe ?? false,
    is_sold_directly: product.product_info?.is_sold_directly ?? false,
    barcode: product.product_info?.barcode ?? "",
    sku: product.product_info?.sku ?? "",
    price: product.product_info?.price ?? null,
    price_deviation_limit: product.product_info?.price_deviation_limit ?? null,
    qty_deviation_limit: product.product_info?.qty_deviation_limit ?? null,
    info: product.product_info?.info ?? [],
    locations: product.locations ?? [],
    order_units: product.order_units ?? [],
    ingredient_units: product.ingredient_units ?? [],
  };
};

const diffUnits = (
  original: ProductUnitConversion[],
  current: ProductUnitConversion[],
) => {
  const origIds = new Set(original.map((u) => u.id).filter(Boolean));
  const currIds = new Set(current.map((u) => u.id).filter(Boolean));

  const stripId = ({ ...rest }: ProductUnitConversion) => rest;

  const add = current.filter((u) => !u.id).map(stripId);

  const update = current
    .filter((u) => u.id && origIds.has(u.id))
    .map((u) => ({ ...stripId(u), id: u.id! }));

  const remove = original
    .filter((u) => u.id && !currIds.has(u.id))
    .map((u) => ({ id: u.id! }));

  return { add, update, remove };
};

const buildPayload = (
  values: ProductFormValues,
  product?: ProductDetail,
): CreateProductDto => {
  const origLocIds = new Set(
    (product?.locations ?? []).map((l) => l.location_id),
  );
  const currLocIds = new Set(values.locations.map((l) => l.location_id));

  const locationsAdd = values.locations
    .filter((l) => !origLocIds.has(l.location_id))
    .map((l) => ({ location_id: l.location_id }));
  const locationsRemove = (product?.locations ?? [])
    .filter((l) => !currLocIds.has(l.location_id))
    .map((l) => ({ location_id: l.location_id }));

  const orderDiff = diffUnits(product?.order_units ?? [], values.order_units);
  const ingredientDiff = diffUnits(
    product?.ingredient_units ?? [],
    values.ingredient_units,
  );

  return {
    name: values.name,
    code: values.code,
    local_name: values.local_name,
    description: values.description ?? "",
    inventory_unit_id: values.inventory_unit_id,
    product_item_group_id: values.product_item_group_id,
    product_status_type: values.product_status_type,
    tax_profile_id: values.tax_profile_id || "",
    product_info: {
      is_used_in_recipe: values.is_used_in_recipe,
      is_sold_directly: values.is_sold_directly,
      barcode: values.barcode,
      sku: values.sku,
      price: values.price,
      price_deviation_limit: values.price_deviation_limit,
      qty_deviation_limit: values.qty_deviation_limit,
      info: values.info,
    },
    locations: {
      ...(locationsAdd.length > 0 && { add: locationsAdd }),
      ...(locationsRemove.length > 0 && { remove: locationsRemove }),
    },
    order_units: {
      ...(orderDiff.add.length > 0 && { add: orderDiff.add }),
      ...(orderDiff.update.length > 0 && { update: orderDiff.update }),
      ...(orderDiff.remove.length > 0 && { remove: orderDiff.remove }),
    },
    ingredient_units: {
      ...(ingredientDiff.add.length > 0 && { add: ingredientDiff.add }),
      ...(ingredientDiff.update.length > 0 && {
        update: ingredientDiff.update,
      }),
      ...(ingredientDiff.remove.length > 0 && {
        remove: ingredientDiff.remove,
      }),
    },
  };
};

interface ProductFormProps {
  readonly product?: ProductDetail;
}

export function ProductForm({ product }: ProductFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnUrl =
    searchParams.get("returnUrl") || "/product-management/product";

  const [mode, setMode] = useState<FormMode>(product ? "view" : "add");
  const isEdit = mode === "edit";
  const isAdd = mode === "add";

  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const deleteProduct = useDeleteProduct();
  const [showDelete, setShowDelete] = useState(false);
  const isPending = createProduct.isPending || updateProduct.isPending;
  const isDisabled = mode === "view" || isPending;

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema) as Resolver<ProductFormValues>,
    defaultValues: getDefaultValues(product),
  });

  const onSubmit = (values: ProductFormValues) => {
    // Auto-add default order unit if none exist
    if (values.order_units.length === 0 && values.inventory_unit_id) {
      values.order_units = [
        {
          from_unit_id: values.inventory_unit_id,
          from_unit_qty: 1,
          to_unit_id: values.inventory_unit_id,
          to_unit_qty: 1,
          description: "",
          is_default: true,
          is_active: true,
        },
      ];
    }

    const payload = buildPayload(values, product);

    if (isEdit && product) {
      updateProduct.mutate(
        { id: product.id, ...payload },
        {
          onSuccess: () => {
            toast.success("Product updated successfully");
            form.reset(values);
            setMode("view");
          },
          onError: (err: Error) => toast.error(err.message),
        },
      );
    } else if (isAdd) {
      createProduct.mutate(payload, {
        onSuccess: (res) => {
          toast.success("Product created successfully");
          const newId = (res as { data?: { id?: string } })?.data?.id;
          if (newId) {
            router.push(`/product-management/product/${newId}`);
          } else {
            router.push(returnUrl);
          }
        },
        onError: (err: Error) => toast.error(err.message),
      });
    }
  };

  const onInvalid = () => {
    toast.error("Please fill in all required fields");
  };

  const handleCancel = () => {
    if (isEdit && product) {
      form.reset(getDefaultValues(product));
      setMode("view");
    } else {
      router.push(returnUrl);
    }
  };

  return (
    <div className="space-y-4">
      <FormToolbar
        product={product}
        mode={mode}
        isPending={isPending}
        deleteIsPending={deleteProduct.isPending}
        onBack={() => router.push(returnUrl)}
        onEdit={() => setMode("edit")}
        onCancel={handleCancel}
        onDelete={() => setShowDelete(true)}
      />

      <form
        id="product-form"
        onSubmit={form.handleSubmit(onSubmit, onInvalid)}
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
          <TabsContent value="general">
            <GeneralTab form={form} isDisabled={isDisabled} product={product} />
          </TabsContent>
          <TabsContent value="product-info">
            <ProductInfoTab form={form} isDisabled={isDisabled} />
          </TabsContent>
          <TabsContent value="locations">
            <LocationsTab form={form} isDisabled={isDisabled} />
          </TabsContent>
          <TabsContent value="order-units">
            <UnitConversionTab
              form={form}
              name="order_units"
              label="Order Unit"
              isDisabled={isDisabled}
            />
          </TabsContent>
          <TabsContent value="ingredient-units">
            <UnitConversionTab
              form={form}
              name="ingredient_units"
              label="Ingredient Unit"
              isDisabled={isDisabled}
            />
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
                router.push(returnUrl);
              },
              onError: (err) => toast.error(err.message),
            });
          }}
        />
      )}
    </div>
  );
}
