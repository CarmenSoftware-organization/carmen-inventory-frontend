import type { Metadata } from "next";
import { ModuleLanding } from "@/components/module-landing";
import { getModule } from "@/constant/module-list";

export const metadata: Metadata = { title: "Vendor Management" };

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
