import { ModuleLanding } from "@/components/module-landing";
import { getModule } from "@/constant/module-list";

const modules = getModule("/vendor-management");

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
