import type { Metadata } from "next";
import { ModuleLanding } from "@/components/module-landing";
import { getModule } from "@/constant/module-list";

export const metadata: Metadata = { title: "Procurement" };

const procurementModule = getModule("/procurement");

export default function ProcurementPage() {
  return (
    <ModuleLanding
      name={procurementModule.name}
      icon={procurementModule.icon}
      description="Purchasing and goods receiving workflow"
      subModules={procurementModule.subModules ?? []}
    />
  );
}
