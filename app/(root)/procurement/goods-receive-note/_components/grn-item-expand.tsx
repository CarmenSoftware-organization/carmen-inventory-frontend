import { useMemo, useEffect } from "react";
import {
  Controller,
  useWatch,
  type UseFormReturn,
  type Control,
  type FieldArrayWithId,
} from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { LookupTaxProfile } from "@/components/lookup/lookup-tax-profile";
import { LookupProductUnit } from "@/components/lookup/lookup-product-unit";
import type { GrnFormValues } from "./grn-form-schema";

type GrnItemField = FieldArrayWithId<GrnFormValues, "items", "id">;

const INPUT_CLS = "h-6 text-[11px] md:text-[11px] text-right";
const LABEL_CLS = "text-[10px] text-muted-foreground";
const SECTION_CLS = "text-[10px] font-medium text-muted-foreground uppercase tracking-wider";

const round2 = (n: number): number =>
  Number(Math.round(Number.parseFloat(n + "e2")) + "e-2");

/** Unit lookup that watches product_id */
function ExpandProductUnit({
  control,
  index,
  unitField,
  disabled,
}: {
  control: Control<GrnFormValues>;
  index: number;
  unitField:
    | "order_unit_id"
    | "foc_unit_id"
    | "return_unit_id";
  disabled: boolean;
}) {
  const productId =
    useWatch({ control, name: `items.${index}.product_id` }) ?? "";
  return (
    <Controller
      control={control}
      name={`items.${index}.${unitField}`}
      render={({ field }) => (
        <LookupProductUnit
          productId={productId}
          value={field.value ?? ""}
          onValueChange={field.onChange}
          disabled={disabled}
          className="w-full text-[11px]"
        />
      )}
    />
  );
}

interface GrnItemExpandProps {
  item: GrnItemField;
  form: UseFormReturn<GrnFormValues>;
  disabled: boolean;
  itemFields: GrnItemField[];
}

