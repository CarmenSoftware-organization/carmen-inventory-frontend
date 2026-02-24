"use client";

import { useMemo } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTaxProfile } from "@/hooks/use-tax-profile";

interface LookupTaxProfileProps {
  readonly value: string;
  readonly onValueChange: (value: string, taxRate: number) => void;
  readonly disabled?: boolean;
  readonly placeholder?: string;
  readonly className?: string;
  readonly size?: "xs" | "sm";
}

export function LookupTaxProfile({
  value,
  onValueChange,
  disabled,
  placeholder = "Select tax profile",
  className,
  size = "sm",
}: LookupTaxProfileProps) {
  const { data } = useTaxProfile({ perpage: -1 });
  const taxProfiles = useMemo(
    () => data?.data?.filter((t) => t.is_active) ?? [],
    [data?.data],
  );

  return (
    <Select
      value={value || "none"}
      onValueChange={(v) => {
        const id = v === "none" ? "" : v;
        const profile = taxProfiles.find((tp) => tp.id === id);
        onValueChange(id, profile?.tax_rate ?? 0);
      }}
      disabled={disabled}
    >
      <SelectTrigger align="end" size={size} className={className ?? "text-xs"}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="none">None</SelectItem>
        {taxProfiles.map((tp) => (
          <SelectItem key={tp.id} value={tp.id} className="text-xs">
            {tp.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
