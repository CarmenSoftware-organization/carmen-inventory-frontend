"use client";

import { useMemo } from "react";
import { useDeliveryPoint } from "@/hooks/use-delivery-point";
import { LookupCombobox } from "./lookup-combobox";

interface LookupDeliveryPointProps {
  readonly value: string;
  readonly onValueChange: (value: string) => void;
  readonly disabled?: boolean;
  readonly placeholder?: string;
  readonly className?: string;
}

export function LookupDeliveryPoint({
  value,
  onValueChange,
  disabled,
  placeholder = "Select delivery point",
  className,
}: LookupDeliveryPointProps) {
  const { data } = useDeliveryPoint({ perpage: -1 });
  const deliveryPoints = useMemo(
    () => data?.data?.filter((d) => d.is_active) ?? [],
    [data?.data],
  );

  return (
    <LookupCombobox
      value={value}
      onValueChange={(id) => onValueChange(id)}
      items={deliveryPoints}
      getId={(d) => d.id}
      getLabel={(d) => d.name}
      placeholder={placeholder}
      searchPlaceholder="Search delivery point..."
      disabled={disabled}
      className={className}
    />
  );
}
