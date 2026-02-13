import { ModuleLanding } from "@/components/module-landing";
import { moduleList } from "@/constant/module-list";

const modules = moduleList.find((mod) => mod.path === "/system-admin")!;

export default function SystemAdminPage() {
  return (
    <ModuleLanding
      name={modules.name}
      icon={modules.icon}
      description="Workflows, access control, and system security"
      subModules={modules.subModules ?? []}
    />
  );
}
