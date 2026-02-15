"use client";

import { useMemo } from "react";
import type { PaginationState, SortingState } from "@tanstack/react-table";
import { useListPageState } from "@/hooks/use-list-page-state";
import type { ParamsDto } from "@/types/params";

interface UseDataGridStateOptions {
  defaultPerpage?: number;
  defaultPage?: number;
}

export function useDataGridState(options?: UseDataGridStateOptions) {
  const {
    pageNumber,
    perpageNumber,
    sort,
    setSort,
    search,
    setSearch,
    filter,
    setFilter,
    stage,
    setStage,
    handlePageChange,
    handleSetPerpage,
  } = useListPageState(options);

  const sorting: SortingState = useMemo(() => {
    if (!sort) return [];
    const [id, dir] = sort.split(":");
    return [{ id, desc: dir === "desc" }];
  }, [sort]);

  const pagination: PaginationState = {
    pageIndex: pageNumber - 1,
    pageSize: perpageNumber,
  };

  const combinedFilter = [filter, stage ? `workflow_current_stage:${stage}` : ""]
    .filter(Boolean)
    .join(",") || undefined;

  const params: ParamsDto = {
    page: pageNumber,
    perpage: perpageNumber,
    sort: sort || undefined,
    search: search || undefined,
    filter: combinedFilter,
  };

  const onPaginationChange = (
    updater: PaginationState | ((old: PaginationState) => PaginationState),
  ) => {
    const next =
      typeof updater === "function" ? updater(pagination) : updater;
    handlePageChange(next.pageIndex + 1);
    handleSetPerpage(next.pageSize);
  };

  const onSortingChange = (
    updater: SortingState | ((old: SortingState) => SortingState),
  ) => {
    const next = typeof updater === "function" ? updater(sorting) : updater;
    if (next.length > 0) {
      setSort(`${next[0].id}:${next[0].desc ? "desc" : "asc"}`);
    } else {
      setSort("");
    }
    handlePageChange(1);
  };

  return {
    params,
    search,
    setSearch,
    filter,
    setFilter,
    stage,
    setStage,
    tableState: { pagination, sorting },
    tableConfig: {
      manualPagination: true as const,
      manualSorting: true as const,
      pageCount: 0,
      state: { pagination, sorting },
      onPaginationChange,
      onSortingChange,
    },
  };
}
