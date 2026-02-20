"use client";

import { useMemo, useState } from "react";
import { Check, ChevronsUpDown, ClipboardList, Loader2 } from "lucide-react";
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
import EmptyComponent from "../empty-component";

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
    return grns.filter((g) => (g.invoice_no ?? g.id.slice(0, 8)).toLowerCase().includes(q));
  }, [grns, search]);

  const selectedLabel = useMemo(() => {
    if (!value) return null;
    const found = grns.find((g) => g.id === value);
    if (!found) return null;
    return found.invoice_no || found.id.slice(0, 8);
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
              emptyMessage={
                <EmptyComponent
                  icon={ClipboardList}
                  title="No GRN found"
                  description="Try adjusting your search or filter to find what you're looking for."
                />
              }
            >
              {(grn) => (
                <button
                  type="button"
                  aria-pressed={value === grn.id}
                  data-value={grn.invoice_no ?? grn.id}
                  className={cn(
                    "relative flex w-full cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-xs outline-hidden select-none",
                    "hover:bg-accent hover:text-accent-foreground",
                    "focus:bg-accent focus:text-accent-foreground focus:outline-none",
                  )}
                  onClick={() => {
                    onValueChange(grn.id);
                    setOpen(false);
                  }}
                >
                  {grn.invoice_no || grn.id.slice(0, 8)}
                  <Check
                    className={cn(
                      "ml-auto h-4 w-4",
                      value === grn.id ? "opacity-100" : "opacity-0",
                    )}
                  />
                </button>
              )}
            </VirtualCommandList>
          )}
        </Command>
      </PopoverContent>
    </Popover>
  );
}
