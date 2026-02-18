import { Control, useWatch } from "react-hook-form";
import { PrFormValues } from "./pr-form-schema";
import { useProductInventory } from "@/hooks/use-product-inventory";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";

interface Props {
  readonly control: Control<PrFormValues>;
  readonly index: number;
  readonly buCode: string;
}

export default function InventoryRow({ control, index, buCode }: Props) {
  const locationId =
    useWatch({ control, name: `items.${index}.location_id` }) ?? "";
  const productId =
    useWatch({ control, name: `items.${index}.product_id` }) ?? "";

  const { data, isLoading } = useProductInventory(
    buCode,
    locationId,
    productId,
  );

  if (!locationId || !productId) return null;

  if (isLoading) {
    return (
      <div className="grid grid-cols-12 gap-2 items-end">
        {["on-hand", "on-order", "reorder", "restock", "level"].map((key) => (
          <div key={key} className="col-span-2">
            <Skeleton className="h-3 w-12 mb-1" />
            <Skeleton className="h-5 w-full" />
          </div>
        ))}
      </div>
    );
  }

  if (!data) return null;

  const { on_hand_qty, on_order_qty, re_order_qty, re_stock_qty } = data;
  const pct =
    re_stock_qty > 0
      ? Math.min(Math.round((on_hand_qty / re_stock_qty) * 100), 100)
      : 0;

  let indicatorColor = "bg-emerald-500";
  if (on_hand_qty < re_order_qty) {
    indicatorColor = "bg-red-500";
  } else if (on_hand_qty < re_stock_qty) {
    indicatorColor = "bg-amber-500";
  }

  return (
    <div className="grid grid-cols-12 gap-2 items-end">
      <div className="col-span-2">
        <span className="text-[10px] text-muted-foreground">On Hand</span>
        <div className="h-6 leading-6 text-[11px] font-medium tabular-nums">
          {on_hand_qty.toLocaleString()}
        </div>
      </div>
      <div className="col-span-2">
        <span className="text-[10px] text-muted-foreground">On Order</span>
        <div className="h-6 leading-6 text-[11px] font-medium tabular-nums">
          {on_order_qty.toLocaleString()}
        </div>
      </div>
      <div className="col-span-2">
        <span className="text-[10px] text-muted-foreground">
          Re-order Pt.
        </span>
        <div className="h-6 leading-6 text-[11px] tabular-nums text-muted-foreground">
          {re_order_qty.toLocaleString()}
        </div>
      </div>
      <div className="col-span-2">
        <span className="text-[10px] text-muted-foreground">Re-stock</span>
        <div className="h-6 leading-6 text-[11px] tabular-nums text-muted-foreground">
          {re_stock_qty.toLocaleString()}
        </div>
      </div>
      <div className="col-span-4">
        <span className="text-[10px] text-muted-foreground">
          Stock Level ({pct}%)
        </span>
        <div className="h-6 flex items-center">
          <Progress
            value={pct}
            className="h-2"
            indicatorClassName={indicatorColor}
          />
        </div>
      </div>
    </div>
  );
}
