"use client";

import { useMemo } from "react";
import { useCuisine } from "@/hooks/use-cuisine";
import { LookupCombobox } from "./lookup-combobox";

interface LookupCuisineProps {
  readonly value: string;
  readonly onValueChange: (value: string) => void;
  readonly disabled?: boolean;
  readonly placeholder?: string;
  readonly className?: string;
}

export function LookupCuisine({
  value,
  onValueChange,
  disabled,
  placeholder = "Select cuisine",
  className,
}: LookupCuisineProps) {
  const { data } = useCuisine({ perpage: -1 });
  const cuisines = useMemo(
    () => (data?.data ?? []).filter((v) => v.is_active),
    [data?.data],
  );

  return (
    <LookupCombobox
      value={value}
      onValueChange={(id) => onValueChange(id)}
      items={cuisines}
      getId={(c) => c.id}
      getLabel={(c) => c.name}
      placeholder={placeholder}
      searchPlaceholder="Search cuisine..."
      disabled={disabled}
      className={className}
    />
  );
}
