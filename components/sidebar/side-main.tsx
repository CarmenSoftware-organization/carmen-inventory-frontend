"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { Separator } from "@/components/ui/separator";
import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { moduleList } from "@/constant/module-list";

export function SideMain() {
  const pathname = usePathname();

  const activeModule = moduleList.find((mod) => pathname.startsWith(mod.path));

  if (!activeModule) {
    return null;
  }

  return (
    <>
      <div className="flex items-center gap-2 px-4 py-2 text-sm font-semibold group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0">
        <activeModule.icon className="size-4 shrink-0" />
        <span className="group-data-[collapsible=icon]:hidden">
          {activeModule.name}
        </span>
      </div>
      {activeModule.subModules && activeModule.subModules.length > 0 && (
        <>
          <Separator />
          <SidebarGroup>
            <SidebarMenu>
              {activeModule.subModules.map((sub) => (
                <SidebarMenuItem key={sub.path}>
                  <SidebarMenuButton
                    asChild
                    tooltip={sub.name}
                    isActive={pathname === sub.path}
                  >
                    <Link href={sub.path}>
                      <sub.icon />
                      <span>{sub.name}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroup>
        </>
      )}
    </>
  );
}
