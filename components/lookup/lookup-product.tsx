"use client";

import { useMemo } from "react";
import { PackageSearch } from "lucide-react";
import { useProduct } from "@/hooks/use-product";
import type { Product } from "@/types/product";
import { LookupCombobox } from "./lookup-combobox";

interface LookupProductProps {
  readonly value: string;
  readonly onValueChange: (value: string, product?: Product) => void;
  readonly disabled?: boolean;
  readonly placeholder?: string;
  readonly className?: string;
  readonly excludeIds?: string[];
}

export function LookupProduct({
  value,
  onValueChange,
  disabled,
  placeholder = "Select product",
  className,
  excludeIds,
}: LookupProductProps) {
  const { data } = useProduct({ perpage: -1 });
  const products = useMemo(() => {
    const active =
      data?.data?.filter((p) => p.product_status_type === "active") ?? [];
    if (!excludeIds || excludeIds.length === 0) return active;
    const excluded = new Set(excludeIds);
    return active.filter((p) => !excluded.has(p.id));
  }, [data?.data, excludeIds]);

  return (
    <LookupCombobox
      value={value}
      onValueChange={onValueChange}
      items={products}
      getId={(p) => p.id}
      getLabel={(p) => p.name}
      placeholder={placeholder}
      searchPlaceholder="Search product..."
      disabled={disabled}
      className={className}
      popoverWidth="w-90"
      emptyIcon={PackageSearch}
      emptyTitle="No product found"
      emptyDescription="Try adjusting your search or filter to find what you're looking for."
    />
  );
}
