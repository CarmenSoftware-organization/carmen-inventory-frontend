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
  hideStatus?: boolean;
}

export function useConfigTable<T>({
  data,
  columns,
  totalRecords,
  params,
  tableConfig,
  onDelete,
  hideStatus,
}: UseConfigTableOptions<T>) {
  // "use no memo" opts out of React Compiler's automatic memoization.
  // TanStack Table creates new column/row objects each render; memoizing them
  // breaks reference-equality checks the library relies on internally.
  "use no memo";

  const allColumns: ColumnDef<T>[] = [
    selectColumn<T>(),
    indexColumn<T>(params),
    ...columns,
    ...(hideStatus ? [] : [statusColumn<T>()]),
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
