import {
  Select as RadixSelect,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

import { Icon } from '../icons'
import { IconButton } from './IconButton'
import { useInspectorId } from './inspectorId'

export function TablePagination({
  canNextPage,
  canPreviousPage,
  endItem,
  id,
  itemLabel = 'items',
  nextPage,
  pageSize,
  pageSizeOptions = [5, 10, 25, 50],
  previousPage,
  setPageSize,
  startItem,
  totalItems,
}) {
  const inspectorId = useInspectorId('TablePagination', id)

  if (totalItems <= pageSizeOptions[0]) {
    return null
  }

  return (
    <div
      className="flex flex-wrap items-center justify-between gap-control px-component py-item"
      id={inspectorId}
    >
      <p className="text-label text-text-muted">
        {startItem}-{endItem} of {totalItems} {itemLabel}
      </p>

      <div className="flex items-center gap-item">
        <RadixSelect onValueChange={setPageSize} value={String(pageSize)}>
          <SelectTrigger className="w-auto gap-tag px-control" size="sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent align="end">
            {pageSizeOptions.map((option) => (
              <SelectItem key={option} value={String(option)}>
                {option} rows
              </SelectItem>
            ))}
          </SelectContent>
        </RadixSelect>

        <div className="flex items-center gap-tag">
          <IconButton
            aria-label="Previous page"
            disabled={!canPreviousPage}
            onClick={previousPage}
            size="sm"
            type="button"
            variant="ghost"
          >
            <Icon name="chevronLeft" size={15} />
          </IconButton>
          <IconButton
            aria-label="Next page"
            disabled={!canNextPage}
            onClick={nextPage}
            size="sm"
            type="button"
            variant="ghost"
          >
            <Icon name="chevronRight" size={15} />
          </IconButton>
        </div>
      </div>
    </div>
  )
}
