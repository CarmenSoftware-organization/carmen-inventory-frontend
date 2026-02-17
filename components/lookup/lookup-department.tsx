"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useDepartment } from "@/hooks/use-department";

interface LookupDepartmentProps {
  readonly value: string;
  readonly onValueChange: (value: string) => void;
  readonly disabled?: boolean;
  readonly placeholder?: string;
  readonly className?: string;
  readonly size?: "xs" | "sm" | "default";
}

export function LookupDepartment({
  value,
  onValueChange,
  disabled,
  placeholder = "Select department",
  className,
  size = "sm",
}: LookupDepartmentProps) {
  const { data } = useDepartment();
  const departments = data?.data ?? [];

  return (
    <Select value={value} onValueChange={onValueChange} disabled={disabled}>
      <SelectTrigger size={size} className={className ?? "text-xs"}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {departments.map((dept) => (
          <SelectItem key={dept.id} value={dept.id} className="text-xs">
            {dept.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
