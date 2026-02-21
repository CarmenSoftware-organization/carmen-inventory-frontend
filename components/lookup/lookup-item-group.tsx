"use client";

import { useMemo } from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { useItemGroup } from "@/hooks/use-item-group";
import type { ItemGroupDto } from "@/types/category";
import { Badge } from "@/components/ui/badge";
import { LookupCombobox } from "./lookup-combobox";

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

  return (
    <LookupCombobox
      value={value}
      onValueChange={onValueChange}
      items={itemGroups}
      getId={(g) => g.id}
      getLabel={(g) => g.name}
      getSearchValue={(g) => `${g.code} ${g.name}`}
      renderItem={(g) => (
        <>
          <Badge size="xs" variant="secondary">
            {g.code}
          </Badge>
          - {g.name}
        </>
      )}
      placeholder={placeholder}
      searchPlaceholder="Search item group..."
      disabled={disabled}
      className={className}
      emptyTitle="No item groups"
      emptyDescription="No item groups defined"
      prependItems={
        <button
          type="button"
          aria-pressed={!value}
          className={cn(
            "relative flex w-full cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-xs outline-hidden select-none",
            "hover:bg-accent hover:text-accent-foreground",
          )}
          onClick={() => onValueChange("")}
        >
          None
          <Check
            className={cn(
              "ml-auto h-4 w-4 shrink-0",
              value ? "opacity-0" : "opacity-100",
            )}
          />
        </button>
      }
    />
  );
}
