"use client";

import { useMemo, useState } from "react";
import { Check, ChevronsUpDown, UserSearch } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Command, CommandInput } from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { VirtualCommandList } from "@/components/ui/virtual-command-list";
import { useAllUsers } from "@/hooks/use-all-users";
import type { User } from "@/types/workflows";
import EmptyComponent from "../empty-component";

function getUserFullName(user: User) {
  return [user.firstname, user.middlename, user.lastname]
    .filter(Boolean)
    .join(" ");
}

interface LookupUserProps {
  readonly value: string;
  readonly onValueChange: (value: string) => void;
  readonly disabled?: boolean;
  readonly placeholder?: string;
  readonly className?: string;
}

export function LookupUser({
  value,
  onValueChange,
  disabled,
  placeholder = "Select user",
  className,
}: LookupUserProps) {
  const { data: users = [] } = useAllUsers();

  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const filteredUsers = useMemo(() => {
    if (!search) return users;
    const q = search.toLowerCase();
    return users.filter(
      (u) =>
        getUserFullName(u).toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q),
    );
  }, [users, search]);

  const selectedName = useMemo(() => {
    if (!value) return null;
    const user = users.find((u) => u.user_id === value);
    return user ? getUserFullName(user) : null;
  }, [value, users]);

  return (
    <Popover open={open} onOpenChange={(o) => { setOpen(o); if (!o) setSearch(""); }}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          aria-expanded={open}
          className={cn(
            "h-8 flex justify-start items-center gap-2 pl-3 pr-1 text-sm",
            className,
          )}
          disabled={disabled}
        >
          <span
            className={cn(
              "truncate text-left",
              !selectedName && "text-muted-foreground",
            )}
          >
            {selectedName ?? placeholder}
          </span>
          <ChevronsUpDown className="ml-auto h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Search user..."
            className="placeholder:text-xs"
            value={search}
            onValueChange={setSearch}
          />
          <VirtualCommandList
            items={filteredUsers}
            emptyMessage={
              <EmptyComponent
                icon={UserSearch}
                title="No user found"
                description="Try adjusting your search to find what you're looking for."
              />
            }
          >
            {(user) => (
              <button
                type="button"
                aria-pressed={value === user.user_id}
                data-value={getUserFullName(user)}
                className={cn(
                  "relative flex w-full cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-xs outline-hidden select-none",
                  "hover:bg-accent hover:text-accent-foreground",
                  "focus:bg-accent focus:text-accent-foreground focus:outline-none",
                )}
                onClick={() => {
                  onValueChange(user.user_id);
                  setOpen(false);
                }}
              >
                <span className="truncate">{getUserFullName(user)}</span>
                <Check
                  className={cn(
                    "ml-auto h-4 w-4 shrink-0",
                    value === user.user_id ? "opacity-100" : "opacity-0",
                  )}
                />
              </button>
            )}
          </VirtualCommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
