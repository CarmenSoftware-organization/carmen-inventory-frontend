"use client";

import { useMemo } from "react";
import { Warehouse } from "lucide-react";
import { useUserLocation } from "@/hooks/use-user-location";
import { Badge } from "@/components/ui/badge";
import { LookupCombobox } from "./lookup-combobox";

interface LookupUserLocationProps {
  readonly value: string;
  readonly onValueChange: (value: string) => void;
  readonly disabled?: boolean;
  readonly placeholder?: string;
  readonly className?: string;
  readonly excludeIds?: Set<string>;
}

export function LookupUserLocation({
  value,
  onValueChange,
  disabled,
  placeholder = "Select location",
  className,
  excludeIds,
}: LookupUserLocationProps) {
  const { data, isLoading } = useUserLocation();
  const locations = useMemo(() => {
    const active = data?.filter((l) => l.is_active) ?? [];
    if (!excludeIds || excludeIds.size === 0) return active;
    return active.filter((l) => !excludeIds.has(l.id));
  }, [data, excludeIds]);

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
      isLoading={isLoading}
      className={className}
      popoverAlign="start"
      emptyIcon={Warehouse}
      emptyTitle="No locations"
      emptyDescription="No locations available"
    />
  );
}
