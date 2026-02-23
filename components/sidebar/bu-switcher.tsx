"use client";

import { useRef, useState } from "react";
import { Building2, ChevronsUpDown } from "lucide-react";
import { toast } from "sonner";

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
import { useProfile } from "@/hooks/use-profile";
import { useSwitchBu } from "@/hooks/use-switch-bu";
import type { BusinessUnit } from "@/types/profile";

export default function BuSwitcher() {
  const { isMobile } = useSidebar();
  const { data: profile, isLoading, isError, defaultBu } = useProfile();
  const switchBuMutation = useSwitchBu();
  const [activeDept, setActiveDept] = useState<BusinessUnit | undefined>(
    undefined,
  );
  const previousDept = useRef<BusinessUnit | undefined>(undefined);

  const departments = profile?.business_unit ?? [];
  const currentDept = activeDept ?? defaultBu;

  if (isLoading || isError) {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton size="lg" disabled>
            <Skeleton className="size-7 bg-sidebar-border" />
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
              <div className="flex aspect-square size-7 items-center justify-center rounded-md bg-sidebar-primary text-sidebar-primary-foreground">
                <Building2 className="size-3.5" />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">
                  {currentDept.name}
                </span>
                <span className="truncate text-xs">
                  {currentDept.config?.hotel?.name}
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
            {departments.map((bu) => {
              const isActive = bu.id === currentDept.id;
              return (
              <DropdownMenuItem
                key={bu.id}
                disabled={isActive}
                onClick={() => {
                  if (isActive) return;
                  previousDept.current = currentDept;
                  setActiveDept(bu);
                  switchBuMutation.mutate(bu.id, {
                    onError: () => {
                      setActiveDept(previousDept.current);
                      toast.error("Failed to switch business unit");
                    },
                  });
                }}
                className="gap-3 p-1a"
              >
                <div className="flex size-6 items-center justify-center rounded-sm border">
                  <Building2 className="size-4 shrink-0" />
                </div>
                <div className="grid text-xs leading-tight">
                  <span className="truncate font-medium">{bu.name}</span>
                  <span className="truncate text-xs text-muted-foreground">
                    {bu.config?.hotel?.name}
                  </span>
                </div>
              </DropdownMenuItem>
              );
            })}
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
