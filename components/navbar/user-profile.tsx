"use client";

import Link from "next/link";
import { LogOut } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useProfile } from "@/hooks/use-profile";
import { useLogout } from "@/hooks/use-logout";
import { formatName } from "@/utils/format/name";

export function UserProfile() {
  const {
    data: profile,
    isLoading,
    isError,
    defaultBu,
    aliasName,
  } = useProfile();
  const logoutMutation = useLogout();

  const name = profile
    ? `${profile.user_info.firstname} ${profile.user_info.lastname}`
    : "User";

  const email = profile?.email ?? "";

  const department = defaultBu?.department?.name ?? "";

  const convertName = formatName(
    profile?.user_info.firstname,
    profile?.user_info.lastname,
  );

  if (isLoading || isError) {
    return (
      <div className="flex items-center gap-1.5 px-1.5">
        <Skeleton className="size-6 rounded-full" />
        <div className="grid gap-0.5">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-2.5 w-10" />
        </div>
      </div>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center gap-1.5 rounded-md px-1.5 py-1 text-right hover:bg-muted/50 transition-colors outline-none">
        <div className="hidden sm:grid text-xs leading-tight">
          <span className="truncate font-semibold max-w-28">{name}</span>
          <span
            className={`truncate text-[10px] max-w-28 ${department ? "text-muted-foreground" : "text-amber-500"}`}
          >
            {department || "No department"}
          </span>
        </div>
        <Avatar className="size-6">
          <AvatarFallback className="text-[10px] font-semibold">
            {aliasName ?? convertName}
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="min-w-48" align="end">
        <DropdownMenuItem asChild>
          <Link
            href="/profile"
            className="grid text-left text-xs leading-tight"
          >
            <span className="truncate font-semibold">{name}</span>
            <span className="truncate text-[11px] text-muted-foreground">
              {email}
            </span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="text-xs"
          onClick={() => logoutMutation.mutate()}
          disabled={logoutMutation.isPending}
        >
          <LogOut className="size-3.5" />
          {logoutMutation.isPending ? "Logging out..." : "Log out"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
