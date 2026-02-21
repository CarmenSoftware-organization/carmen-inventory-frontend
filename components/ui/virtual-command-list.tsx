"use client";

import { useRef, type ReactNode } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";

interface VirtualCommandListProps<T> {
  readonly items: T[];
  readonly estimateSize?: number;
  readonly maxHeight?: number;
  readonly emptyMessage?: ReactNode;
  readonly children: (item: T, index: number) => ReactNode;
}

export function VirtualCommandList<T>({
  items,
  estimateSize = 32,
  maxHeight = 300,
  emptyMessage = "No results found.",
  children,
}: VirtualCommandListProps<T>) {
  const parentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => estimateSize,
    overscan: 5,
  });

  if (items.length === 0) {
    return (
      <div data-slot="command-empty" className="py-6 text-center text-sm">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div
      ref={parentRef}
      data-slot="command-list"
      className="overflow-x-hidden overflow-y-auto scroll-py-1 p-1"
      style={{ maxHeight }}
    >
      <div
        className="relative w-full"
        style={{ height: virtualizer.getTotalSize() }}
      >
        {virtualizer.getVirtualItems().map((virtualRow) => (
          <div
            key={virtualRow.key}
            className="absolute left-0 top-0 w-full"
            style={{ transform: `translateY(${virtualRow.start}px)` }}
          >
            {children(items[virtualRow.index], virtualRow.index)}
          </div>
        ))}
      </div>
    </div>
  );
}
