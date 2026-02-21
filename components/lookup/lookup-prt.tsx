"use client";

import { useMemo, useState } from "react";
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
import { usePriceListTemplate } from "@/hooks/use-price-list-template";
import type { PriceListTemplate } from "@/types/price-list-template";

interface LookupPrtProps {
  readonly value: string;
  readonly onValueChange: (value: string, template?: PriceListTemplate) => void;
  readonly disabled?: boolean;
  readonly placeholder?: string;
  readonly className?: string;
}

export function LookupPrt({
  value,
  onValueChange,
  disabled,
  placeholder = "Select template",
  className,
}: LookupPrtProps) {
  const { data, isLoading } = usePriceListTemplate({ perpage: -1 });
  const templates = useMemo(
    () => data?.data?.filter((t) => t.status === "active") ?? [],
    [data?.data],
  );

  const [open, setOpen] = useState(false);

  const selectedName = useMemo(() => {
    if (!value) return null;
    return templates.find((t) => t.id === value)?.name ?? null;
  }, [value, templates]);

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
            placeholder="Search template..."
            className="placeholder:text-xs"
          />
          <CommandList>
            {isLoading ? (
              <div className="flex items-center justify-center py-3">
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <>
                <CommandEmpty>No templates found.</CommandEmpty>
                <CommandGroup>
                  {templates.map((template) => (
                    <CommandItem
                      key={template.id}
                      value={template.name}
                      onSelect={() => {
                        onValueChange(template.id, template);
                        setOpen(false);
                      }}
                      className="text-xs"
                    >
                      {template.name}
                      <Check
                        className={cn(
                          "ml-auto h-4 w-4",
                          value === template.id ? "opacity-100" : "opacity-0",
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
  );
}
