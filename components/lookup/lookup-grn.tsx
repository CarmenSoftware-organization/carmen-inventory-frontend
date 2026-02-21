"use client";

import { useMemo } from "react";
import { ClipboardList } from "lucide-react";
import { useGoodsReceiveNote } from "@/hooks/use-goods-receive-note";
import { LookupCombobox } from "./lookup-combobox";

interface LookupGrnProps {
  readonly value: string;
  readonly onValueChange: (value: string) => void;
  readonly disabled?: boolean;
  readonly placeholder?: string;
  readonly className?: string;
}

export function LookupGrn({
  value,
  onValueChange,
  disabled,
  placeholder = "Select GRN",
  className,
}: LookupGrnProps) {
  const { data, isLoading } = useGoodsReceiveNote({ perpage: -1 });
  const grns = useMemo(() => data?.data ?? [], [data?.data]);

  return (
    <LookupCombobox
      value={value}
      onValueChange={(id) => onValueChange(id)}
      items={grns}
      getId={(g) => g.id}
      getLabel={(g) => g.invoice_no || g.id.slice(0, 8)}
      getSearchValue={(g) => g.invoice_no ?? g.id.slice(0, 8)}
      placeholder={placeholder}
      searchPlaceholder="Search GRN..."
      disabled={disabled}
      isLoading={isLoading}
      className={className}
      emptyIcon={ClipboardList}
      emptyTitle="No GRN found"
      emptyDescription="Try adjusting your search or filter to find what you're looking for."
    />
  );
}
