"use client";

import { useMemo, useState } from "react";
import { Check, ChevronsUpDown, Warehouse } from "lucide-react";
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
import { useLocation } from "@/hooks/use-location";
import EmptyComponent from "../empty-component";

interface LookupLocationProps {
  readonly value: string;
  readonly onValueChange: (value: string) => void;
  readonly disabled?: boolean;
  readonly placeholder?: string;
  readonly className?: string;
  readonly excludeIds?: string[];
}

export function LookupLocation({
  value,
  onValueChange,
  disabled,
  placeholder = "Select location",
  className,
  excludeIds,
}: LookupLocationProps) {
  const { data } = useLocation({ perpage: -1 });

  const locations = useMemo(() => {
    const active = data?.data?.filter((l) => l.is_active) ?? [];
    if (!excludeIds || excludeIds.length === 0) return active;
    const excluded = new Set(excludeIds);
    return active.filter((l) => !excluded.has(l.id));
  }, [data?.data, excludeIds]);

  const [open, setOpen] = useState(false);

  const selectedName = useMemo(() => {
    if (!value) return null;
    return locations.find((l) => l.id === value)?.name ?? null;
  }, [value, locations]);

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
          <span
            className={cn(!selectedName && "text-muted-foreground text-xs")}
          >
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
            placeholder="Search location..."
            className="placeholder:text-xs"
          />
          <CommandList>
            <CommandEmpty>
              <EmptyComponent
                icon={Warehouse}
                title="No locations"
                description="No locations defined"
              />
            </CommandEmpty>
            <CommandGroup>
              {locations.map((location) => (
                <CommandItem
                  key={location.id}
                  value={location.name}
                  onSelect={() => {
                    onValueChange(location.id);
                    setOpen(false);
                  }}
                  className="text-xs"
                >
                  {location.name}
                  <Check
                    className={cn(
                      "ml-auto h-4 w-4",
                      value === location.id ? "opacity-100" : "opacity-0",
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
