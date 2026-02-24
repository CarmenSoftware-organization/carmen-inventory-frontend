import { useMemo } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { usePermission } from "@/hooks/use-permission";
import EmptyComponent from "@/components/empty-component";

const ALL_ACTIONS = [
  "view",
  "view_department",
  "view_all",
  "create",
  "update",
  "delete",
  "execute",
] as const;

const ACTION_LABELS: Record<string, string> = {
  view: "View",
  view_department: "View Dept",
  view_all: "View All",
  create: "Create",
  update: "Update",
  delete: "Delete",
  execute: "Execute",
};

const CATEGORY_LABELS: Record<string, string> = {
  configuration: "Configuration",
  product_management: "Product Management",
  vendor_management: "Vendor Management",
  procurement: "Procurement",
  inventory_management: "Inventory Management",
};

interface GroupedResource {
  resource: string;
  resourceLabel: string;
  actions: Map<string, string>;
}

interface PermissionGroup {
  category: string;
  categoryLabel: string;
  resources: GroupedResource[];
}

interface PermissionMatrixProps {
  value: string[];
  onChange: (ids: string[]) => void;
  disabled?: boolean;
}

export function PermissionMatrix({
  value,
  onChange,
  disabled,
}: PermissionMatrixProps) {
  const { data: permData } = usePermission({ perpage: -1 });
  const permissions = useMemo(() => permData?.data ?? [], [permData?.data]);

  const grouped = useMemo(() => {
    const categoryMap = new Map<string, Map<string, Map<string, string>>>();

    for (const perm of permissions) {
      const dotIndex = perm.resource.indexOf(".");
      if (dotIndex === -1) continue;
      const category = perm.resource.substring(0, dotIndex);
      const resourceName = perm.resource.substring(dotIndex + 1);

      if (!categoryMap.has(category)) categoryMap.set(category, new Map());
      const resMap = categoryMap.get(category)!;
      if (!resMap.has(resourceName)) resMap.set(resourceName, new Map());
      resMap.get(resourceName)!.set(perm.action, perm.id);
    }

    const result: PermissionGroup[] = [];
    for (const [category, resources] of categoryMap) {
      const group: PermissionGroup = {
        category,
        categoryLabel: CATEGORY_LABELS[category] ?? category,
        resources: [],
      };
      for (const [resource, actions] of resources) {
        group.resources.push({
          resource: `${category}.${resource}`,
          resourceLabel: resource
            .split("_")
            .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
            .join(" "),
          actions,
        });
      }
      result.push(group);
    }
    return result;
  }, [permissions]);

  const selectedSet = useMemo(() => new Set(value), [value]);

  if (permissions.length === 0) {
    return (
      <EmptyComponent
        title="No permissions found"
        description="You have no permissions to manage."
      />
    );
  }

  return (
    <div className="overflow-x-auto rounded-md border">
      <table className="w-full text-xs border-collapse">
        <thead>
          <tr className="border-b bg-muted/30">
            <th className="text-left p-2 font-medium min-w-45">Resource</th>
            {ALL_ACTIONS.map((action) => (
              <th key={action} className="p-2 text-center font-medium w-20">
                {ACTION_LABELS[action]}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {grouped.map((group) => (
            <PermissionGroupRows
              key={group.category}
              group={group}
              selectedSet={selectedSet}
              disabled={disabled}
              onToggle={(permissionId, checked) => {
                if (checked) {
                  onChange([...value, permissionId]);
                } else {
                  onChange(value.filter((id) => id !== permissionId));
                }
              }}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}

interface PermissionGroupRowsProps {
  group: PermissionGroup;
  selectedSet: Set<string>;
  disabled?: boolean;
  onToggle: (permissionId: string, checked: boolean) => void;
}

const PermissionGroupRows = ({
  group,
  selectedSet,
  disabled,
  onToggle,
}: PermissionGroupRowsProps) => {
  return (
    <>
      <tr className="bg-muted/50">
        <td
          colSpan={ALL_ACTIONS.length + 1}
          className="p-2 font-semibold text-xs"
        >
          {group.categoryLabel}
        </td>
      </tr>
      {group.resources.map((resource) => (
        <tr key={resource.resource} className="border-b">
          <td className="p-2 pl-4">{resource.resourceLabel}</td>
          {ALL_ACTIONS.map((action) => {
            const permissionId = resource.actions.get(action);
            if (!permissionId) {
              return (
                <td
                  key={action}
                  className="p-2 text-center text-muted-foreground"
                >
                  —
                </td>
              );
            }
            return (
              <td key={action} className="p-2 text-center">
                <Checkbox
                  checked={selectedSet.has(permissionId)}
                  onCheckedChange={(val) => onToggle(permissionId, !!val)}
                  disabled={disabled}
                />
              </td>
            );
          })}
        </tr>
      ))}
    </>
  );
};
