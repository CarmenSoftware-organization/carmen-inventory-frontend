"use client";

import { useMemo } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCnReason } from "@/hooks/use-cn-reason";

interface LookupCnReasonProps {
  readonly value: string;
  readonly onValueChange: (value: string) => void;
  readonly disabled?: boolean;
  readonly placeholder?: string;
  readonly className?: string;
  readonly size?: "xs" | "sm" | "default";
}

export function LookupCnReason({
  value,
  onValueChange,
  disabled,
  placeholder = "Select cn reason",
  className,
  size = "sm",
}: LookupCnReasonProps) {
  const { data } = useCnReason({ perpage: -1 });
  const reasons = useMemo(
    () => data?.data?.filter((r) => r.is_active) ?? [],
    [data?.data],
  );

  return (
    <Select value={value} onValueChange={onValueChange} disabled={disabled}>
      <SelectTrigger size={size} className={className ?? "h-8 w-full text-sm"}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {reasons.map((reason) => (
          <SelectItem key={reason.id} value={reason.id} className="text-xs">
            {reason.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
