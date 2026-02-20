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
import { useDeliveryPoint } from "@/hooks/use-delivery-point";

interface LookupDeliveryPointProps {
  readonly value: string;
  readonly onValueChange: (value: string) => void;
  readonly disabled?: boolean;
  readonly placeholder?: string;
  readonly className?: string;
}

export function LookupDeliveryPoint({
  value,
  onValueChange,
  disabled,
  placeholder = "Select delivery point",
  className,
}: LookupDeliveryPointProps) {
  const { data } = useDeliveryPoint({ perpage: -1 });
  const deliveryPoints = useMemo(
    () => data?.data?.filter((d) => d.is_active) ?? [],
    [data?.data],
  );

  const [open, setOpen] = useState(false);

  const selectedName = useMemo(() => {
    if (!value) return null;
    return deliveryPoints.find((d) => d.id === value)?.name ?? null;
  }, [value, deliveryPoints]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
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
        <Command
          filter={(value, search) => {
            if (!search) return 1;
            if (value.toLowerCase().includes(search.toLowerCase())) return 1;
            return 0;
          }}
        >
          <CommandInput
            placeholder="Search delivery point..."
            className="placeholder:text-xs"
          />
          <CommandList>
            <CommandEmpty>No delivery points found.</CommandEmpty>
            <CommandGroup>
              {deliveryPoints.map((dp) => (
                <CommandItem
                  key={dp.id}
                  value={dp.name}
                  onSelect={() => {
                    onValueChange(dp.id);
                    setOpen(false);
                  }}
                  className="text-xs"
                >
                  {dp.name}
                  <Check
                    className={cn(
                      "ml-auto h-4 w-4",
                      value === dp.id ? "opacity-100" : "opacity-0",
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
