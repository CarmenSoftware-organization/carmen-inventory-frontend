"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface StatusOption {
  value: string;
  label: string;
}

const DEFAULT_OPTIONS: StatusOption[] = [
  { label: "Active", value: "is_active|bool:true" },
  { label: "Inactive", value: "is_active|bool:false" },
];

interface Props {
  readonly value: string;
  readonly onChange: (value: string) => void;
  readonly placeholder?: string;
  readonly options?: StatusOption[];
  readonly className?: string;
}

export function StatusFilter({
  value,
  onChange,
  placeholder = "Status",
  options = DEFAULT_OPTIONS,
  className = "text-xs",
}: Props) {
  return (
    <Select
      value={value || "all"}
      onValueChange={(v) => onChange(v === "all" ? "" : v)}
    >
      <SelectTrigger size="sm" className={className} aria-label={`Filter by ${placeholder.toLowerCase()}`}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">All</SelectItem>
        {options.map((opt) => (
          <SelectItem className="text-xs" key={opt.value} value={opt.value}>
            {opt.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
