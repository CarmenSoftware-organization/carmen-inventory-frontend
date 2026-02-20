import type { Metadata } from "next";
import { ModuleLanding } from "@/components/module-landing";
import { getModule } from "@/constant/module-list";

export const metadata: Metadata = { title: "Operation Planning" };

const modules = getModule("/operation-plan");

export default function OperationPlanPage() {
  return (
    <ModuleLanding
      name={modules.name}
      icon={modules.icon}
      description="Order management, inventory control, and sales summary"
      subModules={modules.subModules ?? []}
    />
  );
}
