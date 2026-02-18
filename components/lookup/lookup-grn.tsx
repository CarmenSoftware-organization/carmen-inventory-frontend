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
import { useGoodsReceiveNote } from "@/hooks/use-goods-receive-note";

interface LookupGrnProps {
  readonly value: string;
  readonly onValueChange: (value: string) => void;
  readonly disabled?: boolean;
  readonly placeholder?: string;
  readonly className?: string;
}

export function LookupGrn({
  value,
  onValueChange,
  disabled,
  placeholder = "Select GRN",
  className,
}: LookupGrnProps) {
  const { data, isLoading } = useGoodsReceiveNote({ perpage: -1 });
  const grns = useMemo(() => data?.data ?? [], [data?.data]);

  const [open, setOpen] = useState(false);

  const selectedLabel = useMemo(() => {
    if (!value) return null;
    return grns.find((g) => g.id === value)?.grn_number ?? null;
  }, [value, grns]);

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
            placeholder="Search GRN..."
            className="placeholder:text-xs"
          />
          <CommandList>
            {isLoading ? (
              <div className="flex items-center justify-center py-3">
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <>
                <CommandEmpty>No GRNs found.</CommandEmpty>
                <CommandGroup>
                  {grns.map((grn) => (
                    <CommandItem
                      key={grn.id}
                      value={grn.grn_number}
                      onSelect={() => {
                        onValueChange(grn.id);
                        setOpen(false);
                      }}
                      className="text-xs"
                    >
                      {grn.grn_number}
                      <Check
                        className={cn(
                          "ml-auto h-4 w-4",
                          value === grn.id ? "opacity-100" : "opacity-0",
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
