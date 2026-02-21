"use client";

import { useMemo } from "react";
import { Warehouse } from "lucide-react";
import { useLocation } from "@/hooks/use-location";
import { Badge } from "@/components/ui/badge";
import { LookupCombobox } from "./lookup-combobox";

interface LookupLocationProps {
  readonly value: string;
  readonly onValueChange: (value: string) => void;
  readonly disabled?: boolean;
  readonly placeholder?: string;
  readonly className?: string;
  readonly excludeIds?: string[];
}

export function LookupLocation({
  value,
  onValueChange,
  disabled,
  placeholder = "Select location",
  className,
  excludeIds,
}: LookupLocationProps) {
  const { data } = useLocation({ perpage: -1 });
  const locations = useMemo(() => {
    const active = data?.data?.filter((l) => l.is_active) ?? [];
    if (!excludeIds || excludeIds.length === 0) return active;
    const excluded = new Set(excludeIds);
    return active.filter((l) => !excluded.has(l.id));
  }, [data?.data, excludeIds]);

  return (
    <LookupCombobox
      value={value}
      onValueChange={(id) => onValueChange(id)}
      items={locations}
      getId={(l) => l.id}
      getLabel={(l) => l.name}
      renderItem={(l) => (
        <>
          <Badge size="xs" variant="secondary" className="shrink-0">
            {l.code}
          </Badge>
          <span className="flex-1 text-left truncate">{l.name}</span>
        </>
      )}
      placeholder={placeholder}
      searchPlaceholder="Search location..."
      disabled={disabled}
      className={className}
      popoverAlign="start"
      emptyIcon={Warehouse}
      emptyTitle="No locations"
      emptyDescription="No locations defined"
    />
  );
}
