import { useState, useEffect, useMemo } from "react";
import {
  Controller,
  useWatch,
  type UseFormReturn,
  type FieldArrayWithId,
} from "react-hook-form";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { LookupVendor } from "@/components/lookup/lookup-vendor";
import { LookupTaxProfile } from "@/components/lookup/lookup-tax-profile";
import type { PrFormValues } from "./pr-form-schema";
import { PrPricelistDialog, type PricelistEntry } from "./pr-pricelist-dialog";

/** Round to 2 decimal places using exponential shift to avoid floating-point errors (e.g. 1.005 → 1.01) */
const round2 = (n: number): number =>
  Number(Math.round(parseFloat(n + "e2")) + "e-2");

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

  // Watch entire item via useWatch — scoped re-render only when this item changes
  // (form.watch re-renders on ANY form field change; useWatch is targeted)
  const i = Math.max(index, 0);
  const watched = useWatch({ control: form.control, name: `items.${i}` });
  const watchPrice = watched?.pricelist_price ?? 0;
  const watchQty = watched?.requested_qty ?? 0;
  const watchTaxRate = watched?.tax_rate ?? 0;
  const watchIsTaxAdj = watched?.is_tax_adjustment ?? false;
  const watchTaxAmt = watched?.tax_amount ?? 0;
  const watchDiscRate = watched?.discount_rate ?? 0;
  const watchIsDiscAdj = watched?.is_discount_adjustment ?? false;
  const watchDiscAmt = watched?.discount_amount ?? 0;

  // Compute derived values (memoized to avoid recalculating on unrelated renders)
  const { discountAmount, netAmount, taxAmount, totalPrice } = useMemo(() => {
    const sub = round2(watchPrice * watchQty);
    const disc = watchIsDiscAdj
      ? watchDiscAmt
      : round2((sub * watchDiscRate) / 100);
    const net = round2(sub - disc);
    const tax = watchIsTaxAdj
      ? watchTaxAmt
      : round2((net * watchTaxRate) / 100);
    const total = round2(net + tax);
    return { discountAmount: disc, netAmount: net, taxAmount: tax, totalPrice: total };
  }, [watchPrice, watchQty, watchDiscRate, watchIsDiscAdj, watchDiscAmt, watchTaxRate, watchIsTaxAdj, watchTaxAmt]);

  // Sync computed values back to form
  useEffect(() => {
    if (index === -1) return;
    if (!watchIsDiscAdj) {
      form.setValue(`items.${index}.discount_amount`, discountAmount);
    }
    if (!watchIsTaxAdj) {
      form.setValue(`items.${index}.tax_amount`, taxAmount);
    }
    form.setValue(`items.${index}.net_amount`, netAmount);
    form.setValue(`items.${index}.total_price`, totalPrice);
  }, [index, discountAmount, taxAmount, netAmount, totalPrice, watchIsDiscAdj, watchIsTaxAdj, form]);

  if (index === -1) return null;

  const pricelistNo = form.getValues(`items.${index}.pricelist_no`);
  const productId = form.getValues(`items.${index}.product_id`) ?? "";
  const productName = form.getValues(`items.${index}.product_name`) ?? "";
  const unitId = form.getValues(`items.${index}.requested_unit_id`) ?? "";
  const currencyId = form.getValues(`items.${index}.currency_id`) ?? "";
  const deliveryDate = form.getValues(`items.${index}.delivery_date`) ?? "";
  const requestedQty = form.getValues(`items.${index}.requested_qty`) ?? 0;
  const requestedUnitName =
    form.getValues(`items.${index}.requested_unit_name`) ?? "";
  const approvedQty = form.getValues(`items.${index}.approved_qty`) ?? 0;
  const approvedUnitName =
    form.getValues(`items.${index}.approved_unit_name`) ?? "";

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
    <div className="px-3 py-1.5 bg-muted/40 border-t border-border space-y-1">
      {/* Row 1: Vendor | Unit Price | Pricelist */}
      <div className="grid grid-cols-12 gap-2 items-end">
        <div className="col-span-5">
          <label className="text-[10px] text-muted-foreground">Vendor</label>
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
        <div className="col-span-2">
          <label className="text-[10px] text-muted-foreground">
            Unit Price
          </label>
          <Input
            type="number"
            min={0}
            step="0.01"
            placeholder="0.00"
            className="h-6 text-[11px] md:text-[11px] text-right"
            disabled={disabled}
            {...form.register(`items.${index}.pricelist_price`, {
              valueAsNumber: true,
            })}
          />
        </div>
        <div className="col-span-3">
          <label className="text-[10px] text-muted-foreground">Pricelist</label>
          <div className="flex items-center gap-0.5">
            <span className="flex-1 h-6 leading-6 text-[11px] text-muted-foreground truncate">
              {pricelistNo || "—"}
            </span>
            {!disabled && productId && unitId && currencyId && (
              <Button
                type="button"
                size="icon-xs"
                className="shrink-0"
                onClick={() => setShowPricelist(true)}
              >
                <Search className="size-3" />
              </Button>
            )}
          </div>
        </div>
        <div className="col-span-2">
          <label className="text-[10px] text-muted-foreground">
            Net Amount
          </label>
          <div className="h-6 leading-6 text-[11px] text-right font-medium tabular-nums">
            {netAmount.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </div>
        </div>
      </div>

      {/* Row 2: Tax Profile | Tax % | Tax Amt [✓] | Disc % | Disc Amt [✓] | Total */}
      <div className="grid grid-cols-12 gap-2 items-end">
        <div className="col-span-3">
          <label className="text-[10px] text-muted-foreground">
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
        <div className="col-span-1">
          <label className="text-[10px] text-muted-foreground">Tax %</label>
          <Input
            type="number"
            min={0}
            step="0.01"
            placeholder="0"
            className="h-6 text-[11px] md:text-[11px] text-right"
            disabled
            {...form.register(`items.${index}.tax_rate`, {
              valueAsNumber: true,
            })}
          />
        </div>
        <div className="col-span-2">
          <div className="flex items-center gap-1">
            <label className="text-[10px] text-muted-foreground">Tax Amt</label>
            <Controller
              control={form.control}
              name={`items.${index}.is_tax_adjustment`}
              render={({ field }) => (
                <Checkbox
                  checked={field.value ?? false}
                  onCheckedChange={field.onChange}
                  disabled={disabled}
                  className="size-3"
                />
              )}
            />
          </div>
          <Input
            type="number"
            min={0}
            step="0.01"
            placeholder="0.00"
            className="h-6 text-[11px] md:text-[11px] text-right"
            disabled={disabled || !watchIsTaxAdj}
            {...form.register(`items.${index}.tax_amount`, {
              valueAsNumber: true,
            })}
          />
        </div>
        <div className="col-span-1">
          <label className="text-[10px] text-muted-foreground">Disc %</label>
          <Input
            type="number"
            min={0}
            step="0.01"
            placeholder="0"
            className="h-6 text-[11px] md:text-[11px] text-right"
            disabled={disabled}
            {...form.register(`items.${index}.discount_rate`, {
              valueAsNumber: true,
            })}
          />
        </div>
        <div className="col-span-2">
          <div className="flex items-center gap-1">
            <label className="text-[10px] text-muted-foreground">
              Disc Amt
            </label>
            <Controller
              control={form.control}
              name={`items.${index}.is_discount_adjustment`}
              render={({ field }) => (
                <Checkbox
                  checked={field.value ?? false}
                  onCheckedChange={field.onChange}
                  disabled={disabled}
                  className="size-3"
                />
              )}
            />
          </div>
          <Input
            type="number"
            min={0}
            step="0.01"
            placeholder="0.00"
            className="h-6 text-[11px] md:text-[11px] text-right"
            disabled={disabled || !watchIsDiscAdj}
            {...form.register(`items.${index}.discount_amount`, {
              valueAsNumber: true,
            })}
          />
        </div>
        <div className="col-span-3">
          <label className="text-[10px] text-muted-foreground">Total</label>
          <div className="h-6 leading-6 text-[11px] text-right font-semibold tabular-nums">
            {totalPrice.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
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
