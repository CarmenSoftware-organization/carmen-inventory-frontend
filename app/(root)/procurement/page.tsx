import { ModuleLanding } from "@/components/module-landing";
import { getModule } from "@/constant/module-list";

const procurementModule = getModule("/procurement");

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
