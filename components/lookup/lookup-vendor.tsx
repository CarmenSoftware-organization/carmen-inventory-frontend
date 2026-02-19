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
import { useVendor } from "@/hooks/use-vendor";
import type { Vendor } from "@/types/vendor";

interface LookupVendorProps {
  readonly value: string;
  readonly onValueChange: (value: string) => void;
  readonly onItemChange?: (vendor: Vendor) => void;
  readonly excludeIds?: Set<string>;
  readonly disabled?: boolean;
  readonly placeholder?: string;
  readonly defaultLabel?: string;
  readonly className?: string;
}

export function LookupVendor({
  value,
  onValueChange,
  onItemChange,
  excludeIds,
  disabled,
  placeholder = "Select vendor",
  defaultLabel,
  className,
}: LookupVendorProps) {
  const { data } = useVendor({ perpage: -1 });
  const activeVendors = useMemo(
    () => data?.data?.filter((v) => v.is_active) ?? [],
    [data?.data],
  );

  const vendors = useMemo(() => {
    if (!excludeIds?.size) return activeVendors;
    return activeVendors.filter((v) => !excludeIds.has(v.id));
  }, [activeVendors, excludeIds]);

  const [open, setOpen] = useState(false);

  const selectedName = useMemo(() => {
    if (!value) return null;
    return activeVendors.find((v) => v.id === value)?.name ?? defaultLabel ?? null;
  }, [value, activeVendors, defaultLabel]);

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
          <span className={cn(!selectedName && "text-muted-foreground")}>
            {selectedName ?? placeholder}
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
            placeholder="Search vendor..."
            className="placeholder:text-xs"
          />
          <CommandList>
            <CommandEmpty>No vendors found.</CommandEmpty>
            <CommandGroup>
              {vendors.map((vendor) => (
                <CommandItem
                  key={vendor.id}
                  value={vendor.name}
                  onSelect={() => {
                    onValueChange(vendor.id);
                    onItemChange?.(vendor);
                    setOpen(false);
                  }}
                  className="text-xs"
                >
                  {vendor.name}
                  <Check
                    className={cn(
                      "ml-auto h-4 w-4",
                      value === vendor.id ? "opacity-100" : "opacity-0",
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
