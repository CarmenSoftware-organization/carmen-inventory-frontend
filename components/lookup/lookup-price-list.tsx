"use client";

import { useMemo, useState } from "react";
import { Check, ChevronsUpDown, Loader2, Tags } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Command, CommandInput } from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { VirtualCommandList } from "@/components/ui/virtual-command-list";
import { usePriceList } from "@/hooks/use-price-list";
import EmptyComponent from "../empty-component";

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
  const [search, setSearch] = useState("");

  const filteredPriceLists = useMemo(() => {
    if (!search) return priceLists;
    const q = search.toLowerCase();
    return priceLists.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.vendor.name.toLowerCase().includes(q),
    );
  }, [priceLists, search]);

  const selectedLabel = useMemo(() => {
    if (!value) return null;
    const found = priceLists.find((p) => p.id === value);
    return found ? `${found.name} — ${found.vendor.name}` : null;
  }, [value, priceLists]);

  return (
    <Popover open={open} onOpenChange={(o) => { setOpen(o); if (!o) setSearch(""); }}>
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
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Search price list..."
            className="placeholder:text-xs"
            value={search}
            onValueChange={setSearch}
          />
          {isLoading ? (
            <div className="flex items-center justify-center py-3">
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <VirtualCommandList
              items={filteredPriceLists}
              emptyMessage={
                <EmptyComponent
                  icon={Tags}
                  title="No price list found"
                  description="Try adjusting your search or filter to find what you're looking for."
                />
              }
            >
              {(pl) => (
                <button
                  type="button"
                  aria-pressed={value === pl.id}
                  data-value={`${pl.name} ${pl.vendor.name}`}
                  className={cn(
                    "relative flex w-full cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-xs outline-hidden select-none",
                    "hover:bg-accent hover:text-accent-foreground",
                    "focus:bg-accent focus:text-accent-foreground focus:outline-none",
                  )}
                  onClick={() => {
                    onValueChange(pl.id);
                    setOpen(false);
                  }}
                >
                  {pl.name} — {pl.vendor.name}
                  <Check
                    className={cn(
                      "ml-auto h-4 w-4",
                      value === pl.id ? "opacity-100" : "opacity-0",
                    )}
                  />
                </button>
              )}
            </VirtualCommandList>
          )}
        </Command>
      </PopoverContent>
    </Popover>
  );
}
