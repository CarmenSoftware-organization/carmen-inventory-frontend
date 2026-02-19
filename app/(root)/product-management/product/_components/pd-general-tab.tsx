import { useMemo, useState } from "react";
import type { ProductFormInstance, ProductDetail } from "@/types/product";
import type { ItemGroupDto } from "@/types/category";
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldError,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Controller, useWatch } from "react-hook-form";
import { LookupUnit } from "@/components/lookup/lookup-unit";
import { LookupItemGroup } from "@/components/lookup/lookup-item-group";
import { LookupTaxProfile } from "@/components/lookup/lookup-tax-profile";
import { useUnit } from "@/hooks/use-unit";

interface GeneralTabProps {
  form: ProductFormInstance;
  isDisabled: boolean;
  product?: ProductDetail;
}

export default function GeneralTab({
  form,
  isDisabled,
  product,
}: GeneralTabProps) {
  /* ---- Watchers ---- */
  const watchedOrderUnits = useWatch({
    control: form.control,
    name: "order_units",
  });

  /* ---- Sub Category & Category from selected item group ---- */
  const [selectedGroup, setSelectedGroup] = useState<
    ItemGroupDto | undefined
  >();
  const subCategoryName =
    selectedGroup?.sub_category?.name ??
    product?.product_sub_category?.name ??
    "—";
  const categoryName =
    selectedGroup?.category?.name ?? product?.product_category?.name ?? "—";

  /* ---- Resolve default order unit name ---- */
  const { data: unitData } = useUnit({ perpage: -1 });
  const units = useMemo(() => unitData?.data ?? [], [unitData?.data]);
  const defaultOrderUnit = watchedOrderUnits.find((u) => u.is_default);
  const defaultOrderUnitName = defaultOrderUnit
    ? (units.find((u) => u.id === defaultOrderUnit.from_unit_id)?.name ?? "—")
    : "No order unit set";

  /* ---- Item Group auto-fill ---- */
  const handleItemGroupChange = (id: string, item?: ItemGroupDto) => {
    form.setValue("product_item_group_id", id);
    setSelectedGroup(item);
    if (item) {
      form.setValue(
        "price_deviation_limit",
        item.price_deviation_limit ?? null,
      );
      form.setValue("qty_deviation_limit", item.qty_deviation_limit ?? null);
      form.setValue("is_used_in_recipe", item.is_used_in_recipe ?? false);
      form.setValue("is_sold_directly", item.is_sold_directly ?? false);
      if (item.tax_profile_id) {
        form.setValue("tax_profile_id", item.tax_profile_id);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* ── Product Identification ── */}
      <section className="space-y-3">
        <h2 className="text-sm font-semibold">Product Identification</h2>
        <FieldGroup className="gap-3">
          <Field data-invalid={!!form.formState.errors.code}>
            <FieldLabel htmlFor="product-code" className="text-xs" required>
              Code
            </FieldLabel>
            <Input
              id="product-code"
              placeholder="e.g. ESP-250G"
              className="h-8 text-sm"
              disabled={isDisabled}
              {...form.register("code")}
            />
            <FieldError>{form.formState.errors.code?.message}</FieldError>
          </Field>

          <Field data-invalid={!!form.formState.errors.name}>
            <FieldLabel htmlFor="product-name" className="text-xs" required>
              Name
            </FieldLabel>
            <Input
              id="product-name"
              placeholder="e.g. Coffee Beans"
              className="h-8 text-sm"
              disabled={isDisabled}
              {...form.register("name")}
            />
            <FieldError>{form.formState.errors.name?.message}</FieldError>
          </Field>

          <Field data-invalid={!!form.formState.errors.local_name}>
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
            <FieldError>{form.formState.errors.local_name?.message}</FieldError>
          </Field>

          <Field>
            <FieldLabel htmlFor="product-description" className="text-xs">
              Description
            </FieldLabel>
            <Textarea
              id="product-description"
              placeholder="Optional"
              className="text-sm"
              rows={2}
              disabled={isDisabled}
              {...form.register("description")}
            />
          </Field>
        </FieldGroup>
      </section>

      {/* ── Classification ── */}
      <section className="space-y-3">
        <h2 className="text-sm font-semibold">Classification</h2>
        <FieldGroup className="gap-3">
          <div className="grid grid-cols-3 gap-3">
            <Field data-invalid={!!form.formState.errors.product_item_group_id}>
              <FieldLabel className="text-xs" required>
                Item Group
              </FieldLabel>
              <Controller
                control={form.control}
                name="product_item_group_id"
                render={({ field }) => (
                  <LookupItemGroup
                    value={field.value}
                    onValueChange={handleItemGroupChange}
                    disabled={isDisabled}
                  />
                )}
              />
              <FieldError>
                {form.formState.errors.product_item_group_id?.message}
              </FieldError>
            </Field>

            <Field>
              <FieldLabel className="text-xs">Sub Category</FieldLabel>
              <Input
                className="h-8 text-sm bg-muted"
                disabled
                value={subCategoryName}
                readOnly
              />
            </Field>

            <Field>
              <FieldLabel className="text-xs">Category</FieldLabel>
              <Input
                className="h-8 text-sm bg-muted"
                disabled
                value={categoryName}
                readOnly
              />
            </Field>
          </div>
        </FieldGroup>
      </section>

      {/* ── Unit & Tax ── */}
      <section className="space-y-3">
        <h2 className="text-sm font-semibold">Unit & Tax</h2>
        <FieldGroup className="gap-3">
          <div className="grid grid-cols-3 gap-3">
            <Field data-invalid={!!form.formState.errors.inventory_unit_id}>
              <FieldLabel className="text-xs" required>
                Inventory Unit
              </FieldLabel>
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
              <FieldLabel className="text-xs" required>
                Tax Profile
              </FieldLabel>
              <Controller
                control={form.control}
                name="tax_profile_id"
                render={({ field }) => (
                  <LookupTaxProfile
                    value={field.value}
                    onValueChange={(v) => field.onChange(v)}
                    disabled={isDisabled}
                  />
                )}
              />
            </Field>

            <Field>
              <FieldLabel className="text-xs">Default Order Unit</FieldLabel>
              <Input
                className="h-8 text-sm bg-muted"
                disabled
                value={defaultOrderUnitName}
                readOnly
              />
            </Field>
          </div>
        </FieldGroup>
      </section>
    </div>
  );
}
