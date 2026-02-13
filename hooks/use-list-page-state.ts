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

  const handlePageChange = useCallback(
    (newPage: number) => setPage(newPage.toString()),
    [setPage],
  );

  const handleSetPerpage = useCallback(
    (newPerpage: number) => setPerpage(newPerpage.toString()),
    [setPerpage],
  );

  const pageNumber = page ? Number(page) : defaultPage;
  const perpageNumber = perpage ? Number(perpage) : defaultPerpage;

  return {
    search,
    setSearch,
    filter,
    setFilter,
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
