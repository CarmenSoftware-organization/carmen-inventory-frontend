import type { Metadata } from "next";
import { ModuleLanding } from "@/components/module-landing";
import { getModule } from "@/constant/module-list";

export const metadata: Metadata = { title: "Store Operation" };

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
