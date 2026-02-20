"use client";

import { useMemo, useState } from "react";
import { Check, ChevronsUpDown, Warehouse } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Command, CommandInput } from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { VirtualCommandList } from "@/components/ui/virtual-command-list";
import { useLocation } from "@/hooks/use-location";
import EmptyComponent from "../empty-component";
import { Badge } from "../ui/badge";

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
  const [search, setSearch] = useState("");

  const filteredLocations = useMemo(() => {
    if (!search) return locations;
    const q = search.toLowerCase();
    return locations.filter((l) => l.name.toLowerCase().includes(q));
  }, [locations, search]);

  const selectedName = useMemo(() => {
    if (!value) return null;
    return locations.find((l) => l.id === value)?.name ?? null;
  }, [value, locations]);

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
          <span
            className={cn(
              "truncate",
              !selectedName && "text-muted-foreground text-xs",
            )}
          >
            {selectedName ?? placeholder}
          </span>
          <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>

      <PopoverContent
        className="w-[--radix-popover-trigger-width] p-0"
        align="start"
      >
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Search location..."
            className="placeholder:text-xs"
            value={search}
            onValueChange={setSearch}
          />
          <VirtualCommandList
            items={filteredLocations}
            emptyMessage={
              <EmptyComponent
                icon={Warehouse}
                title="No locations"
                description="No locations defined"
              />
            }
          >
            {(location) => (
              <button
                type="button"
                aria-pressed={value === location.id}
                data-value={location.name}
                className={cn(
                  "relative flex w-full cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-xs outline-hidden select-none",
                  "hover:bg-accent hover:text-accent-foreground",
                  "focus:bg-accent focus:text-accent-foreground focus:outline-none",
                )}
                onClick={() => {
                  onValueChange(location.id);
                  setOpen(false);
                }}
              >
                <Badge size="xs" variant="secondary" className="shrink-0">
                  {location.code}
                </Badge>
                <span className="flex-1 text-left truncate">
                  {location.name}
                </span>
                <Check
                  className={cn(
                    "shrink-0 h-4 w-4",
                    value === location.id ? "opacity-100" : "opacity-0",
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
