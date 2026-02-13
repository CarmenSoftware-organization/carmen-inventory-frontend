import { ModuleLanding } from "@/components/module-landing";
import { moduleList } from "@/constant/module-list";

const configModule = moduleList.find((mod) => mod.path === "/config")!;

export default function ConfigPage() {
  return (
    <ModuleLanding
      name={configModule.name}
      icon={configModule.icon}
      description="Config Setup"
      subModules={configModule.subModules ?? []}
    />
  );
}
