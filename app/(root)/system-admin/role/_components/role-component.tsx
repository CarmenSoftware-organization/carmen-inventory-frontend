"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import {
  DataGrid,
  DataGridContainer,
} from "@/components/ui/data-grid/data-grid";
import { DataGridTable } from "@/components/ui/data-grid/data-grid-table";
import { DataGridPagination } from "@/components/ui/data-grid/data-grid-pagination";
import { Button } from "@/components/ui/button";
import { useRole, useDeleteRole } from "@/hooks/use-role";
import { useDataGridState } from "@/hooks/use-data-grid-state";
import type { Role } from "@/types/role";
import SearchInput from "@/components/search-input";
import { DeleteDialog } from "@/components/ui/delete-dialog";
import { ErrorState } from "@/components/ui/error-state";
import DisplayTemplate from "@/components/display-template";
import { useRoleTable } from "./use-role-table";

export default function RoleComponent() {
  const router = useRouter();
  const [deleteTarget, setDeleteTarget] = useState<Role | null>(null);
  const deleteRole = useDeleteRole();
  const { params, search, setSearch, tableConfig } = useDataGridState();
  const { data, isLoading, error, refetch } = useRole(params);

  const items = data?.data ?? [];
  const totalRecords = items.length;

  const table = useRoleTable({
    items,
    totalRecords,
    params,
    tableConfig,
    onEdit: (item) => router.push(`/system-admin/role/${item.id}`),
    onDelete: setDeleteTarget,
  });

  if (error)
    return <ErrorState message={error.message} onRetry={() => refetch()} />;

  return (
    <DisplayTemplate
      title="Roles"
      description="Manage application roles and permissions."
      toolbar={<SearchInput defaultValue={search} onSearch={setSearch} />}
      actions={
        <Button size="sm" onClick={() => router.push("/system-admin/role/new")}>
          <Plus />
          Add Role
        </Button>
      }
    >
      <DataGrid
        table={table}
        recordCount={totalRecords}
        isLoading={isLoading}
        tableLayout={{ dense: true }}
        tableClassNames={{ base: "text-xs" }}
      >
        <DataGridContainer>
          <DataGridTable />
        </DataGridContainer>
        <DataGridPagination />
      </DataGrid>

      <DeleteDialog
        open={!!deleteTarget}
        onOpenChange={(open) =>
          !open && !deleteRole.isPending && setDeleteTarget(null)
        }
        title="Delete Role"
        description={`Are you sure you want to delete "${deleteTarget?.name}"? This action cannot be undone.`}
        isPending={deleteRole.isPending}
        onConfirm={() => {
          if (!deleteTarget) return;
          deleteRole.mutate(deleteTarget.id, {
            onSuccess: () => {
              toast.success("Role deleted successfully");
              setDeleteTarget(null);
            },
            onError: (err) => toast.error(err.message),
          });
        }}
      />
    </DisplayTemplate>
  );
}
