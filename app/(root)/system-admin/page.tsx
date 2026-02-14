import { ModuleLanding } from "@/components/module-landing";
import { getModule } from "@/constant/module-list";

const modules = getModule("/system-admin");

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
