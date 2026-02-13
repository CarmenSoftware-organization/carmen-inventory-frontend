import { ModuleLanding } from "@/components/module-landing";
import { moduleList } from "@/constant/module-list";

const modules = moduleList.find((mod) => mod.path === "/product-management")!;

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
