import { ModuleLanding } from "@/components/module-landing";
import { getModule } from "@/constant/module-list";

const modules = getModule("/store-operation");

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
