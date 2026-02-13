import { ModuleLanding } from "@/components/module-landing";
import { moduleList } from "@/constant/module-list";

const modules = moduleList.find((mod) => mod.path === "/vendor-management")!;

export default function VendorManagementPage() {
  return (
    <ModuleLanding
      name={modules.name}
      icon={modules.icon}
      description="Supplier profiles and pricing agreements"
      subModules={modules.subModules ?? []}
    />
  );
}
