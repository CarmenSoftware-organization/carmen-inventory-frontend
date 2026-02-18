"use client";

import { useMemo } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useVendor } from "@/hooks/use-vendor";

interface LookupVendorProps {
  readonly value: string;
  readonly onValueChange: (value: string) => void;
  readonly disabled?: boolean;
  readonly placeholder?: string;
  readonly className?: string;
  readonly size?: "xs" | "sm" | "default";
}

export function LookupVendor({
  value,
  onValueChange,
  disabled,
  placeholder = "Select vendor",
  className,
  size = "sm",
}: LookupVendorProps) {
  const { data } = useVendor({ perpage: -1 });
  const vendors = useMemo(
    () => data?.data?.filter((v) => v.is_active) ?? [],
    [data?.data],
  );

  return (
    <Select value={value} onValueChange={onValueChange} disabled={disabled}>
      <SelectTrigger size={size} className={className ?? "text-xs"}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {vendors.map((vendor) => (
          <SelectItem key={vendor.id} value={vendor.id} className="text-xs">
            {vendor.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
