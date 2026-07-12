import { useMemo, useState } from "react";

export function usePagination<T>(items: T[], pageSize = 8) {
  const [page, setPage] = useState(1);
  const totalPages = Math.max(Math.ceil(items.length / pageSize), 1);

  const safePage = Math.min(page, totalPages);
  const paginatedItems = useMemo(() => {
    const start = (safePage - 1) * pageSize;
    return items.slice(start, start + pageSize);
  }, [items, safePage, pageSize]);

  const goToNextPage = () => setPage((prev) => Math.min(prev + 1, totalPages));
  const goToPreviousPage = () => setPage((prev) => Math.max(prev - 1, 1));

  return {
    page: safePage,
    totalPages,
    setPage,
    paginatedItems,
    goToNextPage,
    goToPreviousPage,
  };
}
