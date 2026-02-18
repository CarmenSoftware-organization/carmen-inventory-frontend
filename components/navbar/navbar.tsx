"use client";

import { SidebarTrigger } from "@/components/ui/sidebar";
import { UserProfile } from "./user-profile";
import PathBreadcrumb from "./path-breadcrumb";
import ModuleApp from "./module-app";
import Notification from "./notification";
import { SwitchTheme } from "../switch-theme";

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 bg-background flex h-12 border-b shrink-0 items-center gap-1.5 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-10">
      <div className="flex w-full items-center gap-1.5 px-2">
        <SidebarTrigger />
        <PathBreadcrumb />
        <div className="ml-auto flex items-center gap-1">
          <ModuleApp />
          <SwitchTheme />
          <Notification />
          <UserProfile />
        </div>
      </div>
    </header>
  );
}
