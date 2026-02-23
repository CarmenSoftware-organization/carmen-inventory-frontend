import { UseFormReturn, useWatch } from "react-hook-form";
import { PrFormValues } from "./pr-form-schema";
import { useMemo } from "react";
import { formatCurrency } from "@/lib/currency-utils";

interface Props {
  readonly control: UseFormReturn<PrFormValues>["control"];
  readonly itemCount: number;
  readonly currencyCode: string;
}

export default function GrandTotal({
  control,
  itemCount,
  currencyCode,
}: Props) {
  const items = useWatch({ control, name: "items" });

  const summary = useMemo(() => {
    let subtotal = 0;
    let totalDiscount = 0;
    let totalNet = 0;
    let totalTax = 0;
    let grandTotal = 0;

    for (const item of items) {
      const price = Number(item?.pricelist_price ?? 0);
      const qty = Number(item?.requested_qty ?? 0);
      subtotal += price * qty;
      totalDiscount += Number(item?.discount_amount ?? 0);
      totalNet += Number(item?.net_amount ?? 0);
      totalTax += Number(item?.tax_amount ?? 0);
      grandTotal += Number(item?.total_price ?? 0);
    }

    return { subtotal, totalDiscount, totalNet, totalTax, grandTotal };
  }, [items]);

  const rows: { label: string; value: string; className?: string }[] = [
    { label: "Subtotal", value: formatCurrency(summary.subtotal) },
    {
      label: "Discount",
      value:
        summary.totalDiscount > 0 ? `-${formatCurrency(summary.totalDiscount)}` : formatCurrency(0),
      className: summary.totalDiscount > 0 ? "text-destructive" : undefined,
    },
    { label: "Net", value: formatCurrency(summary.totalNet) },
    { label: "Tax", value: formatCurrency(summary.totalTax) },
  ];

  return (
    <div className="flex items-start justify-between border-t pt-3 text-sm">
      <span className="text-muted-foreground text-xs pt-0.5">
        {itemCount} {itemCount === 1 ? "item" : "items"}
      </span>
      <div className="w-56">
        {rows.map((row) => (
          <div
            key={row.label}
            className="flex items-center justify-between py-0.5 text-xs tabular-nums"
          >
            <span className="text-muted-foreground">{row.label}</span>
            <span className={row.className}>{row.value}</span>
          </div>
        ))}
        <div className="border-t my-1" />
        <div className="flex items-center justify-between">
          <span className="font-semibold text-sm">Total</span>
          <span className="font-semibold text-sm tabular-nums">
            {formatCurrency(summary.grandTotal)}{" "}
            {currencyCode && (
              <span className="text-muted-foreground font-normal text-xs">
                {currencyCode}
              </span>
            )}
          </span>
        </div>
      </div>
    </div>
  );
}
