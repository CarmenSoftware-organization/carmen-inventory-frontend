"use client";

import { LogOut } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useProfile } from "@/hooks/use-profile";
import { useLogout } from "@/hooks/use-logout";
import { formatName } from "@/utils/format/name";

export function UserProfile() {
  const { data: profile, isLoading, isError, defaultBu } = useProfile();
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
      <Button variant="ghost" className="h-auto gap-2 px-2 py-1.5" disabled>
        <div className="grid gap-1 text-right">
          <Skeleton className="h-3.5 w-20" />
          <Skeleton className="h-3 w-14 ml-auto" />
        </div>
        <Skeleton className="size-8 rounded-full" />
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-auto gap-2 px-2 py-1.5">
          <div className="grid text-right text-sm leading-tight">
            <span className="truncate font-semibold">{name}</span>
            <span className="truncate text-xs text-muted-foreground">
              {department}
            </span>
          </div>
          <Avatar className="size-8">
            <AvatarFallback className="text-xs">{convertName}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="min-w-56" align="end" sideOffset={4}>
        <DropdownMenuLabel className="font-normal">
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-semibold">{name}</span>
            <span className="truncate text-xs text-muted-foreground">
              {email}
            </span>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => logoutMutation.mutate()}
          disabled={logoutMutation.isPending}
        >
          <LogOut />
          {logoutMutation.isPending ? "Logging out..." : "Log out"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
