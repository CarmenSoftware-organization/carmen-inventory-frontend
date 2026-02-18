"use client";

import { useMemo } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useLocation } from "@/hooks/use-location";

interface LookupLocationProps {
  readonly value: string;
  readonly onValueChange: (value: string) => void;
  readonly disabled?: boolean;
  readonly placeholder?: string;
  readonly className?: string;
  readonly size?: "xs" | "sm" | "default";
}

export function LookupLocation({
  value,
  onValueChange,
  disabled,
  placeholder = "Select location",
  className,
  size = "sm",
}: LookupLocationProps) {
  const { data } = useLocation({ perpage: -1 });
  const locations = useMemo(
    () => data?.data?.filter((l) => l.is_active) ?? [],
    [data?.data],
  );

  return (
    <Select value={value} onValueChange={onValueChange} disabled={disabled}>
      <SelectTrigger size={size} className={className ?? "text-xs w-full"}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {locations.map((location) => (
          <SelectItem key={location.id} value={location.id} className="text-xs">
            {location.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
