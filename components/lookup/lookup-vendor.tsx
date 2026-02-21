"use client";

import { useMemo, useState } from "react";
import { Check, ChevronsUpDown, WarehouseIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Command, CommandInput } from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { VirtualCommandList } from "@/components/ui/virtual-command-list";
import { useVendor } from "@/hooks/use-vendor";
import type { Vendor } from "@/types/vendor";
import EmptyComponent from "../empty-component";

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
  const [search, setSearch] = useState("");

  const filteredVendors = useMemo(() => {
    if (!search) return vendors;
    const q = search.toLowerCase();
    return vendors.filter((v) => v.name.toLowerCase().includes(q));
  }, [vendors, search]);

  const selectedName = useMemo(() => {
    if (!value) return null;
    return (
      activeVendors.find((v) => v.id === value)?.name ?? defaultLabel ?? null
    );
  }, [value, activeVendors, defaultLabel]);

  return (
    <Popover
      open={open}
      onOpenChange={(o) => {
        setOpen(o);
        if (!o) setSearch("");
      }}
    >
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          aria-expanded={open}
          className={cn(
            "flex justify-between items-center pl-3 pr-1 text-sm",
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
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Search vendor..."
            className="placeholder:text-xs"
            value={search}
            onValueChange={setSearch}
          />
          <VirtualCommandList
            items={filteredVendors}
            emptyMessage={
              <EmptyComponent
                icon={WarehouseIcon}
                title="No vendor found"
                description="Try adjusting your search or filter to find what you're looking for."
              />
            }
          >
            {(vendor) => (
              <button
                type="button"
                aria-pressed={value === vendor.id}
                data-value={vendor.name}
                className={cn(
                  "relative flex w-full cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-xs outline-hidden select-none",
                  "hover:bg-accent hover:text-accent-foreground",
                  "focus:bg-accent focus:text-accent-foreground focus:outline-none",
                )}
                onClick={() => {
                  onValueChange(vendor.id);
                  onItemChange?.(vendor);
                  setOpen(false);
                }}
              >
                {vendor.name}
                <Check
                  className={cn(
                    "ml-auto h-4 w-4",
                    value === vendor.id ? "opacity-100" : "opacity-0",
                  )}
                />
              </button>
            )}
          </VirtualCommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
