import { useState } from 'react'
import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

import { cn } from '@/lib/utils'

import { Icon } from '../icons'
import { useInspectorId } from './inspectorId'

function getColumnMeta(column) {
  return column.columnDef.meta ?? {}
}

function getColumnLabel(header) {
  const meta = getColumnMeta(header.column)

  if (meta.label) {
    return meta.label
  }

  return typeof header.column.columnDef.header === 'string'
    ? header.column.columnDef.header
    : header.column.id
}

function getHeaderClassName(column) {
  const meta = getColumnMeta(column)

  return cn(
    meta.align === 'right' ? 'text-right' : '',
    meta.nowrap ? 'whitespace-nowrap' : '',
    meta.isAction ? 'sticky right-0 z-30 bg-block text-right' : '',
    meta.headerClassName,
  )
}

function getCellClassName(column) {
  const meta = getColumnMeta(column)

  return cn(
    meta.align === 'right' ? 'text-right' : '',
    meta.nowrap ? 'whitespace-nowrap' : '',
    meta.truncate ? 'max-w-title truncate' : '',
    meta.minWidthClassName,
    meta.isAction ? 'sticky right-0 z-20 bg-block text-right group-hover/table-row:bg-control-hover' : '',
    meta.cellClassName,
  )
}

function getSortLabel(sortState) {
  if (sortState === 'asc') {
    return 'Sorted ascending'
  }

  if (sortState === 'desc') {
    return 'Sorted descending'
  }

  return 'Not sorted'
}

function SortIcon({ sortState }) {
  return (
    <Icon
      className={cn(
        'text-text-muted transition-transform duration-motion-fast ease-motion-standard',
        sortState === 'asc' ? 'rotate-180 text-text-secondary' : '',
        sortState === 'desc' ? 'text-text-secondary' : '',
        !sortState ? 'opacity-40' : '',
      )}
      name="chevronDown"
      size={14}
    />
  )
}

function HeaderContent({ header }) {
  const content = flexRender(header.column.columnDef.header, header.getContext())

  if (!header.column.getCanSort()) {
    return content
  }

  const sortState = header.column.getIsSorted()

  return (
    <button
      aria-label={`${getColumnLabel(header)}: ${getSortLabel(sortState)}`}
      className="inline-flex h-control-small items-center gap-tag rounded-control px-0 text-left text-label font-medium text-text-muted transition-colors duration-motion-fast ease-motion-standard hover:text-text-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
      onClick={header.column.getToggleSortingHandler()}
      type="button"
    >
      {content}
      <SortIcon sortState={sortState} />
    </button>
  )
}

function DataTablePagination({ table }) {
  if (table.getPageCount() <= 1) {
    return null
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-control px-component pb-component">
      <p className="text-label text-text-muted">
        Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
      </p>
      <div className="flex items-center gap-control">
        <button
          className="inline-flex h-control-small items-center justify-center rounded-control border border-control-border bg-control px-control text-label text-text-primary transition-colors duration-motion-fast ease-motion-standard hover:bg-control-hover disabled:pointer-events-none disabled:bg-surface-muted disabled:text-text-muted disabled:opacity-70"
          disabled={!table.getCanPreviousPage()}
          onClick={() => table.previousPage()}
          type="button"
        >
          Previous
        </button>
        <button
          className="inline-flex h-control-small items-center justify-center rounded-control border border-control-border bg-control px-control text-label text-text-primary transition-colors duration-motion-fast ease-motion-standard hover:bg-control-hover disabled:pointer-events-none disabled:bg-surface-muted disabled:text-text-muted disabled:opacity-70"
          disabled={!table.getCanNextPage()}
          onClick={() => table.nextPage()}
          type="button"
        >
          Next
        </button>
      </div>
    </div>
  )
}

export function DataTable({
  columns,
  data,
  emptyMessage = 'No results.',
  enablePagination = true,
  getRowId,
  id,
  pageSize = 10,
}) {
  const inspectorId = useInspectorId('DataTable', id)
  const [sorting, setSorting] = useState([])
  // TanStack Table intentionally returns stateful table functions from this hook.
  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    columns,
    data,
    enableSortingRemoval: true,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: enablePagination ? getPaginationRowModel() : undefined,
    getRowId,
    getSortedRowModel: getSortedRowModel(),
    initialState: {
      pagination: {
        pageSize,
      },
    },
    onSortingChange: setSorting,
    state: {
      sorting,
    },
  })
  const visibleColumns = table.getAllLeafColumns().length

  return (
    <div id={inspectorId} className="grid gap-component">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                return (
                  <TableHead
                    className={getHeaderClassName(header.column)}
                    key={header.id}
                  >
                    {header.isPlaceholder ? null : <HeaderContent header={header} />}
                  </TableHead>
                )
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow key={row.id}>
                {row.getVisibleCells().map((cell) => {
                  return (
                    <TableCell
                      className={getCellClassName(cell.column)}
                      key={cell.id}
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  )
                })}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell className="text-text-muted" colSpan={visibleColumns}>
                {emptyMessage}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      {enablePagination ? <DataTablePagination table={table} /> : null}
    </div>
  )
}
