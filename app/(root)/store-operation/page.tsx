import { ModuleLanding } from "@/components/module-landing";
import { moduleList } from "@/constant/module-list";

const modules = moduleList.find((mod) => mod.path === "/store-operation")!;

export default function StoreOperationPage() {
  return (
    <ModuleLanding
      name={modules.name}
      icon={modules.icon}
      description="Order management, inventory control, and sales summary"
      subModules={modules.subModules ?? []}
    />
  );
}
