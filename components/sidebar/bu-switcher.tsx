"use client";

import { useCallback, useState } from "react";
import { Building2, ChevronsUpDown } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";
import { useProfile, profileQueryKey } from "@/hooks/use-profile";
import type { BusinessUnit } from "@/types/profile";

export default function BuSwitcher() {
  const { isMobile } = useSidebar();
  const queryClient = useQueryClient();
  const { data: profile, isLoading, isError } = useProfile();

  const departments = profile?.business_unit ?? [];
  const defaultDept = departments.find((bu) => bu.is_default);
  const [activeDept, setActiveDept] = useState<BusinessUnit | undefined>(
    undefined,
  );

  const currentDept = activeDept ?? defaultDept;

  const handleSwitchBu = useCallback(
    (bu: BusinessUnit) => {
      setActiveDept(bu);
      queryClient.invalidateQueries({
        predicate: (query) => query.queryKey !== profileQueryKey,
      });
    },
    [queryClient],
  );

  if (isLoading || isError) {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton size="lg" disabled>
            <Skeleton className="size-8 bg-sidebar-border" />
            <div className="grid flex-1 gap-1">
              <Skeleton className="h-3.5 w-24 bg-sidebar-border" />
              <Skeleton className="h-3 w-16 bg-sidebar-border" />
            </div>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    );
  }

  if (!currentDept) {
    return null;
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                <Building2 className="size-4" />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">
                  {currentDept.name}
                </span>
                <span className="truncate text-xs">
                  {currentDept.config.hotel.name}
                </span>
              </div>
              <ChevronsUpDown className="ml-auto" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56"
            align="start"
            side={isMobile ? "bottom" : "right"}
            sideOffset={4}
          >
            {departments.map((bu) => (
              <DropdownMenuItem
                key={bu.id}
                onClick={() => handleSwitchBu(bu)}
                className="gap-2 p-2"
              >
                <div className="flex size-6 items-center justify-center rounded-sm border">
                  <Building2 className="size-4 shrink-0" />
                </div>
                <div className="grid text-sm leading-tight">
                  <span className="truncate font-medium">{bu.name}</span>
                  <span className="truncate text-xs text-muted-foreground">
                    {bu.config.hotel.name}
                  </span>
                </div>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
