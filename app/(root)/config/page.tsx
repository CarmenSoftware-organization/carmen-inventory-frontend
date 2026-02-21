import type { Metadata } from "next";
import { ModuleLanding } from "@/components/module-landing";
import { getModule } from "@/constant/module-list";

export const metadata: Metadata = { title: "Configuration" };

const configModule = getModule("/config");

export default function ConfigPage() {
  return (
    <ModuleLanding
      name={configModule.name}
      icon={configModule.icon}
      description="Master data and system-wide settings"
      subModules={configModule.subModules ?? []}
    />
  );
}
