"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useDeliveryPoint } from "@/hooks/use-delivery-point";

interface LookupDeliveryPointProps {
  readonly value: string;
  readonly onValueChange: (value: string) => void;
  readonly disabled?: boolean;
  readonly placeholder?: string;
  readonly className?: string;
  readonly size?: "xs" | "sm" | "default";
}

export function LookupDeliveryPoint({
  value,
  onValueChange,
  disabled,
  placeholder = "Select delivery point",
  className,
  size = "sm",
}: LookupDeliveryPointProps) {
  const { data } = useDeliveryPoint({ perpage: 9999 });
  const deliveryPoints = data?.data?.filter((d) => d.is_active) ?? [];

  return (
    <Select value={value} onValueChange={onValueChange} disabled={disabled}>
      <SelectTrigger size={size} className={className ?? "h-8 w-full text-sm"}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {deliveryPoints.map((dp) => (
          <SelectItem key={dp.id} value={dp.id} className="text-xs">
            {dp.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
