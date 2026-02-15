"use client";

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
}

export function LookupLocation({
  value,
  onValueChange,
  disabled,
  placeholder = "Select location",
  className,
}: LookupLocationProps) {
  const { data } = useLocation({ perpage: 9999 });
  const locations = data?.data?.filter((l) => l.is_active) ?? [];

  return (
    <Select value={value} onValueChange={onValueChange} disabled={disabled}>
      <SelectTrigger size="sm" className={className ?? "text-xs w-full"}>
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
