"use client";

import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
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
import { useProfile } from "@/hooks/use-profile";
import { httpClient } from "@/lib/http-client";

interface ProductUnit {
  id: string;
  name: string;
  conversion: number;
}

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
  const { buCode } = useProfile();

  const { data: units = [], isLoading } = useQuery<ProductUnit[]>({
    queryKey: ["product-units", buCode, productId],
    queryFn: async () => {
      if (!buCode || !productId) return [];
      const res = await httpClient.get(
        `/api/proxy/api/${buCode}/unit/order/product/${productId}`,
      );
      if (!res.ok) throw new Error("Failed to fetch product units");
      const json = await res.json();
      return json.data ?? [];
    },
    enabled: !!buCode && !!productId,
  });

  useEffect(() => {
    if (units.length > 0 && !value) {
      onValueChange(units[0].id);
    }
  }, [units, value, onValueChange]);

  const [open, setOpen] = useState(false);

  const selectedName = useMemo(() => {
    if (!value) return null;
    return units.find((u) => u.id === value)?.name ?? null;
  }, [value, units]);

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
        <Command
          filter={(value, search) => {
            if (!search) return 1;
            if (value.toLowerCase().includes(search.toLowerCase())) return 1;
            return 0;
          }}
        >
          <CommandInput
            placeholder="Search unit..."
            className="placeholder:text-xs"
          />
          <CommandList>
            <CommandEmpty>No units found.</CommandEmpty>
            <CommandGroup>
              {units.map((unit) => (
                <CommandItem
                  key={unit.id}
                  value={unit.name}
                  onSelect={() => {
                    onValueChange(unit.id);
                    setOpen(false);
                  }}
                  className="text-xs"
                >
                  {unit.name}
                  <Check
                    className={cn(
                      "ml-auto h-4 w-4",
                      value === unit.id ? "opacity-100" : "opacity-0",
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
