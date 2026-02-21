"use client";

import { useMemo } from "react";
import { Tags } from "lucide-react";
import { usePriceList } from "@/hooks/use-price-list";
import { LookupCombobox } from "./lookup-combobox";

interface LookupPriceListProps {
  readonly value: string;
  readonly onValueChange: (value: string) => void;
  readonly disabled?: boolean;
  readonly placeholder?: string;
  readonly className?: string;
}

export function LookupPriceList({
  value,
  onValueChange,
  disabled,
  placeholder = "Select price list",
  className,
}: LookupPriceListProps) {
  const { data, isLoading } = usePriceList({ perpage: -1 });
  const priceLists = useMemo(
    () => data?.data?.filter((p) => p.status === "active") ?? [],
    [data?.data],
  );

  return (
    <LookupCombobox
      value={value}
      onValueChange={(id) => onValueChange(id)}
      items={priceLists}
      getId={(p) => p.id}
      getLabel={(p) => `${p.name} — ${p.vendor.name}`}
      getSearchValue={(p) => `${p.name} ${p.vendor.name}`}
      placeholder={placeholder}
      searchPlaceholder="Search price list..."
      disabled={disabled}
      isLoading={isLoading}
      className={className}
      emptyIcon={Tags}
      emptyTitle="No price list found"
      emptyDescription="Try adjusting your search or filter to find what you're looking for."
    />
  );
}
