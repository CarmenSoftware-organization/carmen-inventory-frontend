"use client";

import type React from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import BuSwitcher from "./bu-switcher";
import { SideMain } from "./side-main";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <BuSwitcher />
      </SidebarHeader>
      <SidebarContent>
        <SideMain />
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
}
