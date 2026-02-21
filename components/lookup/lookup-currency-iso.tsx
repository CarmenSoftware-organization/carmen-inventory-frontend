"use client";

import { currenciesIso } from "@/constant/currencies-iso";
import { LookupCombobox } from "./lookup-combobox";

interface LookupCurrencyIsoProps {
  readonly value: string;
  readonly onValueChange: (value: string) => void;
  readonly disabled?: boolean;
  readonly placeholder?: string;
  readonly className?: string;
}

export function LookupCurrencyIso({
  value,
  onValueChange,
  disabled,
  placeholder = "Select currency code",
  className,
}: LookupCurrencyIsoProps) {
  return (
    <LookupCombobox
      value={value}
      onValueChange={(id) => onValueChange(id)}
      items={currenciesIso}
      getId={(c) => c.code}
      getLabel={(c) => `${c.code} — ${c.name}`}
      getSearchValue={(c) => `${c.code} ${c.name} ${c.country}`}
      renderSelected={(c) => `${c.code} — ${c.name}`}
      placeholder={placeholder}
      searchPlaceholder="Search currency..."
      disabled={disabled}
      className={className}
      modal
      popoverClassName="z-60"
    />
  );
}
