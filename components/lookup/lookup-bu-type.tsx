"use client";

import { useMemo, useState } from "react";
import { Check, ChevronsUpDown, Loader2, RadioTower, X } from "lucide-react";
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
import { Badge } from "@/components/ui/badge";
import { useBusinessType } from "@/hooks/use-business-type";
import type { BusinessType } from "@/types/business-type";
import EmptyComponent from "../empty-component";

interface LookupBuTypeProps {
  readonly value?: { id: string; name: string }[];
  readonly onValueChange: (value: { id: string; name: string }[]) => void;
  readonly disabled?: boolean;
  readonly placeholder?: string;
  readonly className?: string;
}

export function LookupBuType({
  value = [],
  onValueChange,
  disabled,
  placeholder = "Select business type",
  className,
}: LookupBuTypeProps) {
  const { data, isLoading } = useBusinessType({ perpage: -1 });
  const businessTypes = useMemo(
    () => data?.data?.filter((b) => b.is_active) ?? [],
    [data?.data],
  );

  const [open, setOpen] = useState(false);

  const handleSelect = (bt: BusinessType) => {
    const isSelected = value.some((item) => item.id === bt.id);
    if (isSelected) {
      onValueChange(value.filter((item) => item.id !== bt.id));
    } else {
      onValueChange([...value, { id: bt.id, name: bt.name }]);
    }
  };

  const handleRemove = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    onValueChange(value.filter((item) => item.id !== id));
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          aria-expanded={open}
          className={cn(
            "h-auto min-h-8 flex justify-between items-center pl-3 pr-1 text-sm py-1",
            className,
          )}
          disabled={disabled}
        >
          <div className="flex flex-wrap gap-1">
            {value.length > 0 ? (
              value.map((item) => (
                <Badge key={item.id} variant="secondary" size="sm">
                  {item.name}
                  <button
                    type="button"
                    aria-label={`Remove ${item.name}`}
                    className="ml-1 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                    onClick={(e) => handleRemove(e, item.id)}
                  >
                    <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                  </button>
                </Badge>
              ))
            ) : (
              <span className="text-muted-foreground">{placeholder}</span>
            )}
          </div>
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
            placeholder="Search business type..."
            className="placeholder:text-xs"
          />
          <CommandList>
            {isLoading ? (
              <div className="flex items-center justify-center py-3">
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <>
                <CommandEmpty>
                  <EmptyComponent
                    title="No business types found"
                    icon={RadioTower}
                  />
                </CommandEmpty>
                <CommandGroup>
                  {businessTypes.map((bt) => {
                    const isSelected = value.some((item) => item.id === bt.id);
                    return (
                      <CommandItem
                        key={bt.id}
                        value={bt.name}
                        onSelect={() => handleSelect(bt)}
                        className="text-xs"
                      >
                        <div
                          className={cn(
                            "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                            isSelected
                              ? "bg-primary text-primary-foreground"
                              : "opacity-50 [&_svg]:invisible",
                          )}
                        >
                          <Check className="h-4 w-4" />
                        </div>
                        {bt.name}
                      </CommandItem>
                    );
                  })}
                </CommandGroup>
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
