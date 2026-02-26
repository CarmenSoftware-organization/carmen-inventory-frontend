"use client";

import { useEffect } from "react";
import { Ruler } from "lucide-react";
import { useProductUnits, type ProductUnit } from "@/hooks/use-product-units";
import { LookupCombobox } from "./lookup-combobox";

interface LookupProductUnitProps {
  readonly productId: string;
  readonly value: string;
  readonly onValueChange: (value: string) => void;
  readonly onItemChange?: (unit: ProductUnit) => void;
  readonly disabled?: boolean;
  readonly placeholder?: string;
  readonly className?: string;
}

export function LookupProductUnit({
  productId,
  value,
  onValueChange,
  onItemChange,
  disabled,
  placeholder = "Select unit",
  className,
}: LookupProductUnitProps) {
  const { data: units = [], isLoading } = useProductUnits(
    productId || undefined,
  );

  useEffect(() => {
    if (units.length > 0 && !value) {
      onValueChange(units[0].id);
    }
  }, [units, value, onValueChange]);

  return (
    <LookupCombobox
      value={value}
      onValueChange={(id, item) => {
        onValueChange(id);
        if (item) onItemChange?.(item);
      }}
      items={units}
      getId={(u) => u.id}
      getLabel={(u) => u.name}
      placeholder={placeholder}
      searchPlaceholder="Search unit..."
      disabled={disabled || !productId}
      isLoading={isLoading}
      className={className}
      emptyIcon={Ruler}
      emptyTitle="No unit found"
      emptyDescription="Try adjusting your search or filter to find what you're looking for."
    />
  );
}
