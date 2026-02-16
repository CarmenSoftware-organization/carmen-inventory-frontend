"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useUnit } from "@/hooks/use-unit";

interface LookupUnitProps {
  readonly value: string;
  readonly onValueChange: (value: string) => void;
  readonly disabled?: boolean;
  readonly placeholder?: string;
  readonly className?: string;
  readonly size?: "xs" | "sm" | "default";
}

export function LookupUnit({
  value,
  onValueChange,
  disabled,
  placeholder = "Select unit",
  className,
  size = "sm",
}: LookupUnitProps) {
  const { data } = useUnit({ perpage: 9999 });
  const units = data?.data?.filter((u) => u.is_active) ?? [];

  return (
    <Select value={value} onValueChange={onValueChange} disabled={disabled}>
      <SelectTrigger size={size} className={className ?? "h-8 w-full text-sm"}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {units.map((unit) => (
          <SelectItem key={unit.id} value={unit.id}>
            {unit.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
