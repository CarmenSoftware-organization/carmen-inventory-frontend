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
import { useItemGroup } from "@/hooks/use-item-group";
import type { ItemGroupDto } from "@/types/category";

interface LookupItemGroupProps {
  readonly value: string;
  readonly onValueChange: (value: string, item?: ItemGroupDto) => void;
  readonly disabled?: boolean;
  readonly placeholder?: string;
  readonly className?: string;
}

export function LookupItemGroup({
  value,
  onValueChange,
  disabled,
  placeholder = "Select item group",
  className,
}: LookupItemGroupProps) {
  const { data } = useItemGroup({ perpage: -1 });
  const itemGroups = useMemo(
    () => data?.data?.filter((g) => g.is_active) ?? [],
    [data?.data],
  );

  const [open, setOpen] = useState(false);

  const selectedLabel = useMemo(() => {
    if (!value) return null;
    const found = itemGroups.find((g) => g.id === value);
    return found ? `${found.code} — ${found.name}` : null;
  }, [value, itemGroups]);

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
            placeholder="Search item group..."
            className="placeholder:text-xs"
          />
          <CommandList>
            <CommandEmpty>No item groups found.</CommandEmpty>
            <CommandGroup>
              <CommandItem
                value="__none__"
                onSelect={() => {
                  onValueChange("");
                  setOpen(false);
                }}
                className="text-xs"
              >
                None
                <Check
                  className={cn(
                    "ml-auto h-4 w-4",
                    !value ? "opacity-100" : "opacity-0",
                  )}
                />
              </CommandItem>
              {itemGroups.map((g) => (
                <CommandItem
                  key={g.id}
                  value={`${g.code} ${g.name}`}
                  onSelect={() => {
                    onValueChange(g.id, g);
                    setOpen(false);
                  }}
                  className="text-xs"
                >
                  {g.code} — {g.name}
                  <Check
                    className={cn(
                      "ml-auto h-4 w-4",
                      value === g.id ? "opacity-100" : "opacity-0",
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
