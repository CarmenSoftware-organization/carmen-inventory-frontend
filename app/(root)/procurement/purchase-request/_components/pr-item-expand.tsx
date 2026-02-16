import { useState } from "react";
import {
  Controller,
  type UseFormReturn,
  type FieldArrayWithId,
} from "react-hook-form";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { LookupVendor } from "@/components/lookup/lookup-vendor";
import { LookupTaxProfile } from "@/components/lookup/lookup-tax-profile";
import type { PrFormValues } from "./pr-form-schema";
import { PrPricelistDialog, type PricelistEntry } from "./pr-pricelist-dialog";

type ItemField = FieldArrayWithId<PrFormValues, "items", "id">;

interface PrItemExpandProps {
  item: ItemField;
  form: UseFormReturn<PrFormValues>;
  disabled: boolean;
  itemFields: ItemField[];
}

export function PrItemExpand({
  item,
  form,
  disabled,
  itemFields,
}: PrItemExpandProps) {
  const index = itemFields.findIndex((f) => f.id === item.id);
  const [showPricelist, setShowPricelist] = useState(false);

  if (index === -1) return null;

  const pricelistNo = form.getValues(`items.${index}.pricelist_no`);
  const productId = form.getValues(`items.${index}.product_id`) ?? "";
  const productName = form.getValues(`items.${index}.product_name`) ?? "";
  const unitId = form.getValues(`items.${index}.requested_unit_id`) ?? "";
  const currencyId = form.getValues(`items.${index}.currency_id`) ?? "";
  const deliveryDate = form.getValues(`items.${index}.delivery_date`) ?? "";
  const requestedQty = form.getValues(`items.${index}.requested_qty`) ?? 0;
  const requestedUnitName = form.getValues(`items.${index}.requested_unit_name`) ?? "";
  const approvedQty = form.getValues(`items.${index}.approved_qty`) ?? 0;
  const approvedUnitName = form.getValues(`items.${index}.approved_unit_name`) ?? "";

  const handlePricelistSelect = (entry: PricelistEntry) => {
    form.setValue(`items.${index}.vendor_id`, entry.vendor_id);
    form.setValue(`items.${index}.vendor_name`, entry.vendor_name);
    form.setValue(`items.${index}.pricelist_price`, entry.price);
    form.setValue(
      `items.${index}.pricelist_detail_id`,
      entry.pricelist_detail_id,
    );
    form.setValue(`items.${index}.pricelist_no`, entry.pricelist_no);
  };

  return (
    <div className="px-2 py-3 space-y-2 bg-muted">
      {/* Row 1: Vendor + Unit Price + Description */}
      <div className="grid grid-cols-3 gap-3">
        <div className="space-y-1">
          <label className="text-[11px] font-medium text-muted-foreground">
            Vendor
          </label>
          <Controller
            control={form.control}
            name={`items.${index}.vendor_id`}
            render={({ field }) => (
              <LookupVendor
                value={field.value ?? ""}
                onValueChange={field.onChange}
                disabled={disabled}
                size="xs"
                className="w-full text-[11px]"
              />
            )}
          />
        </div>
        <div className="space-y-1">
          <label className="text-[11px] font-medium text-muted-foreground">
            Unit Price
          </label>
          <Input
            type="number"
            min={0}
            step="0.01"
            placeholder="0.00"
            className="h-6 text-[11px] text-right"
            disabled={disabled}
            {...form.register(`items.${index}.pricelist_price`, {
              valueAsNumber: true,
            })}
          />
        </div>
        <div className="space-y-1">
          <label className="text-[11px] font-medium text-muted-foreground">
            Description
          </label>
          <Input
            placeholder="Item description"
            className="h-6 text-[11px]"
            disabled={disabled}
            {...form.register(`items.${index}.description`)}
          />
        </div>
      </div>

      {/* Row 2: Tax Profile + Tax Rate + Tax Amount */}
      <div className="grid grid-cols-3 gap-3">
        <div className="space-y-1">
          <label className="text-[11px] font-medium text-muted-foreground">
            Tax Profile
          </label>
          <Controller
            control={form.control}
            name={`items.${index}.tax_profile_id`}
            render={({ field }) => (
              <LookupTaxProfile
                value={field.value ?? ""}
                onValueChange={(value, taxRate) => {
                  field.onChange(value || null);
                  form.setValue(`items.${index}.tax_rate`, taxRate);
                }}
                disabled={disabled}
                className="w-full text-[11px]"
                size="xs"
              />
            )}
          />
        </div>
        <div className="space-y-1">
          <label className="text-[11px] font-medium text-muted-foreground">
            Tax Rate (%)
          </label>
          <Input
            type="number"
            min={0}
            step="0.01"
            placeholder="0"
            className="h-6 text-[11px] text-right"
            disabled={disabled}
            {...form.register(`items.${index}.tax_rate`, {
              valueAsNumber: true,
            })}
          />
        </div>
        <div className="space-y-1">
          <label className="text-[11px] font-medium text-muted-foreground">
            Tax Amount
          </label>
          <Input
            type="number"
            min={0}
            step="0.01"
            placeholder="0.00"
            className="h-6 text-[11px] text-right"
            disabled={disabled}
            {...form.register(`items.${index}.tax_amount`, {
              valueAsNumber: true,
            })}
          />
        </div>
      </div>

      {/* Row 3: Discount Rate + Discount Amount + Pricelist */}
      <div className="grid grid-cols-3 gap-3">
        <div className="space-y-1">
          <label className="text-[11px] font-medium text-muted-foreground">
            Discount Rate (%)
          </label>
          <Input
            type="number"
            min={0}
            step="0.01"
            placeholder="0"
            className="h-6 text-[11px] text-right"
            disabled={disabled}
            {...form.register(`items.${index}.discount_rate`, {
              valueAsNumber: true,
            })}
          />
        </div>
        <div className="space-y-1">
          <label className="text-[11px] font-medium text-muted-foreground">
            Discount Amount
          </label>
          <Input
            type="number"
            min={0}
            step="0.01"
            placeholder="0.00"
            className="h-6 text-[11px] text-right"
            disabled={disabled}
            {...form.register(`items.${index}.discount_amount`, {
              valueAsNumber: true,
            })}
          />
        </div>
        <div className="space-y-1">
          <label className="text-[11px] font-medium text-muted-foreground">
            Pricelist
          </label>
          <div className="flex items-center gap-1">
            <span className="flex-1 h-6 leading-6 text-[11px] text-muted-foreground truncate">
              {pricelistNo || "—"}
            </span>
            {!disabled && productId && unitId && currencyId && (
              <Button
                type="button"
                variant="ghost"
                size="icon-xs"
                onClick={() => setShowPricelist(true)}
              >
                <Search className="size-3" />
              </Button>
            )}
          </div>
        </div>
      </div>

      <PrPricelistDialog
        open={showPricelist}
        onOpenChange={setShowPricelist}
        productId={productId}
        productName={productName}
        unitId={unitId}
        currencyId={currencyId}
        atDate={deliveryDate}
        requestedQty={requestedQty}
        requestedUnitName={requestedUnitName}
        approvedQty={approvedQty}
        approvedUnitName={approvedUnitName}
        onSelect={handlePricelistSelect}
      />
    </div>
  );
}
