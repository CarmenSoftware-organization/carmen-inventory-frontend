"use client";

import { useState, useMemo } from "react";
import { ChevronRight, ChevronLeft, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

export interface TransferItem {
  key: string;
  title: string;
}

export interface TransferProps {
  dataSource: TransferItem[];
  targetKeys: string[];
  onChange: (
    nextTargetKeys: string[],
    direction: "left" | "right",
    moveKeys: string[],
  ) => void;
  disabled?: boolean;
  loading?: boolean;
  titles?: [string, string];
}

export function Transfer({
  dataSource,
  targetKeys,
  onChange,
  disabled = false,
  loading = false,
  titles = ["Available", "Selected"],
}: TransferProps) {
  const [leftChecked, setLeftChecked] = useState<Set<string>>(new Set());
  const [rightChecked, setRightChecked] = useState<Set<string>>(new Set());
  const [leftSearch, setLeftSearch] = useState("");
  const [rightSearch, setRightSearch] = useState("");

  const targetKeySet = useMemo(() => new Set(targetKeys), [targetKeys]);

  const leftItems = useMemo(
    () =>
      dataSource.filter(
        (item) =>
          !targetKeySet.has(item.key) &&
          item.title.toLowerCase().includes(leftSearch.toLowerCase()),
      ),
    [dataSource, targetKeySet, leftSearch],
  );

  const rightItems = useMemo(
    () =>
      dataSource.filter(
        (item) =>
          targetKeySet.has(item.key) &&
          item.title.toLowerCase().includes(rightSearch.toLowerCase()),
      ),
    [dataSource, targetKeySet, rightSearch],
  );

  const leftTotal = dataSource.filter(
    (item) => !targetKeySet.has(item.key),
  ).length;
  const rightTotal = targetKeys.length;

  const moveRight = () => {
    const moveKeys = Array.from(leftChecked);
    const nextTargetKeys = [...targetKeys, ...moveKeys];
    onChange(nextTargetKeys, "right", moveKeys);
    setLeftChecked(new Set());
  };

  const moveLeft = () => {
    const moveKeys = Array.from(rightChecked);
    const nextTargetKeys = targetKeys.filter((k) => !rightChecked.has(k));
    onChange(nextTargetKeys, "left", moveKeys);
    setRightChecked(new Set());
  };

  return (
    <div className="flex items-stretch gap-2">
      <TransferPanel
        title={titles[0]}
        items={leftItems}
        checkedKeys={leftChecked}
        onCheckedChange={setLeftChecked}
        search={leftSearch}
        onSearchChange={setLeftSearch}
        disabled={disabled}
        loading={loading}
        totalCount={leftTotal}
      />
      <div className="flex flex-col items-center justify-center gap-1">
        <Button
          type="button"
          variant="outline"
          size="icon-xs"
          onClick={moveRight}
          disabled={disabled || leftChecked.size === 0}
        >
          <ChevronRight />
        </Button>
        <Button
          type="button"
          variant="outline"
          size="icon-xs"
          onClick={moveLeft}
          disabled={disabled || rightChecked.size === 0}
        >
          <ChevronLeft />
        </Button>
      </div>
      <TransferPanel
        title={titles[1]}
        items={rightItems}
        checkedKeys={rightChecked}
        onCheckedChange={setRightChecked}
        search={rightSearch}
        onSearchChange={setRightSearch}
        disabled={disabled}
        loading={loading}
        totalCount={rightTotal}
      />
    </div>
  );
}

function TransferPanel({
  title,
  items,
  checkedKeys,
  onCheckedChange,
  search,
  onSearchChange,
  disabled,
  loading,
  totalCount,
}: {
  title: string;
  items: TransferItem[];
  checkedKeys: Set<string>;
  onCheckedChange: (keys: Set<string>) => void;
  search: string;
  onSearchChange: (value: string) => void;
  disabled: boolean;
  loading: boolean;
  totalCount: number;
}) {
  const allChecked =
    items.length > 0 && items.every((i) => checkedKeys.has(i.key));
  const someChecked = items.some((i) => checkedKeys.has(i.key));

  const toggleAll = () => {
    if (allChecked) {
      onCheckedChange(new Set());
    } else {
      onCheckedChange(new Set(items.map((i) => i.key)));
    }
  };

  const toggleItem = (key: string) => {
    const next = new Set(checkedKeys);
    if (next.has(key)) next.delete(key);
    else next.add(key);
    onCheckedChange(next);
  };

  return (
    <div className="flex-1 rounded-md border">
      <div className="flex items-center gap-2 border-b px-3 py-2">
        <Checkbox
          checked={allChecked ? true : someChecked ? "indeterminate" : false}
          onCheckedChange={toggleAll}
          disabled={disabled || items.length === 0}
        />
        <span className="text-xs font-medium">{title}</span>
        <span className="ml-auto text-xs text-muted-foreground">
          {checkedKeys.size > 0 && `${checkedKeys.size}/`}
          {totalCount}
        </span>
      </div>
      <div className="border-b px-2 py-1.5">
        <div className="relative">
          <Search className="absolute left-2 top-1/2 size-3 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search"
            className="h-7 pl-7 text-xs"
            disabled={disabled}
          />
        </div>
      </div>
      <ScrollArea className="h-[200px]">
        {loading ? (
          <div className="flex h-full items-center justify-center py-8">
            <span className="text-xs text-muted-foreground">Loading...</span>
          </div>
        ) : items.length === 0 ? (
          <div className="flex h-full items-center justify-center py-8">
            <span className="text-xs text-muted-foreground">No items</span>
          </div>
        ) : (
          <div className="py-1">
            {items.map((item) => (
              <label
                key={item.key}
                className={cn(
                  "flex cursor-pointer items-center gap-2 px-3 py-1 text-xs hover:bg-muted/50",
                  disabled && "pointer-events-none opacity-50",
                )}
              >
                <Checkbox
                  checked={checkedKeys.has(item.key)}
                  onCheckedChange={() => toggleItem(item.key)}
                  disabled={disabled}
                />
                <span className="truncate">{item.title}</span>
              </label>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
