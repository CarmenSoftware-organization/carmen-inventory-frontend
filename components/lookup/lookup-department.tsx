"use client";

import { useMemo } from "react";
import { useDepartment } from "@/hooks/use-department";
import { LookupCombobox } from "./lookup-combobox";

interface LookupDepartmentProps {
  readonly value: string;
  readonly onValueChange: (value: string) => void;
  readonly disabled?: boolean;
  readonly placeholder?: string;
  readonly className?: string;
}

export function LookupDepartment({
  value,
  onValueChange,
  disabled,
  placeholder = "Select department",
  className,
}: LookupDepartmentProps) {
  const { data } = useDepartment();
  const departments = useMemo(() => data?.data ?? [], [data?.data]);

  return (
    <LookupCombobox
      value={value}
      onValueChange={(id) => onValueChange(id)}
      items={departments}
      getId={(d) => d.id}
      getLabel={(d) => d.name}
      placeholder={placeholder}
      searchPlaceholder="Search department..."
      disabled={disabled}
      className={className}
    />
  );
}
