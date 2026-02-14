import { ModuleLanding } from "@/components/module-landing";
import { getModule } from "@/constant/module-list";

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
