"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCurrency } from "@/hooks/use-currency";

interface LookupCurrencyProps {
  readonly value: string;
  readonly onValueChange: (value: string) => void;
  readonly disabled?: boolean;
  readonly placeholder?: string;
  readonly className?: string;
  readonly size?: "xs" | "sm" | "default";
}

export function LookupCurrency({
  value,
  onValueChange,
  disabled,
  placeholder = "Select currency",
  className,
  size = "sm",
}: LookupCurrencyProps) {
  const { data } = useCurrency({ perpage: 9999 });
  const currencies = data?.data?.filter((c) => c.is_active) ?? [];

  return (
    <Select value={value} onValueChange={onValueChange} disabled={disabled}>
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
