import {
  type ColumnDef,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import type { ParamsDto } from "@/types/params";
import type { useDataGridState } from "@/hooks/use-data-grid-state";
import {
  selectColumn,
  indexColumn,
  statusColumn,
  actionColumn,
} from "./columns";

interface UseConfigTableOptions<T> {
  data: T[];
  columns: ColumnDef<T>[];
  totalRecords: number;
  params: ParamsDto;
  tableConfig: ReturnType<typeof useDataGridState>["tableConfig"];
  onDelete: (item: T) => void;
}

export function useConfigTable<T>({
  data,
  columns,
  totalRecords,
  params,
  tableConfig,
  onDelete,
}: UseConfigTableOptions<T>) {
  "use no memo";

  const allColumns: ColumnDef<T>[] = [
    selectColumn<T>(),
    indexColumn<T>(params),
    ...columns,
    statusColumn<T>(),
    actionColumn<T>(onDelete),
  ];

  return useReactTable({
    data,
    columns: allColumns,
    getCoreRowModel: getCoreRowModel(),
    ...tableConfig,
    pageCount: Math.ceil(totalRecords / (params.perpage as number)),
  });
}
