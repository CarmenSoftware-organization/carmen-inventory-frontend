"use client";

import { useMemo } from "react";
import { useRecipeCategory } from "@/hooks/use-recipe-category";
import { LookupCombobox } from "./lookup-combobox";

interface LookupRecipeCategoryProps {
  readonly value: string;
  readonly onValueChange: (value: string) => void;
  readonly disabled?: boolean;
  readonly placeholder?: string;
  readonly className?: string;
  readonly excludeIds?: Set<string>;
}

export function LookupRecipeCategory({
  value,
  onValueChange,
  disabled,
  placeholder = "Select category",
  className,
  excludeIds,
}: LookupRecipeCategoryProps) {
  const { data } = useRecipeCategory({ perpage: -1 });
  const categories = useMemo(
    () =>
      (data?.data ?? []).filter(
        (v) => v.is_active && (!excludeIds || !excludeIds.has(v.id)),
      ),
    [data?.data, excludeIds],
  );

  return (
    <LookupCombobox
      value={value}
      onValueChange={(id) => onValueChange(id)}
      items={categories}
      getId={(c) => c.id}
      getLabel={(c) => c.name}
      placeholder={placeholder}
      searchPlaceholder="Search category..."
      disabled={disabled}
      className={className}
    />
  );
}
