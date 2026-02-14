import { ModuleLanding } from "@/components/module-landing";
import { getModule } from "@/constant/module-list";

const modules = getModule("/product-management");

export default function ProductManagementPage() {
  return (
    <ModuleLanding
      name={modules.name}
      icon={modules.icon}
      description="Product catalog and category structure"
      subModules={modules.subModules ?? []}
    />
  );
}
