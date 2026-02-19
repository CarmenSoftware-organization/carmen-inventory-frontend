"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Command, CommandInput } from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { VirtualCommandList } from "@/components/ui/virtual-command-list";
import { useProfile } from "@/hooks/use-profile";
import { httpClient } from "@/lib/http-client";
import type { Product } from "@/types/product";

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
  const { buCode } = useProfile();

  const { data: products = [] } = useQuery<Product[]>({
    queryKey: ["products-in-location", buCode, locationId],
    queryFn: async () => {
      if (!buCode || !locationId) return [];
      const res = await httpClient.get(
        `/api/proxy/api/${buCode}/products/locations/${locationId}`,
      );
      if (!res.ok) throw new Error("Failed to fetch products");
      const json = await res.json();
      return json.data ?? [];
    },
    enabled: !!buCode && !!locationId,
  });

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
    <Popover open={open} onOpenChange={(o) => { setOpen(o); if (!o) setSearch(""); }}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          aria-expanded={open}
          className={cn(
            "h-8 flex justify-between items-center pl-3 pr-1 text-sm",
            className,
          )}
          disabled={disabled || !locationId}
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
            placeholder="Search product..."
            className="placeholder:text-xs"
            value={search}
            onValueChange={setSearch}
          />
          <VirtualCommandList
            items={filteredProducts}
            emptyMessage="No products found."
          >
            {(product) => (
              <div
                role="option"
                aria-selected={value === product.id}
                data-value={product.name}
                className={cn(
                  "relative flex cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-xs outline-hidden select-none",
                  "hover:bg-accent hover:text-accent-foreground",
                )}
                onClick={() => {
                  onValueChange(product.id, product);
                  setOpen(false);
                }}
              >
                {product.name}
                <Check
                  className={cn(
                    "ml-auto h-4 w-4",
                    value === product.id ? "opacity-100" : "opacity-0",
                  )}
                />
              </div>
            )}
          </VirtualCommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
