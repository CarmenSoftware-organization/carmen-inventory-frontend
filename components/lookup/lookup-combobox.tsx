"use client";

import { useMemo, useState, type ReactNode } from "react";
import { Check, ChevronsUpDown, Loader2, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Command, CommandInput } from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { VirtualCommandList } from "@/components/ui/virtual-command-list";
import EmptyComponent from "@/components/empty-component";

interface LookupComboboxProps<T> {
  readonly value: string;
  readonly onValueChange: (value: string, item?: T) => void;
  readonly items: T[];
  readonly getId: (item: T) => string;
  readonly getLabel: (item: T) => string;
  readonly placeholder?: string;
  readonly searchPlaceholder?: string;
  readonly className?: string;
  readonly disabled?: boolean;
  readonly isLoading?: boolean;
  readonly getSearchValue?: (item: T) => string;
  readonly renderItem?: (item: T) => ReactNode;
  readonly renderSelected?: (item: T) => string;
  readonly emptyIcon?: LucideIcon;
  readonly emptyTitle?: string;
  readonly emptyDescription?: string;
  readonly headerSlot?: ReactNode;
  readonly prependItems?: ReactNode;
  readonly popoverWidth?: string;
  readonly popoverAlign?: "start" | "center" | "end";
  readonly popoverClassName?: string;
  readonly modal?: boolean;
  readonly size?: "xs" | "sm";
}

export function LookupCombobox<T>({
  value,
  onValueChange,
  items,
  getId,
  getLabel,
  placeholder = "Select...",
  searchPlaceholder = "Search...",
  className,
  disabled,
  isLoading,
  getSearchValue,
  renderItem,
  renderSelected,
  emptyIcon,
  emptyTitle,
  emptyDescription,
  headerSlot,
  prependItems,
  popoverWidth = "w-[--radix-popover-trigger-width]",
  popoverAlign,
  popoverClassName,
  modal,
  size = "sm",
}: LookupComboboxProps<T>) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const searchFn = getSearchValue ?? getLabel;

  const filteredItems = useMemo(() => {
    if (!search) return items;
    const q = search.toLowerCase();
    return items.filter((item) => searchFn(item).toLowerCase().includes(q));
  }, [items, search, searchFn]);

  const selectedLabel = useMemo(() => {
    if (!value) return null;
    const found = items.find((item) => getId(item) === value);
    if (!found) return null;
    return renderSelected ? renderSelected(found) : getLabel(found);
  }, [value, items, getId, getLabel, renderSelected]);

  return (
    <Popover
      open={open}
      onOpenChange={(o) => {
        setOpen(o);
        if (!o) setSearch("");
      }}
      modal={modal}
    >
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          aria-expanded={open}
          className={cn(
            "flex justify-between items-center pl-3 pr-1 text-sm",
            size === "sm" && "h-8",
            size === "xs" && "h-6 px-2 text-[11px] gap-1",
            className,
          )}
          disabled={disabled}
        >
          {isLoading ? (
            <Loader2 className="size-3.5 animate-spin text-muted-foreground" />
          ) : (
            <span
              className={cn(
                "truncate",
                !selectedLabel && "text-muted-foreground text-xs",
              )}
            >
              {selectedLabel ?? placeholder}
            </span>
          )}
          <ChevronsUpDown
            className={cn(
              "shrink-0 opacity-50",
              size === "xs" ? "size-3" : "h-4 w-4",
            )}
          />
        </Button>
      </PopoverTrigger>

      <PopoverContent
        className={cn(popoverWidth, "p-0", popoverClassName)}
        align={popoverAlign}
      >
        <Command shouldFilter={false}>
          <div className="relative w-full">
            <CommandInput
              placeholder={searchPlaceholder}
              className={cn("placeholder:text-xs", headerSlot && "pr-8")}
              value={search}
              onValueChange={setSearch}
            />
            {headerSlot}
          </div>
          {isLoading ? (
            <div className="flex items-center justify-center py-3">
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <>
              {prependItems}
              <VirtualCommandList
                items={filteredItems}
                emptyMessage={
                  <EmptyComponent
                    icon={emptyIcon}
                    title={emptyTitle}
                    description={emptyDescription}
                  />
                }
              >
                {(item) => (
                  <button
                    type="button"
                    aria-pressed={value === getId(item)}
                    data-value={searchFn(item)}
                    className={cn(
                      "relative flex w-full cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-xs outline-hidden select-none",
                      "hover:bg-accent hover:text-accent-foreground",
                      "focus:bg-accent focus:text-accent-foreground focus:outline-none",
                    )}
                    onClick={() => {
                      onValueChange(getId(item), item);
                      setOpen(false);
                    }}
                  >
                    {renderItem ? renderItem(item) : getLabel(item)}
                    <Check
                      className={cn(
                        "ml-auto h-4 w-4 shrink-0",
                        value === getId(item) ? "opacity-100" : "opacity-0",
                      )}
                    />
                  </button>
                )}
              </VirtualCommandList>
            </>
          )}
        </Command>
      </PopoverContent>
    </Popover>
  );
}
