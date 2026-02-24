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
import { formatCurrency } from "@/lib/currency-utils";
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
    watchPricelistNo,
    watchProductId,
    watchProductName,
    watchUnitId,
    watchCurrencyId,
    watchDeliveryDate,
    watchRequestedUnitName,
    watchApprovedQty,
    watchApprovedUnitName,
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
      `items.${i}.pricelist_no`,
      `items.${i}.product_id`,
      `items.${i}.product_name`,
      `items.${i}.requested_unit_id`,
      `items.${i}.currency_id`,
      `items.${i}.delivery_date`,
      `items.${i}.requested_unit_name`,
      `items.${i}.approved_qty`,
      `items.${i}.approved_unit_name`,
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

  const pricelistNo = watchPricelistNo ?? null;
  const productId = watchProductId ?? "";
  const productName = watchProductName ?? "";
  const unitId = watchUnitId ?? "";
  const currencyId = watchCurrencyId ?? "";
  const deliveryDate = watchDeliveryDate ?? "";
  const requestedUnitName = watchRequestedUnitName ?? "";
  const approvedQty = watchApprovedQty ?? 0;
  const approvedUnitName = watchApprovedUnitName ?? "";

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
    <div className="px-3 py-2 space-y-3 max-w-4xl">
      {/* ── Vendor & Pricing ── */}
      <div className="grid grid-cols-[1fr_8rem_1fr] gap-3 items-end">
        <div>
          <label
            htmlFor={`items-${index}-vendor`}
            className="text-xs text-muted-foreground"
          >
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
                className="w-full h-7 text-xs"
              />
            )}
          />
        </div>
        <div>
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
        <div>
          <span className="text-xs text-muted-foreground">Pricelist</span>
          <div className="flex items-center gap-1">
            <span className="flex-1 h-7 leading-7 text-xs text-muted-foreground truncate">
              {pricelistNo || "—"}
            </span>
            {!disabled && productId && unitId && currencyId && (
              <Button
                type="button"
                size="icon-xs"
                className="shrink-0"
                aria-label="Search pricelist"
                onClick={() => setShowPricelist(true)}
              >
                <Search className="size-3" />
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* ── Tax & Discount ── */}
      <div className="border-t pt-3 space-y-2">
        {/* Tax row */}
        <div className="grid grid-cols-[14rem_5rem_10rem] gap-3 items-end">
          <div>
            <label
              htmlFor={`items-${index}-tax-profile`}
              className="text-xs text-muted-foreground mb-0.5"
            >
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
                  className="w-full text-xs mt-0.5"
                  size="xs"
                />
              )}
            />
          </div>
          <div>
            <label
              htmlFor={`items-${index}-tax-rate`}
              className="text-xs text-muted-foreground mb-0.5"
            >
              Tax %
            </label>
            <Input
              id={`items-${index}-tax-rate`}
              type="number"
              min={0}
              step="0.01"
              placeholder="0"
              className="h-6 mt-0.5 text-xs text-right"
              disabled
              {...form.register(`items.${index}.tax_rate`, {
                valueAsNumber: true,
              })}
            />
          </div>
          <div>
            <div className="flex items-center justify-between mb-0.5">
              <label
                htmlFor={`items-${index}-tax-amount`}
                className="text-xs text-muted-foreground"
              >
                Tax Amt
              </label>
              <Controller
                control={form.control}
                name={`items.${index}.is_tax_adjustment`}
                render={({ field }) => (
                  <label className="flex items-center gap-1 cursor-pointer">
                    <Checkbox
                      checked={field.value ?? false}
                      onCheckedChange={field.onChange}
                      disabled={disabled}
                      className="size-3.5"
                    />
                    <span className="text-xs text-muted-foreground select-none">
                      Manual
                    </span>
                  </label>
                )}
              />
            </div>
            <Input
              id={`items-${index}-tax-amount`}
              type="number"
              min={0}
              step="0.01"
              placeholder="0.00"
              className="h-6 text-xs text-right"
              disabled={disabled || !isTaxAdj}
              {...form.register(`items.${index}.tax_amount`, {
                valueAsNumber: true,
              })}
            />
          </div>
        </div>
        {/* Discount row + Summary */}
        <div className="flex items-end gap-3">
          <div className="grid grid-cols-[5rem_10rem] gap-3 items-end">
            <div>
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
                className="h-6 text-xs mt-0.5 text-right"
                disabled={disabled}
                {...form.register(`items.${index}.discount_rate`, {
                  valueAsNumber: true,
                })}
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-0.5">
                <label
                  htmlFor={`items-${index}-discount-amount`}
                  className="text-xs text-muted-foreground"
                >
                  Disc Amt
                </label>
                <Controller
                  control={form.control}
                  name={`items.${index}.is_discount_adjustment`}
                  render={({ field }) => (
                    <label className="flex items-center gap-1 cursor-pointer">
                      <Checkbox
                        checked={field.value ?? false}
                        onCheckedChange={field.onChange}
                        disabled={disabled}
                        className="size-3.5"
                      />
                      <span className="text-xs text-muted-foreground select-none">
                        Manual
                      </span>
                    </label>
                  )}
                />
              </div>
              <Input
                id={`items-${index}-discount-amount`}
                type="number"
                min={0}
                step="0.01"
                placeholder="0.00"
                className="h-6 text-xs text-right"
                disabled={disabled || !isDiscAdj}
                {...form.register(`items.${index}.discount_amount`, {
                  valueAsNumber: true,
                })}
              />
            </div>
          </div>
          {/* Summary */}
          <div className="text-xs tabular-nums text-right space-y-0.5 pl-3 border-l">
            <div>
              <span className="text-muted-foreground">Net </span>
              <span className="font-medium">{formatCurrency(netAmount)}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Total </span>
              <span className="font-semibold">
                {formatCurrency(totalPrice)}
              </span>
            </div>
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
        requestedQty={qty}
        requestedUnitName={requestedUnitName}
        approvedQty={approvedQty}
        approvedUnitName={approvedUnitName}
        onSelect={handlePricelistSelect}
      />
    </div>
  );
}
