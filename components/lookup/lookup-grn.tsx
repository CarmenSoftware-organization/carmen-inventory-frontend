"use client";

import { useMemo, useState } from "react";
import { Check, ChevronsUpDown, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Command, CommandInput } from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { VirtualCommandList } from "@/components/ui/virtual-command-list";
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
  const [search, setSearch] = useState("");

  const filteredGrns = useMemo(() => {
    if (!search) return grns;
    const q = search.toLowerCase();
    return grns.filter((g) => g.grn_number.toLowerCase().includes(q));
  }, [grns, search]);

  const selectedLabel = useMemo(() => {
    if (!value) return null;
    return grns.find((g) => g.id === value)?.grn_number ?? null;
  }, [value, grns]);

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
          disabled={disabled}
        >
          <span className={cn(!selectedLabel && "text-muted-foreground")}>
            {selectedLabel ?? placeholder}
          </span>
          <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Search GRN..."
            className="placeholder:text-xs"
            value={search}
            onValueChange={setSearch}
          />
          {isLoading ? (
            <div className="flex items-center justify-center py-3">
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <VirtualCommandList
              items={filteredGrns}
              emptyMessage="No GRNs found."
            >
              {(grn) => (
                <div
                  role="option"
                  aria-selected={value === grn.id}
                  data-value={grn.grn_number}
                  className={cn(
                    "relative flex cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-xs outline-hidden select-none",
                    "hover:bg-accent hover:text-accent-foreground",
                  )}
                  onClick={() => {
                    onValueChange(grn.id);
                    setOpen(false);
                  }}
                >
                  {grn.grn_number}
                  <Check
                    className={cn(
                      "ml-auto h-4 w-4",
                      value === grn.id ? "opacity-100" : "opacity-0",
                    )}
                  />
                </div>
              )}
            </VirtualCommandList>
          )}
        </Command>
      </PopoverContent>
    </Popover>
  );
}
