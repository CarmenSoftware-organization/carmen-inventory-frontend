"use client";

import { useMemo, useState } from "react";
import { Check, ChevronsUpDown, PackageSearch } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Command, CommandInput } from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { VirtualCommandList } from "@/components/ui/virtual-command-list";
import { useProductsByLocation } from "@/hooks/use-products-by-location";
import type { Product } from "@/types/product";
import EmptyComponent from "../empty-component";
import { Badge } from "../ui/badge";

interface LookupProductInLocationProps {
  readonly locationId: string;
  readonly value: string;
  readonly onValueChange: (value: string, product?: Product) => void;
  readonly disabled?: boolean;
  readonly placeholder?: string;
  readonly className?: string;
}

export function LookupProductInLocation({
  locationId,
  value,
  onValueChange,
  disabled,
  placeholder = "Select product",
  className,
}: LookupProductInLocationProps) {
  const { data: products = [] } = useProductsByLocation(
    locationId || undefined,
  );

  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const filteredProducts = useMemo(() => {
    if (!search) return products;
    const q = search.toLowerCase();
    return products.filter((p) => p.name.toLowerCase().includes(q));
  }, [products, search]);

  const selectedName = useMemo(() => {
    if (!value) return null;
    return products.find((p) => p.id === value)?.name ?? null;
  }, [value, products]);

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
          disabled={disabled || !locationId}
        >
          <span className={cn("truncate", !selectedName && "text-muted-foreground")}>
            {selectedName ?? placeholder}
          </span>
          <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>

      <PopoverContent className="p-0 w-90" align="start">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Search product..."
            className="placeholder:text-xs"
            value={search}
            onValueChange={setSearch}
          />
          <VirtualCommandList
            items={filteredProducts}
            emptyMessage={
              <EmptyComponent
                icon={PackageSearch}
                title="No product found"
                description="Try adjusting your search or filter to find what you're looking for."
              />
            }
          >
            {(product) => (
              <button
                type="button"
                aria-pressed={value === product.id}
                data-value={product.name}
                className={cn(
                  "relative flex items-start w-full cursor-default gap-2 rounded-sm px-2 py-1.5 text-xs outline-hidden select-none",
                  "hover:bg-accent hover:text-accent-foreground",
                  "focus:bg-accent focus:text-accent-foreground focus:outline-none",
                )}
                onClick={() => {
                  onValueChange(product.id, product);
                  setOpen(false);
                }}
              >
                <Badge size="xs" variant="secondary" className="shrink-0">
                  {product.code}
                </Badge>
                <span className="flex-1 text-left truncate">
                  {product.name}
                </span>
                <Check
                  className={cn(
                    "shrink-0 h-4 w-4",
                    value === product.id ? "opacity-100" : "opacity-0",
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
