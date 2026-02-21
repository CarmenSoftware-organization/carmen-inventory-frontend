"use client";

import { useMemo } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCreditTerm } from "@/hooks/use-credit-term";
import type { CreditTerm } from "@/types/credit-term";

interface LookupCreditTermProps {
  readonly value: string;
  readonly onValueChange: (value: string, creditTerm?: CreditTerm) => void;
  readonly disabled?: boolean;
  readonly placeholder?: string;
  readonly className?: string;
  readonly size?: "xs" | "sm" | "default";
}

export function LookupCreditTerm({
  value,
  onValueChange,
  disabled,
  placeholder = "Select credit term",
  className,
  size = "sm",
}: LookupCreditTermProps) {
  const { data } = useCreditTerm({ perpage: -1 });
  const creditTerms = useMemo(
    () => data?.data?.filter((c) => c.is_active) ?? [],
    [data?.data],
  );

  return (
    <Select
      value={value}
      onValueChange={(val) => {
        const item = creditTerms.find((c) => c.id === val);
        onValueChange(val, item);
      }}
      disabled={disabled}
    >
      <SelectTrigger size={size} className={className ?? "h-8 w-full text-sm"}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {creditTerms.map((ct) => (
          <SelectItem key={ct.id} value={ct.id} className="text-xs">
            {ct.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
