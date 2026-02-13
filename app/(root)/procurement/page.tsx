import { ModuleLanding } from "@/components/module-landing";
import { moduleList } from "@/constant/module-list";

const procurementModule = moduleList.find(
  (mod) => mod.path === "/procurement",
)!;

export default function ProcurementPage() {
  return (
    <ModuleLanding
      name={procurementModule.name}
      icon={procurementModule.icon}
      description="Purchasing and goods receiving workflow"
      subModules={procurementModule.subModules ?? []}
    />
  );
}
