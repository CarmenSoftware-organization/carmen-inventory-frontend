"use client";

import { useQuery } from "@tanstack/react-query";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useProfile } from "@/hooks/use-profile";
import { httpClient } from "@/lib/http-client";
import type { Product } from "@/types/product";

interface LookupProductInLocationProps {
  readonly locationId: string;
  readonly value: string;
  readonly onValueChange: (value: string, product?: Product) => void;
  readonly disabled?: boolean;
  readonly placeholder?: string;
  readonly className?: string;
  readonly size?: "xs" | "sm" | "default";
}

export function LookupProductInLocation({
  locationId,
  value,
  onValueChange,
  disabled,
  placeholder = "Select product",
  className,
  size = "sm",
}: LookupProductInLocationProps) {
  const { buCode } = useProfile();

  const { data: products = [] } = useQuery<Product[]>({
    queryKey: ["products-in-location", buCode, locationId],
    queryFn: async () => {
      if (!buCode || !locationId) return [];
      const res = await httpClient.get(
        `/api/proxy/api/${buCode}/products/locations/${locationId}`,
      );
      if (!res.ok) throw new Error("Failed to fetch products");
      const json = await res.json();
      return json.data ?? [];
    },
    enabled: !!buCode && !!locationId,
  });

  return (
    <Select
      value={value}
      onValueChange={(val) => {
        const product = products.find((p) => p.id === val);
        onValueChange(val, product);
      }}
      disabled={disabled || !locationId}
    >
      <SelectTrigger size={size} className={className ?? "text-xs"}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {products.map((product) => (
          <SelectItem key={product.id} value={product.id} className="text-xs">
            {product.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
