"use client";

import { SidebarTrigger } from "@/components/ui/sidebar";
import { UserProfile } from "./user-profile";
import NotificationComponent from "./notification-component";
import PathBreadcrumb from "./path-breadcrumb";
import ModuleApp from "./module-app";

export function Navbar() {
  return (
    <header className="flex h-12 border-b shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
      <div className="flex w-full items-center gap-2 px-2">
        <SidebarTrigger />
        <PathBreadcrumb />
        <div className="ml-auto flex items-center gap-2">
          <ModuleApp />
          <NotificationComponent />
          <UserProfile />
        </div>
      </div>
    </header>
  );
}
