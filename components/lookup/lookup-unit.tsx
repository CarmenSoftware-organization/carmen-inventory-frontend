"use client";

import { useMemo, useState } from "react";
import { Check, ChevronsUpDown, Loader2, Plus } from "lucide-react";
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
import { UnitDialog } from "@/components/share/unit-dialog";
import { useUnit } from "@/hooks/use-unit";

interface LookupUnitProps {
  readonly value: string;
  readonly onValueChange: (value: string) => void;
  readonly disabled?: boolean;
  readonly placeholder?: string;
  readonly className?: string;
  readonly excludeIds?: string[];
}

export function LookupUnit({
  value,
  onValueChange,
  disabled,
  placeholder = "Select unit",
  className,
  excludeIds,
}: LookupUnitProps) {
  const { data, isLoading } = useUnit({ perpage: -1 });
  const units = useMemo(() => {
    const active = data?.data?.filter((u) => u.is_active) ?? [];
    if (!excludeIds || excludeIds.length === 0) return active;
    const excluded = new Set(excludeIds);
    return active.filter((u) => !excluded.has(u.id));
  }, [data, excludeIds]);

  const [open, setOpen] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  const selectedName = useMemo(() => {
    if (!value) return null;
    return units.find((u) => u.id === value)?.name ?? null;
  }, [value, units]);

  return (
    <>
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
            <div className="relative w-full">
              <CommandInput
                placeholder="Search unit..."
                className="w-full pr-8 placeholder:text-xs"
              />
              <Button
                size="xs"
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1"
                onClick={() => setDialogOpen(true)}
                type="button"
                aria-label="Add new unit"
              >
                <Plus className="h-3 w-3" />
              </Button>
            </div>
            <CommandList>
              {isLoading ? (
                <div className="flex items-center justify-center py-3">
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <>
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
                </>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      <UnitDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSuccess={(id) => onValueChange(id)}
      />
    </>
  );
}
