"use client";

import { useMemo } from "react";
import { WarehouseIcon } from "lucide-react";
import { useVendor } from "@/hooks/use-vendor";
import type { Vendor } from "@/types/vendor";
import { LookupCombobox } from "./lookup-combobox";

interface LookupVendorProps {
  readonly value: string;
  readonly onValueChange: (value: string) => void;
  readonly onItemChange?: (vendor: Vendor) => void;
  readonly excludeIds?: Set<string>;
  readonly disabled?: boolean;
  readonly placeholder?: string;
  readonly defaultLabel?: string;
  readonly className?: string;
}

export function LookupVendor({
  value,
  onValueChange,
  onItemChange,
  excludeIds,
  disabled,
  placeholder = "Select vendor",
  defaultLabel,
  className,
}: LookupVendorProps) {
  const { data } = useVendor({ perpage: -1 });
  const activeVendors = useMemo(
    () => data?.data?.filter((v) => v.is_active) ?? [],
    [data?.data],
  );

  const vendors = useMemo(() => {
    if (!excludeIds?.size) return activeVendors;
    return activeVendors.filter((v) => !excludeIds.has(v.id));
  }, [activeVendors, excludeIds]);

  return (
    <LookupCombobox
      value={value}
      onValueChange={(id, item) => {
        onValueChange(id);
        if (item) onItemChange?.(item);
      }}
      items={vendors}
      getId={(v) => v.id}
      getLabel={(v) => v.name}
      renderSelected={
        defaultLabel
          ? (v) => v.name
          : undefined
      }
      placeholder={placeholder}
      searchPlaceholder="Search vendor..."
      disabled={disabled}
      className={className}
      popoverWidth="w-90"
      popoverAlign="start"
      emptyIcon={WarehouseIcon}
      emptyTitle="No vendor found"
      emptyDescription="Try adjusting your search or filter to find what you're looking for."
    />
  );
}
