"use client";

import { ChevronRight } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import type { Location, ProductLocation } from "@/types/stock-replenishment";

const STATUS_CONFIG = {
  critical: { variant: "destructive" as const, label: "Critical" },
  warning: { variant: "warning" as const, label: "Warning" },
  low: { variant: "secondary" as const, label: "Low" },
};

interface StockReplLocationProps {
  readonly location: Location;
  readonly selectedIds: Set<string>;
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
  readonly onSelectionChange: (
    locationId: string,
    selectedIds: Set<string>,
  ) => void;
}

export function StockReplLocation({
  location,
  selectedIds,
  open,
  onOpenChange,
  onSelectionChange,
}: StockReplLocationProps) {
  const products = location.products_location;
  const criticalCount = products.filter((p) => p.status === "critical").length;
  const warningCount = products.filter((p) => p.status === "warning").length;
  const lowCount = products.filter((p) => p.status === "low").length;
  const allSelected =
    products.length > 0 && products.every((p) => selectedIds.has(p.id));
  const someSelected =
    products.some((p) => selectedIds.has(p.id)) && !allSelected;

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const allIds = new Set(products.map((p) => p.id));
      onSelectionChange(location.location_id, allIds);
    } else {
      onSelectionChange(location.location_id, new Set());
    }
  };

  const handleSelectProduct = (product: ProductLocation, checked: boolean) => {
    const next = new Set(selectedIds);
    if (checked) {
      next.add(product.id);
    } else {
      next.delete(product.id);
    }
    onSelectionChange(location.location_id, next);
  };

  return (
    <Collapsible open={open} onOpenChange={onOpenChange}>
      <CollapsibleTrigger className="flex w-full items-center gap-2 rounded-md border bg-muted/40 px-3 py-2 text-left text-sm font-medium hover:bg-muted/70 transition-colors">
        <ChevronRight
          className={`size-4 shrink-0 transition-transform ${open ? "rotate-90" : ""}`}
        />
        <span className="flex-1">{location.location_name}</span>
        <Badge variant="secondary" size="sm">
          {products.length} items
        </Badge>
        {criticalCount > 0 && (
          <Badge variant="destructive" size="sm">
            {criticalCount} critical
          </Badge>
        )}
        {warningCount > 0 && (
          <Badge variant="warning" size="sm">
            {warningCount} warning
          </Badge>
        )}
        {lowCount > 0 && (
          <Badge variant="secondary" size="sm">
            {lowCount} low
          </Badge>
        )}
      </CollapsibleTrigger>

      <CollapsibleContent>
        <div className="mt-1 rounded-md border">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b bg-muted/30">
                <th scope="col" className="w-10 px-2 py-1.5">
                  <Checkbox
                    checked={allSelected}
                    {...(someSelected ? { "data-state": "indeterminate" } : {})}
                    onCheckedChange={(checked) =>
                      handleSelectAll(checked === true)
                    }
                    aria-label={`Select all products in ${location.location_name}`}
                  />
                </th>
                <th scope="col" className="w-10 px-2 py-1.5 text-left">
                  #
                </th>
                <th scope="col" className="px-2 py-1.5 text-left">
                  Product
                </th>
                <th scope="col" className="px-2 py-1.5 text-left">
                  Category
                </th>
                <th scope="col" className="px-2 py-1.5 text-left">
                  Sub Category
                </th>
                <th scope="col" className="px-2 py-1.5 text-left">
                  Item Group
                </th>
                <th scope="col" className="w-20 px-2 py-1.5 text-right">
                  Current
                </th>
                <th scope="col" className="w-20 px-2 py-1.5 text-right">
                  Par Level
                </th>
                <th scope="col" className="w-20 px-2 py-1.5 text-right">
                  Need
                </th>
                <th scope="col" className="w-20 px-2 py-1.5 text-center">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {products.map((product, index) => {
                const config = STATUS_CONFIG[product.status];
                const isSelected = selectedIds.has(product.id);

                return (
                  <tr
                    key={product.id}
                    className={`border-b last:border-b-0 transition-colors ${isSelected ? "bg-primary/5" : "hover:bg-muted/20"}`}
                  >
                    <td className="px-4 py-1.5">
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={(checked) =>
                          handleSelectProduct(product, checked === true)
                        }
                        aria-label={`Select ${product.name}`}
                      />
                    </td>
                    <td className="px-2 py-1.5 text-muted-foreground">
                      {index + 1}
                    </td>
                    <td className="px-2 py-1.5">{product.name}</td>
                    <td className="px-2 py-1.5 text-muted-foreground">
                      {product.category.name}
                    </td>
                    <td className="px-2 py-1.5 text-muted-foreground">
                      {product.sub_category.name}
                    </td>
                    <td className="px-2 py-1.5 text-muted-foreground">
                      {product.item_group.name}
                    </td>
                    <td className="px-2 py-1.5 text-right tabular-nums">
                      {product.current}
                    </td>
                    <td className="px-2 py-1.5 text-right tabular-nums">
                      {product.par_level}
                    </td>
                    <td className="px-2 py-1.5 text-right tabular-nums font-semibold">
                      {product.need}
                    </td>
                    <td className="px-2 py-1.5 text-center">
                      <Badge variant={config.variant} size="xs">
                        {config.label}
                      </Badge>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
