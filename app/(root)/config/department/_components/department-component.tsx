"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Download, Plus, Printer } from "lucide-react";
import { toast } from "sonner";
import {
  DataGrid,
  DataGridContainer,
} from "@/components/ui/data-grid/data-grid";
import { DataGridTable } from "@/components/ui/data-grid/data-grid-table";
import { DataGridPagination } from "@/components/ui/data-grid/data-grid-pagination";
import { Button } from "@/components/ui/button";
import { useDepartment, useDeleteDepartment } from "@/hooks/use-department";
import { useDataGridState } from "@/hooks/use-data-grid-state";
import type { Department } from "@/types/department";
import SearchInput from "@/components/search-input";
import { DeleteDialog } from "@/components/ui/delete-dialog";
import { ErrorState } from "@/components/ui/error-state";
import { StatusFilter } from "@/components/ui/status-filter";
import DisplayTemplate from "@/components/display-template";
import { useDepartmentTable } from "./use-department-table";

export default function DepartmentComponent() {
  const router = useRouter();
  const [deleteTarget, setDeleteTarget] = useState<Department | null>(null);
  const deleteDepartment = useDeleteDepartment();
  const { params, search, setSearch, filter, setFilter, tableConfig } =
    useDataGridState();
  const { data, isLoading, error, refetch } = useDepartment(params);

  const departments = data?.data ?? [];
  const totalRecords = data?.paginate?.total ?? 0;

  const table = useDepartmentTable({
    departments,
    totalRecords,
    params,
    tableConfig,
    onEdit: (department) => router.push(`/config/department/${department.id}`),
    onDelete: setDeleteTarget,
  });

  if (error)
    return <ErrorState message={error.message} onRetry={() => refetch()} />;

  return (
    <DisplayTemplate
      title="Department"
      description="Manage departments for your organization."
      toolbar={
        <>
          <SearchInput defaultValue={search} onSearch={setSearch} />
          <StatusFilter value={filter} onChange={setFilter} />
        </>
      }
      actions={
        <>
          <Button
            size="sm"
            onClick={() => router.push("/config/department/new")}
          >
            <Plus />
            Add Department
          </Button>
          <Button size="sm" variant="outline">
            <Download />
            Export
          </Button>
          <Button size="sm" variant="outline">
            <Printer />
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
          !open && !deleteDepartment.isPending && setDeleteTarget(null)
        }
        title="Delete Department"
        description={`Are you sure you want to delete department "${deleteTarget?.name}"? This action cannot be undone.`}
        isPending={deleteDepartment.isPending}
        onConfirm={() => {
          if (!deleteTarget) return;
          deleteDepartment.mutate(deleteTarget.id, {
            onSuccess: () => {
              toast.success("Department deleted successfully");
              setDeleteTarget(null);
            },
            onError: (err) => toast.error(err.message),
          });
        }}
      />
    </DisplayTemplate>
  );
}
