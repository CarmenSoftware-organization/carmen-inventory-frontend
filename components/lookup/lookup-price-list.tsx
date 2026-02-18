"use client";

import { useMemo, useState } from "react";
import { Check, ChevronsUpDown, Loader2 } from "lucide-react";
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
import { usePriceList } from "@/hooks/use-price-list";

interface LookupPriceListProps {
  readonly value: string;
  readonly onValueChange: (value: string) => void;
  readonly disabled?: boolean;
  readonly placeholder?: string;
  readonly className?: string;
}

export function LookupPriceList({
  value,
  onValueChange,
  disabled,
  placeholder = "Select price list",
  className,
}: LookupPriceListProps) {
  const { data, isLoading } = usePriceList({ perpage: -1 });
  const priceLists = useMemo(
    () => data?.data?.filter((p) => p.status === "active") ?? [],
    [data?.data],
  );

  const [open, setOpen] = useState(false);

  const selectedLabel = useMemo(() => {
    if (!value) return null;
    const found = priceLists.find((p) => p.id === value);
    return found ? `${found.name} — ${found.vendor.name}` : null;
  }, [value, priceLists]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          aria-expanded={open}
          className={cn(
            "h-8 flex justify-between items-center pl-3 pr-1 text-sm",
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

      <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
        <Command
          filter={(value, search) => {
            if (!search) return 1;
            if (value.toLowerCase().includes(search.toLowerCase())) return 1;
            return 0;
          }}
        >
          <CommandInput
            placeholder="Search price list..."
            className="placeholder:text-xs"
          />
          <CommandList>
            {isLoading ? (
              <div className="flex items-center justify-center py-3">
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <>
                <CommandEmpty>No price lists found.</CommandEmpty>
                <CommandGroup>
                  {priceLists.map((pl) => (
                    <CommandItem
                      key={pl.id}
                      value={`${pl.name} ${pl.vendor.name}`}
                      onSelect={() => {
                        onValueChange(pl.id);
                        setOpen(false);
                      }}
                      className="text-xs"
                    >
                      {pl.name} — {pl.vendor.name}
                      <Check
                        className={cn(
                          "ml-auto h-4 w-4",
                          value === pl.id ? "opacity-100" : "opacity-0",
                        )}
                      />
                    </CommandItem>
                  ))}
                </CommandGroup>
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
