"use client";

import { useMemo, useState } from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { currenciesIso } from "@/constant/currencies-iso";

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
  const [open, setOpen] = useState(false);

  const selectedLabel = useMemo(() => {
    if (!value) return null;
    const found = currenciesIso.find((c) => c.code === value);
    return found ? `${found.code} — ${found.name}` : value;
  }, [value]);

  return (
    <Popover open={open} onOpenChange={setOpen} modal>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          aria-expanded={open}
          className={cn(
            "h-8 flex justify-between items-center pl-3 pr-1 text-sm font-normal",
            className,
          )}
          disabled={disabled}
        >
          <span className={cn(!selectedLabel && "text-muted-foreground")}>
            {selectedLabel ?? placeholder}
          </span>
          <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>

      <PopoverContent className="z-60 w-[--radix-popover-trigger-width] p-0">
        <Command
          filter={(value, search) => {
            if (!search) return 1;
            if (value.toLowerCase().includes(search.toLowerCase())) return 1;
            return 0;
          }}
        >
          <CommandInput
            placeholder="Search currency..."
            className="placeholder:text-xs"
          />
          <CommandList className="max-h-50">
            <CommandEmpty>No currencies found.</CommandEmpty>
            <CommandGroup>
              {currenciesIso.map((c) => (
                <CommandItem
                  key={c.code}
                  value={`${c.code} ${c.name} ${c.country}`}
                  onSelect={() => {
                    onValueChange(c.code);
                    setOpen(false);
                  }}
                  className="text-xs"
                >
                  {c.code} — {c.name}
                  <Check
                    className={cn(
                      "ml-auto h-4 w-4",
                      value === c.code ? "opacity-100" : "opacity-0",
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
