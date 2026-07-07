import { useMemo, useState } from 'react'

export function usePagination({
  initialPageSize = 5,
  items,
  pageSizeOptions = [5, 10, 25, 50],
}) {
  const [pageIndex, setPageIndex] = useState(0)
  const [pageSize, setPageSizeValue] = useState(initialPageSize)
  const totalItems = items.length
  const pageCount = Math.max(1, Math.ceil(totalItems / pageSize))
  const safePageIndex = Math.min(pageIndex, pageCount - 1)
  const startItem = totalItems === 0 ? 0 : safePageIndex * pageSize + 1
  const endItem = Math.min((safePageIndex + 1) * pageSize, totalItems)

  const pageItems = useMemo(
    () => items.slice(safePageIndex * pageSize, safePageIndex * pageSize + pageSize),
    [items, pageSize, safePageIndex],
  )

  function setPageSize(nextPageSize) {
    setPageSizeValue(Number(nextPageSize))
    setPageIndex(0)
  }

  return {
    canNextPage: safePageIndex < pageCount - 1,
    canPreviousPage: safePageIndex > 0,
    endItem,
    nextPage: () => setPageIndex((value) => Math.min(value + 1, pageCount - 1)),
    pageCount,
    pageIndex: safePageIndex,
    pageItems,
    pageSize,
    pageSizeOptions,
    previousPage: () => setPageIndex((value) => Math.max(value - 1, 0)),
    setPageIndex,
    setPageSize,
    startItem,
    totalItems,
  }
}
