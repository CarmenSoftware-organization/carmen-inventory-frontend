"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Download, Printer } from "lucide-react";
import { toast } from "sonner";
import {
  DataGrid,
  DataGridContainer,
} from "@/components/ui/data-grid/data-grid";
import { DataGridTable } from "@/components/ui/data-grid/data-grid-table";
import { DataGridPagination } from "@/components/ui/data-grid/data-grid-pagination";
import { Button } from "@/components/ui/button";
import { useUser, useDeleteUser } from "@/hooks/use-user";
import { useDataGridState } from "@/hooks/use-data-grid-state";
import type { User } from "@/types/workflows";
import SearchInput from "@/components/search-input";
import { DeleteDialog } from "@/components/ui/delete-dialog";
import { ErrorState } from "@/components/ui/error-state";
import { StatusFilter } from "@/components/ui/status-filter";
import DisplayTemplate from "@/components/display-template";
import { useUserTable } from "./use-user-table";

export default function UserComponent() {
  const router = useRouter();
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null);
  const deleteUser = useDeleteUser();
  const { params, search, setSearch, filter, setFilter, tableConfig } =
    useDataGridState();
  const { data, isLoading, error, refetch } = useUser(params);

  const users = data?.data ?? [];
  const totalRecords = data?.paginate?.total ?? 0;

  const table = useUserTable({
    users,
    totalRecords,
    params,
    tableConfig,
    onEdit: (user) => router.push(`/system-admin/user/${user.user_id}`),
    onDelete: setDeleteTarget,
  });

  if (error)
    return <ErrorState message={error.message} onRetry={() => refetch()} />;

  return (
    <DisplayTemplate
      title="User Assign"
      description="Manage user assignments for your system."
      toolbar={
        <>
          <SearchInput defaultValue={search} onSearch={setSearch} />
          <StatusFilter value={filter} onChange={setFilter} />
        </>
      }
      actions={
        <>
          <Button size="sm" variant="outline" disabled title="Coming soon">
            <Download aria-hidden="true" />
            Export
          </Button>
          <Button size="sm" variant="outline" disabled title="Coming soon">
            <Printer aria-hidden="true" />
            Print
          </Button>
        </>
      }
    >
      <DataGrid
        table={table}
        recordCount={totalRecords}
        isLoading={isLoading}
        tableLayout={{ dense: true, headerSeparator: true }}
        tableClassNames={{ base: "text-sm" }}
      >
        <DataGridContainer>
          <DataGridTable />
        </DataGridContainer>
        <DataGridPagination />
      </DataGrid>

      <DeleteDialog
        open={!!deleteTarget}
        onOpenChange={(open) =>
          !open && !deleteUser.isPending && setDeleteTarget(null)
        }
        title="Delete User"
        description={`Are you sure you want to delete user "${deleteTarget?.firstname} ${deleteTarget?.lastname}"? This action cannot be undone.`}
        isPending={deleteUser.isPending}
        onConfirm={() => {
          if (!deleteTarget) return;
          deleteUser.mutate(deleteTarget.user_id, {
            onSuccess: () => {
              toast.success("User deleted successfully");
              setDeleteTarget(null);
            },
            onError: (err) => toast.error(err.message),
          });
        }}
      />
    </DisplayTemplate>
  );
}
