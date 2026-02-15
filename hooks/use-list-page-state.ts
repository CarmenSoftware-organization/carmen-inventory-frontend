"use client";

import { useCallback } from "react";
import { useURL } from "./use-url";

interface UseListPageStateOptions {
  defaultPerpage?: number;
  defaultPage?: number;
}

export function useListPageState(options: UseListPageStateOptions = {}) {
  const { defaultPerpage = 10, defaultPage = 1 } = options;

  const [search, setSearch] = useURL("search");
  const [filter, setFilter] = useURL("filter");
  const [sort, setSort] = useURL("sort");
  const [page, setPage] = useURL("page");
  const [perpage, setPerpage] = useURL("perpage");
  const [stage, setStageRaw] = useURL("workflow_current_stage");

  const handlePageChange = useCallback(
    (newPage: number) => setPage(newPage.toString()),
    [setPage],
  );

  const handleSetPerpage = useCallback(
    (newPerpage: number) => setPerpage(newPerpage.toString()),
    [setPerpage],
  );

  const handleSetSearch = useCallback(
    (value: string) => {
      setSearch(value);
      setPage("");
    },
    [setSearch, setPage],
  );

  const handleSetFilter = useCallback(
    (value: string) => {
      setFilter(value);
      setPage("");
    },
    [setFilter, setPage],
  );

  const handleSetStage = useCallback(
    (value: string) => {
      setStageRaw(value);
      setPage("");
    },
    [setStageRaw, setPage],
  );

  const pageNumber = page ? Number(page) : defaultPage;
  const perpageNumber = perpage ? Number(perpage) : defaultPerpage;

  return {
    search,
    setSearch: handleSetSearch,
    filter,
    setFilter: handleSetFilter,
    stage,
    setStage: handleSetStage,
    sort,
    setSort,
    page,
    setPage,
    perpage,
    setPerpage,
    handlePageChange,
    handleSetPerpage,
    pageNumber,
    perpageNumber,
  };
}
