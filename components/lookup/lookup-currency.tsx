"use client";

import { useMemo } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCurrency } from "@/hooks/use-currency";
import type { Currency } from "@/types/currency";

interface LookupCurrencyProps {
  readonly value: string;
  readonly onValueChange: (value: string) => void;
  readonly onItemChange?: (currency: Currency) => void;
  readonly disabled?: boolean;
  readonly placeholder?: string;
  readonly className?: string;
  readonly size?: "xs" | "sm" | "default";
}

export function LookupCurrency({
  value,
  onValueChange,
  onItemChange,
  disabled,
  placeholder = "Select currency",
  className,
  size = "sm",
}: LookupCurrencyProps) {
  const { data } = useCurrency({ perpage: -1 });
  const currencies = useMemo(
    () => data?.data?.filter((c) => c.is_active) ?? [],
    [data?.data],
  );

  const handleChange = (id: string) => {
    onValueChange(id);
    if (onItemChange) {
      const item = currencies.find((c) => c.id === id);
      if (item) onItemChange(item);
    }
  };

  return (
    <Select value={value} onValueChange={handleChange} disabled={disabled}>
      <SelectTrigger align="end" size={size} className={className ?? "text-xs"}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {currencies.map((currency) => (
          <SelectItem key={currency.id} value={currency.id} className="text-xs">
            {currency.code}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
