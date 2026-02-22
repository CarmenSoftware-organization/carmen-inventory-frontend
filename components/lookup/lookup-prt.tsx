"use client";

import { useMemo } from "react";
import { usePriceListTemplate } from "@/hooks/use-price-list-template";
import type { PriceListTemplate } from "@/types/price-list-template";
import { LookupCombobox } from "./lookup-combobox";

interface LookupPrtProps {
  readonly value: string;
  readonly onValueChange: (
    value: string,
    template?: PriceListTemplate,
  ) => void;
  readonly disabled?: boolean;
  readonly placeholder?: string;
  readonly className?: string;
}

export function LookupPrt({
  value,
  onValueChange,
  disabled,
  placeholder = "Select template",
  className,
}: LookupPrtProps) {
  const { data, isLoading } = usePriceListTemplate({ perpage: -1 });
  const templates = useMemo(
    () => data?.data?.filter((t) => t.status === "active") ?? [],
    [data?.data],
  );

  return (
    <LookupCombobox
      value={value}
      onValueChange={(id, item) => onValueChange(id, item)}
      items={templates}
      getId={(t) => t.id}
      getLabel={(t) => t.name}
      placeholder={placeholder}
      searchPlaceholder="Search template..."
      disabled={disabled}
      isLoading={isLoading}
      className={className}
    />
  );
}
