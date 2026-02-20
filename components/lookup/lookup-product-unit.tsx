"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, ChevronsUpDown, Loader2, Ruler } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Command, CommandInput } from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { VirtualCommandList } from "@/components/ui/virtual-command-list";
import { useProductUnits } from "@/hooks/use-product-units";
import EmptyComponent from "../empty-component";

interface LookupProductUnitProps {
  readonly productId: string;
  readonly value: string;
  readonly onValueChange: (value: string) => void;
  readonly disabled?: boolean;
  readonly placeholder?: string;
  readonly className?: string;
}

export function LookupProductUnit({
  productId,
  value,
  onValueChange,
  disabled,
  placeholder = "Select unit",
  className,
}: LookupProductUnitProps) {
  const { data: units = [], isLoading } = useProductUnits(
    productId || undefined,
  );

  useEffect(() => {
    if (units.length > 0 && !value) {
      onValueChange(units[0].id);
    }
  }, [units, value, onValueChange]);

  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const filteredUnits = useMemo(() => {
    if (!search) return units;
    const q = search.toLowerCase();
    return units.filter((u) => u.name.toLowerCase().includes(q));
  }, [units, search]);

  const selectedName = useMemo(() => {
    if (!value) return null;
    return units.find((u) => u.id === value)?.name ?? null;
  }, [value, units]);

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
            "h-8 flex justify-between items-center pl-3 pr-1 text-sm",
            className,
          )}
          disabled={disabled || !productId}
        >
          {isLoading ? (
            <Loader2 className="size-3.5 animate-spin text-muted-foreground" />
          ) : (
            <span className={cn(!selectedName && "text-muted-foreground")}>
              {selectedName ?? placeholder}
            </span>
          )}
          <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Search unit..."
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
              items={filteredUnits}
              emptyMessage={
                <EmptyComponent
                  icon={Ruler}
                  title="No unit found"
                  description="Try adjusting your search or filter to find what you're looking for."
                />
              }
            >
              {(unit) => (
                <button
                  type="button"
                  aria-pressed={value === unit.id}
                  data-value={unit.name}
                  className={cn(
                    "relative flex w-full cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-xs outline-hidden select-none",
                    "hover:bg-accent hover:text-accent-foreground",
                    "focus:bg-accent focus:text-accent-foreground focus:outline-none",
                  )}
                  onClick={() => {
                    onValueChange(unit.id);
                    setOpen(false);
                  }}
                >
                  {unit.name}
                  <Check
                    className={cn(
                      "ml-auto h-4 w-4",
                      value === unit.id ? "opacity-100" : "opacity-0",
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