export function GrnItemExpand({
  item,
  form,
  disabled,
  itemFields,
}: GrnItemExpandProps) {
  const index = itemFields.findIndex((f) => f.id === item.id);

  const i = Math.max(index, 0);

  const [
    watchPrice,
    watchReceivedQty,
    watchTaxRate,
    watchIsTaxAdj,
    watchTaxAmt,
  ] = useWatch({
    control: form.control,
    name: [
      `items.${i}.price`,
      `items.${i}.received_qty`,
      `items.${i}.tax_rate`,
      `items.${i}.is_tax_adjustment`,
      `items.${i}.tax_amount`,
    ] as const,
  });

  const price = watchPrice ?? 0;
  const qty = watchReceivedQty ?? 0;
  const taxRate = watchTaxRate ?? 0;
  const isTaxAdj = watchIsTaxAdj ?? false;
  const taxAmt = watchTaxAmt ?? 0;

  const { totalPrice, taxAmount, totalAmount } = useMemo(() => {
    const tp = round2(price * qty);
    const tax = isTaxAdj ? taxAmt : round2((tp * taxRate) / 100);
    const total = round2(tp + tax);
    return { totalPrice: tp, taxAmount: tax, totalAmount: total };
  }, [price, qty, taxRate, isTaxAdj, taxAmt]);

  // Sync computed values back to form
  useEffect(() => {
    if (index === -1) return;
    form.setValue(`items.${index}.total_price`, totalPrice);
    if (!isTaxAdj) {
      form.setValue(`items.${index}.tax_amount`, taxAmount);
    }
    form.setValue(`items.${index}.total_amount`, totalAmount);
  }, [index, totalPrice, taxAmount, totalAmount, isTaxAdj, form]);

  if (index === -1) return null;

  return (
    <div className="px-3 py-2 bg-muted/40 border-t border-border space-y-2">
      {/* ── Pricing ── */}
      <div>
        <span className={SECTION_CLS}>Pricing</span>
        <div className="grid grid-cols-12 gap-2 items-end mt-0.5">
          <div className="col-span-2">
            <label htmlFor={`items-${index}-price`} className={LABEL_CLS}>
              Price
            </label>
            <Input
              id={`items-${index}-price`}
              type="number"
              min={0}
              step="0.01"
              placeholder="0.00"
              className={INPUT_CLS}
              disabled={disabled}
              {...form.register(`items.${index}.price`, {
                valueAsNumber: true,
              })}
            />
          </div>
          <div className="col-span-2">
            <label htmlFor={`items-${index}-price-without-vat`} className={LABEL_CLS}>
              Price w/o VAT
            </label>
            <Input
              id={`items-${index}-price-without-vat`}
              type="number"
              step="0.01"
              placeholder="0.00"
              className={INPUT_CLS}
              disabled={disabled}
              {...form.register(`items.${index}.price_without_vat`, {
                valueAsNumber: true,
              })}
            />
          </div>
          <div className="col-span-2">
            <label htmlFor={`items-${index}-price-with-vat`} className={LABEL_CLS}>
              Price w/ VAT
            </label>
            <Input
              id={`items-${index}-price-with-vat`}
              type="number"
              step="0.01"
              placeholder="0.00"
              className={INPUT_CLS}
              disabled={disabled}
              {...form.register(`items.${index}.price_with_vat`, {
                valueAsNumber: true,
              })}
            />
          </div>
          <div className="col-span-2">
            <label htmlFor={`items-${index}-base-price`} className={LABEL_CLS}>
              Base Price
            </label>
            <Input
              id={`items-${index}-base-price`}
              type="number"
              step="0.01"
              placeholder="0.00"
              className={INPUT_CLS}
              disabled={disabled}
              {...form.register(`items.${index}.base_price`, {
                valueAsNumber: true,
              })}
            />
          </div>
          <div className="col-span-2">
            <span className={LABEL_CLS}>Total Price</span>
            <div className="h-6 leading-6 text-[11px] text-right font-medium tabular-nums">
              {totalPrice.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </div>
          </div>
          <div className="col-span-2">
            <label htmlFor={`items-${index}-base-total-price`} className={LABEL_CLS}>
              Base Total Price
            </label>
            <Input
              id={`items-${index}-base-total-price`}
              type="number"
              step="0.01"
              placeholder="0.00"
              className={INPUT_CLS}
              disabled={disabled}
              {...form.register(`items.${index}.base_total_price`, {
                valueAsNumber: true,
              })}
            />
          </div>
        </div>
      </div>

      {/* ── Tax ── */}
      <div>
        <span className={SECTION_CLS}>Tax</span>
        <div className="grid grid-cols-12 gap-2 items-end mt-0.5">
          <div className="col-span-3">
            <span className={LABEL_CLS}>Tax Profile</span>
            <Controller
              control={form.control}
              name={`items.${index}.tax_profile_id`}
              render={({ field }) => (
                <LookupTaxProfile
                  value={field.value ?? ""}
                  onValueChange={(value, taxRate) => {
                    field.onChange(value || null);
                    if (taxRate !== undefined) {
                      form.setValue(`items.${index}.tax_rate`, taxRate);
                    }
                  }}
                  disabled={disabled}
                  className="w-full text-[11px]"
                />
              )}
            />
          </div>
          <div className="col-span-1">
            <label htmlFor={`items-${index}-tax-rate`} className={LABEL_CLS}>
              Tax %
            </label>
            <Input
              id={`items-${index}-tax-rate`}
              type="number"
              min={0}
              step="0.01"
              placeholder="0"
              className={INPUT_CLS}
              disabled
              {...form.register(`items.${index}.tax_rate`, {
                valueAsNumber: true,
              })}
            />
          </div>
          <div className="col-span-2">
            <div className="flex items-center gap-1">
              <span className={LABEL_CLS}>Tax Amt</span>
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
              className={INPUT_CLS}
              disabled={disabled || !isTaxAdj}
              {...form.register(`items.${index}.tax_amount`, {
                valueAsNumber: true,
              })}
            />
          </div>
          <div className="col-span-2">
            <label htmlFor={`items-${index}-base-tax-amount`} className={LABEL_CLS}>
              Base Tax Amt
            </label>
            <Input
              id={`items-${index}-base-tax-amount`}
              type="number"
              step="0.01"
              placeholder="0.00"
              className={INPUT_CLS}
              disabled={disabled}
              {...form.register(`items.${index}.base_tax_amount`, {
                valueAsNumber: true,
              })}
            />
          </div>
        </div>
      </div>

      {/* ── Quantities ── */}
      <div>
        <span className={SECTION_CLS}>Quantities</span>
        <div className="grid grid-cols-12 gap-2 items-end mt-0.5">
          <div className="col-span-2">
            <label htmlFor={`items-${index}-order-qty`} className={LABEL_CLS}>
              Order Qty
            </label>
            <Input
              id={`items-${index}-order-qty`}
              type="number"
              min={0}
              placeholder="0"
              className={INPUT_CLS}
              disabled={disabled}
              {...form.register(`items.${index}.order_qty`, {
                valueAsNumber: true,
              })}
            />
          </div>
          <div className="col-span-2">
            <span className={LABEL_CLS}>Order Unit</span>
            <ExpandProductUnit
              control={form.control}
              index={index}
              unitField="order_unit_id"
              disabled={disabled}
            />
          </div>
          <div className="col-span-2">
            <label htmlFor={`items-${index}-foc-qty`} className={LABEL_CLS}>
              FOC Qty
            </label>
            <Input
              id={`items-${index}-foc-qty`}
              type="number"
              min={0}
              placeholder="0"
              className={INPUT_CLS}
              disabled={disabled}
              {...form.register(`items.${index}.foc_qty`, {
                valueAsNumber: true,
              })}
            />
          </div>
          <div className="col-span-2">
            <span className={LABEL_CLS}>FOC Unit</span>
            <ExpandProductUnit
              control={form.control}
              index={index}
              unitField="foc_unit_id"
              disabled={disabled}
            />
          </div>
          <div className="col-span-2">
            <label htmlFor={`items-${index}-return-qty`} className={LABEL_CLS}>
              Return Qty
            </label>
            <Input
              id={`items-${index}-return-qty`}
              type="number"
              min={0}
              placeholder="0"
              className={INPUT_CLS}
              disabled={disabled}
              {...form.register(`items.${index}.return_qty`, {
                valueAsNumber: true,
              })}
            />
          </div>
          <div className="col-span-2">
            <span className={LABEL_CLS}>Return Unit</span>
            <ExpandProductUnit
              control={form.control}
              index={index}
              unitField="return_unit_id"
              disabled={disabled}
            />
          </div>
        </div>
      </div>

      {/* ── Cost Summary ── */}
      <div>
        <span className={SECTION_CLS}>Cost Summary</span>
        <div className="grid grid-cols-12 gap-2 items-end mt-0.5">
          <div className="col-span-2">
            <label htmlFor={`items-${index}-extra-cost`} className={LABEL_CLS}>
              Extra Cost
            </label>
            <Input
              id={`items-${index}-extra-cost`}
              type="number"
              step="0.01"
              placeholder="0.00"
              className={INPUT_CLS}
              disabled={disabled}
              {...form.register(`items.${index}.extra_cost`, {
                valueAsNumber: true,
              })}
            />
          </div>
          <div className="col-span-2">
            <label htmlFor={`items-${index}-total-cost`} className={LABEL_CLS}>
              Total Cost
            </label>
            <Input
              id={`items-${index}-total-cost`}
              type="number"
              step="0.01"
              placeholder="0.00"
              className={INPUT_CLS}
              disabled={disabled}
              {...form.register(`items.${index}.total_cost`, {
                valueAsNumber: true,
              })}
            />
          </div>
          <div className="col-span-2" />
          <div className="col-span-2" />
          <div className="col-span-2" />
          <div className="col-span-2">
            <span className={LABEL_CLS}>Total Amount</span>
            <div className="h-6 leading-6 text-[11px] text-right font-semibold tabular-nums">
              {totalAmount.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
