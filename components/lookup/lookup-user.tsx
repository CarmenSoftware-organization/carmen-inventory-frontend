"use client";

import { UserSearch } from "lucide-react";
import { useAllUsers } from "@/hooks/use-all-users";
import type { User } from "@/types/workflows";
import { LookupCombobox } from "./lookup-combobox";

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

  return (
    <LookupCombobox
      value={value}
      onValueChange={(id) => onValueChange(id)}
      items={users}
      getId={(u) => u.user_id}
      getLabel={(u) => getUserFullName(u)}
      getSearchValue={(u) => `${getUserFullName(u)} ${u.email}`}
      placeholder={placeholder}
      searchPlaceholder="Search user..."
      disabled={disabled}
      className={className}
      emptyIcon={UserSearch}
      emptyTitle="No user found"
      emptyDescription="Try adjusting your search to find what you're looking for."
    />
  );
}
