"use client";

import { PackageSearch } from "lucide-react";
import { useProductsByLocation } from "@/hooks/use-products-by-location";
import type { Product } from "@/types/product";
import { Badge } from "@/components/ui/badge";
import { LookupCombobox } from "./lookup-combobox";

interface LookupProductInLocationProps {
  readonly locationId: string;
  readonly value: string;
  readonly onValueChange: (value: string, product?: Product) => void;
  readonly disabled?: boolean;
  readonly placeholder?: string;
  readonly className?: string;
}

export function LookupProductInLocation({
  locationId,
  value,
  onValueChange,
  disabled,
  placeholder = "Select product",
  className,
}: LookupProductInLocationProps) {
  const { data: products = [] } = useProductsByLocation(
    locationId || undefined,
  );

  return (
    <LookupCombobox
      value={value}
      onValueChange={onValueChange}
      items={products}
      getId={(p) => p.id}
      getLabel={(p) => p.name}
      renderItem={(p) => (
        <>
          <Badge size="xs" variant="secondary" className="shrink-0">
            {p.code}
          </Badge>
          <span className="flex-1 text-left truncate">{p.name}</span>
        </>
      )}
      placeholder={placeholder}
      searchPlaceholder="Search product..."
      disabled={disabled || !locationId}
      className={className}
      popoverWidth="w-90"
      popoverAlign="start"
      emptyIcon={PackageSearch}
      emptyTitle="No product found"
      emptyDescription="Try adjusting your search or filter to find what you're looking for."
    />
  );
}
