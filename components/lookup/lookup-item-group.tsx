"use client";

import { useMemo } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useItemGroup } from "@/hooks/use-item-group";
import type { ItemGroupDto } from "@/types/category";

interface LookupItemGroupProps {
  readonly value: string;
  readonly onValueChange: (value: string, item?: ItemGroupDto) => void;
  readonly disabled?: boolean;
  readonly placeholder?: string;
  readonly className?: string;
  readonly size?: "xs" | "sm" | "default";
}

export function LookupItemGroup({
  value,
  onValueChange,
  disabled,
  placeholder = "Select item group",
  className,
  size = "sm",
}: LookupItemGroupProps) {
  const { data } = useItemGroup({ perpage: -1 });
  const itemGroups = useMemo(
    () => data?.data?.filter((g) => g.is_active) ?? [],
    [data?.data],
  );

  return (
    <Select
      value={value || "none"}
      onValueChange={(v) => {
        const id = v === "none" ? "" : v;
        const item = itemGroups.find((g) => g.id === id);
        onValueChange(id, item);
      }}
      disabled={disabled}
    >
      <SelectTrigger size={size} className={className ?? "h-8 w-full text-sm"}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="none">None</SelectItem>
        {itemGroups.map((g) => (
          <SelectItem key={g.id} value={g.id}>
            {g.code} — {g.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
