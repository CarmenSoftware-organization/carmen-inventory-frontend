"use client";

import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { useProfile } from "@/hooks/use-profile";
import { httpClient } from "@/lib/http-client";

interface ProductUnit {
  id: string;
  name: string;
  conversion: number;
}

interface LookupProductUnitProps {
  readonly productId: string;
  readonly value: string;
  readonly onValueChange: (value: string) => void;
  readonly disabled?: boolean;
  readonly placeholder?: string;
  readonly className?: string;
  readonly size?: "xs" | "sm" | "default";
}

export function LookupProductUnit({
  productId,
  value,
  onValueChange,
  disabled,
  placeholder = "Select unit",
  className,
  size = "sm",
}: LookupProductUnitProps) {
  const { buCode } = useProfile();

  const { data: units = [], isLoading } = useQuery<ProductUnit[]>({
    queryKey: ["product-units", buCode, productId],
    queryFn: async () => {
      if (!buCode || !productId) return [];
      const res = await httpClient.get(
        `/api/proxy/api/${buCode}/unit/order/product/${productId}`,
      );
      if (!res.ok) throw new Error("Failed to fetch product units");
      const json = await res.json();
      return json.data ?? [];
    },
    enabled: !!buCode && !!productId,
  });

  useEffect(() => {
    if (units.length > 0 && !value) {
      onValueChange(units[0].id);
    }
  }, [units, value, onValueChange]);

  return (
    <Select
      value={value}
      onValueChange={onValueChange}
      disabled={disabled || !productId}
    >
      <SelectTrigger size={size} align="end" className={className ?? "text-xs"}>
        {isLoading ? (
          <Loader2 className="size-3.5 animate-spin text-muted-foreground" />
        ) : (
          <SelectValue placeholder={placeholder} />
        )}
      </SelectTrigger>
      <SelectContent>
        {units.map((unit) => (
          <SelectItem key={unit.id} value={unit.id} className="text-xs">
            {unit.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
