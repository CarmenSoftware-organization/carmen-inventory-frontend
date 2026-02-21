import { useState, useEffect, useMemo } from "react";
import {
  Controller,
  useWatch,
  type UseFormReturn,
  type FieldArrayWithId,
} from "react-hook-form";
import dynamic from "next/dynamic";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { LookupVendor } from "@/components/lookup/lookup-vendor";
import { LookupTaxProfile } from "@/components/lookup/lookup-tax-profile";
import type { PrFormValues } from "./pr-form-schema";
import type { PricelistEntry } from "./pr-pricelist-dialog";
import InventoryRow from "./inventory-row";

const PrPricelistDialog = dynamic(() =>
  import("./pr-pricelist-dialog").then((mod) => mod.PrPricelistDialog),
);

const round2 = (n: number): number =>
  Number(Math.round(Number.parseFloat(n + "e2")) + "e-2");

type ItemField = FieldArrayWithId<PrFormValues, "items", "id">;

interface PrItemExpandProps {
  item: ItemField;
  form: UseFormReturn<PrFormValues>;
  disabled: boolean;
  itemFields: ItemField[];
  buCode?: string;
}

export function PrItemExpand({
  item,
  form,
  disabled,
  itemFields,
  buCode,
}: PrItemExpandProps) {
  const index = itemFields.findIndex((f) => f.id === item.id);
  const [showPricelist, setShowPricelist] = useState(false);

  const i = Math.max(index, 0);

  const [
    watchPrice,
    watchQty,
    watchTaxRate,
    watchIsTaxAdj,
    watchTaxAmt,
    watchDiscRate,
    watchIsDiscAdj,
    watchDiscAmt,
  ] = useWatch({
    control: form.control,
    name: [
      `items.${i}.pricelist_price`,
      `items.${i}.requested_qty`,
      `items.${i}.tax_rate`,
      `items.${i}.is_tax_adjustment`,
      `items.${i}.tax_amount`,
      `items.${i}.discount_rate`,
      `items.${i}.is_discount_adjustment`,
      `items.${i}.discount_amount`,
    ] as const,
  });

  const price = watchPrice ?? 0;
  const qty = watchQty ?? 0;
  const taxRate = watchTaxRate ?? 0;
  const isTaxAdj = watchIsTaxAdj ?? false;
  const taxAmt = watchTaxAmt ?? 0;
  const discRate = watchDiscRate ?? 0;
  const isDiscAdj = watchIsDiscAdj ?? false;
  const discAmt = watchDiscAmt ?? 0;

  const { discountAmount, netAmount, taxAmount, totalPrice } = useMemo(() => {
    const sub = round2(price * qty);
    const disc = isDiscAdj ? discAmt : round2((sub * discRate) / 100);
    const net = round2(sub - disc);
    const tax = isTaxAdj ? taxAmt : round2((net * taxRate) / 100);
    const total = round2(net + tax);
    return {
      discountAmount: disc,
      netAmount: net,
      taxAmount: tax,
      totalPrice: total,
    };
  }, [price, qty, discRate, isDiscAdj, discAmt, taxRate, isTaxAdj, taxAmt]);

  // Sync computed values back to form
  useEffect(() => {
    if (index === -1) return;
    if (!isDiscAdj) {
      form.setValue(`items.${index}.discount_amount`, discountAmount);
    }
    if (!isTaxAdj) {
      form.setValue(`items.${index}.tax_amount`, taxAmount);
    }
    form.setValue(`items.${index}.net_amount`, netAmount);
    form.setValue(`items.${index}.total_price`, totalPrice);
  }, [
    index,
    discountAmount,
    taxAmount,
    netAmount,
    totalPrice,
    isDiscAdj,
    isTaxAdj,
    form,
  ]);

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
    <div className="px-3 py-1.5">
      {/* Row 1: Vendor | Unit Price | Pricelist */}
      <div className="grid grid-cols-12 gap-2 items-end">
        <div className="col-span-5">
          <span className="text-xs text-muted-foreground">Vendor</span>
          <Controller
            control={form.control}
            name={`items.${index}.vendor_id`}
            render={({ field }) => (
              <LookupVendor
                value={field.value ?? ""}
                onValueChange={field.onChange}
                disabled={disabled}
                className="w-full h-7 text-xs"
              />
            )}
          />
        </div>
        <div className="col-span-2">
          <label
            htmlFor={`items-${index}-pricelist-price`}
            className="text-xs text-muted-foreground"
          >
            Unit Price
          </label>
          <Input
            id={`items-${index}-pricelist-price`}
            type="number"
            min={0}
            step="0.01"
            placeholder="0.00"
            className="h-7 text-xs text-right"
            disabled={disabled}
            {...form.register(`items.${index}.pricelist_price`, {
              valueAsNumber: true,
            })}
          />
        </div>
        <div className="col-span-3">
          <span className="text-xs text-muted-foreground">Pricelist</span>
          <div className="flex items-center gap-0.5">
            <span className="flex-1 h-7 leading-6 text-xs text-muted-foreground truncate">
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
          <span className="text-xs text-muted-foreground">Net Amount</span>
          <div className="h-7 leading-6 text-xs text-right font-medium tabular-nums">
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
          <span className="text-xs text-muted-foreground">Tax Profile</span>
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
                className="w-full text-xs"
                size="xs"
              />
            )}
          />
        </div>
        <div className="col-span-1">
          <label
            htmlFor={`items-${index}-tax-rate`}
            className="text-xs text-muted-foreground"
          >
            Tax %
          </label>
          <Input
            id={`items-${index}-tax-rate`}
            type="number"
            min={0}
            step="0.01"
            placeholder="0"
            className="h-7 text-xs text-right"
            disabled
            {...form.register(`items.${index}.tax_rate`, {
              valueAsNumber: true,
            })}
          />
        </div>
        <div className="col-span-2">
          <div className="flex items-center gap-1">
            <span className="text-xs text-muted-foreground">Tax Amt</span>
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
            id={`items-${index}-tax-amount`}
            type="number"
            min={0}
            step="0.01"
            placeholder="0.00"
            className="h-7 text-xs text-right"
            disabled={disabled || !isTaxAdj}
            {...form.register(`items.${index}.tax_amount`, {
              valueAsNumber: true,
            })}
          />
        </div>
        <div className="col-span-1">
          <label
            htmlFor={`items-${index}-discount-rate`}
            className="text-xs text-muted-foreground"
          >
            Disc %
          </label>
          <Input
            id={`items-${index}-discount-rate`}
            type="number"
            min={0}
            step="0.01"
            placeholder="0"
            className="h-7 text-xs text-right"
            disabled={disabled}
            {...form.register(`items.${index}.discount_rate`, {
              valueAsNumber: true,
            })}
          />
        </div>
        <div className="col-span-2">
          <div className="flex items-center gap-1">
            <span className="text-xs text-muted-foreground">Disc Amt</span>
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
            id={`items-${index}-discount-amount`}
            type="number"
            min={0}
            step="0.01"
            placeholder="0.00"
            className="h-7 text-xs text-right"
            disabled={disabled || !isDiscAdj}
            {...form.register(`items.${index}.discount_amount`, {
              valueAsNumber: true,
            })}
          />
        </div>
        <div className="col-span-3">
          <span className="text-xs text-muted-foreground">Total</span>
          <div className="h-7 leading-6 text-xs text-right font-semibold tabular-nums">
            {totalPrice.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </div>
        </div>
      </div>

      <InventoryRow
        control={form.control}
        index={index}
        buCode={buCode ?? ""}
      />

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
