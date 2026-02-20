import type { Metadata } from "next";
import { ModuleLanding } from "@/components/module-landing";
import { getModule } from "@/constant/module-list";

export const metadata: Metadata = { title: "Inventory Management" };

const modules = getModule("/inventory-management");

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
