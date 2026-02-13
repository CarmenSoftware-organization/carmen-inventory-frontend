import { ModuleLanding } from "@/components/module-landing";
import { moduleList } from "@/constant/module-list";

const modules = moduleList.find((mod) => mod.path === "/inventory-management")!;

export default function InventoryManagementPage() {
  return (
    <ModuleLanding
      name={modules.name}
      icon={modules.icon}
      description="Stock control, adjustments, and period-end closing"
      subModules={modules.subModules ?? []}
    />
  );
}
