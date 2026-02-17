"use client";

import { useMemo } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useProduct } from "@/hooks/use-product";
import type { Product } from "@/types/product";

interface LookupProductProps {
  readonly value: string;
  readonly onValueChange: (value: string, product?: Product) => void;
  readonly disabled?: boolean;
  readonly placeholder?: string;
  readonly className?: string;
  readonly size?: "xs" | "sm" | "default";
}

export function LookupProduct({
  value,
  onValueChange,
  disabled,
  placeholder = "Select product",
  className,
  size = "sm",
}: LookupProductProps) {
  const { data } = useProduct({ perpage: 9999 });
  const products = useMemo(
    () =>
      data?.data?.filter((p) => p.product_status_type === "active") ?? [],
    [data?.data],
  );

  return (
    <Select
      value={value}
      onValueChange={(val) => {
        const product = products.find((p) => p.id === val);
        onValueChange(val, product);
      }}
      disabled={disabled}
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
