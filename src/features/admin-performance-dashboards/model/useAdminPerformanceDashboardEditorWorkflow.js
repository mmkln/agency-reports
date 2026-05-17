import { useMemo, useState } from 'react'

import {
  createAppendixCell,
  createAppendixColumn,
  createAppendixRow,
  periodToForm,
} from './performanceDashboardEditorForm'
import { useAdminPerformanceDashboardEditorActions } from './useAdminPerformanceDashboardEditorActions'

export function useAdminPerformanceDashboardEditorWorkflow({
  clients,
  initialPeriod,
  runtime,
  toast,
}) {
  const [form, setForm] = useState(() => periodToForm(initialPeriod))
  const [validation, setValidation] = useState(null)
  const selectedClient = useMemo(
    () => clients.find((client) => client.id === form.clientId) ?? initialPeriod.client,
    [clients, form.clientId, initialPeriod.client],
  )
  const actions = useAdminPerformanceDashboardEditorActions({
    form,
    runtime,
    setForm,
    setValidation,
    toast,
  })

  function updateForm(patch) {
    setForm((currentForm) => ({
      ...currentForm,
      ...patch,
    }))
  }

  function updateContent(path, valueOrUpdater) {
    setForm((currentForm) => ({
      ...currentForm,
      content: {
        ...currentForm.content,
        [path]: typeof valueOrUpdater === 'function'
          ? valueOrUpdater(currentForm.content[path], currentForm)
          : valueOrUpdater,
      },
    }))
  }

  function updateExecutiveSummary(field, value) {
    updateContent('executive_summary', (currentSummary) => ({
      ...currentSummary,
      [field]: value,
    }))
  }

  function updateHeroMetric(field, value) {
    updateContent('hero_metric', (currentHeroMetric) => ({
      ...currentHeroMetric,
      [field]: value,
    }))
  }

  function updateArrayItem(collectionName, itemId, field, value) {
    updateContent(
      collectionName,
      (currentItems) => currentItems.map((item) => (
        item.id === itemId ? { ...item, [field]: value } : item
      )),
    )
  }

  function removeArrayItem(collectionName, itemId) {
    updateContent(
      collectionName,
      (currentItems) => currentItems.filter((item) => item.id !== itemId),
    )
  }

  function updateNestedArrayItem(collectionName, itemId, nestedCollectionName, nestedItemId, field, value) {
    updateContent(
      collectionName,
      (currentItems) => currentItems.map((item) => (
        item.id === itemId
          ? {
            ...item,
            [nestedCollectionName]: item[nestedCollectionName].map((nestedItem) => (
              nestedItem.id === nestedItemId ? { ...nestedItem, [field]: value } : nestedItem
            )),
          }
          : item
      )),
    )
  }

  function addNestedArrayItem(collectionName, itemId, nestedCollectionName, nestedItem) {
    updateContent(
      collectionName,
      (currentItems) => currentItems.map((item) => (
        item.id === itemId
          ? {
            ...item,
            [nestedCollectionName]: [...item[nestedCollectionName], nestedItem],
          }
          : item
      )),
    )
  }

  function removeNestedArrayItem(collectionName, itemId, nestedCollectionName, nestedItemId) {
    updateContent(
      collectionName,
      (currentItems) => currentItems.map((item) => (
        item.id === itemId
          ? {
            ...item,
            [nestedCollectionName]: item[nestedCollectionName].filter((nestedItem) => nestedItem.id !== nestedItemId),
          }
          : item
      )),
    )
  }

  function addAppendixColumn(tableId) {
    updateContent(
      'appendix_tables',
      (currentTables) => currentTables.map((table) => (
        table.id === tableId
          ? {
            ...table,
            columns: [...table.columns, createAppendixColumn()],
            rows: table.rows.map((row) => ({
              ...row,
              cells: [...row.cells, createAppendixCell()],
            })),
          }
          : table
      )),
    )
  }

  function removeAppendixColumn(tableId, columnId) {
    updateContent(
      'appendix_tables',
      (currentTables) => currentTables.map((table) => {
        if (table.id !== tableId) {
          return table
        }

        const columnIndex = table.columns.findIndex((column) => column.id === columnId)

        return {
          ...table,
          columns: table.columns.filter((column) => column.id !== columnId),
          rows: table.rows.map((row) => ({
            ...row,
            cells: columnIndex >= 0
              ? row.cells.filter((_, index) => index !== columnIndex)
              : row.cells,
          })),
        }
      }),
    )
  }

  function addAppendixRow(tableId) {
    updateContent(
      'appendix_tables',
      (currentTables) => currentTables.map((table) => (
        table.id === tableId
          ? {
            ...table,
            rows: [...table.rows, createAppendixRow(table.columns.length)],
          }
          : table
      )),
    )
  }

  function removeAppendixRow(tableId, rowId) {
    updateContent(
      'appendix_tables',
      (currentTables) => currentTables.map((table) => (
        table.id === tableId
          ? {
            ...table,
            rows: table.rows.filter((row) => row.id !== rowId),
          }
          : table
      )),
    )
  }

  function updateAppendixCell(tableId, rowId, cellId, value) {
    updateContent(
      'appendix_tables',
      (currentTables) => currentTables.map((table) => (
        table.id === tableId
          ? {
            ...table,
            rows: table.rows.map((row) => (
              row.id === rowId
                ? {
                  ...row,
                  cells: row.cells.map((cell) => (
                    cell.id === cellId ? { ...cell, value } : cell
                  )),
                }
                : row
            )),
          }
          : table
      )),
    )
  }

  return {
    ...actions,
    addAppendixColumn,
    addAppendixRow,
    addNestedArrayItem,
    form,
    removeAppendixColumn,
    removeAppendixRow,
    removeArrayItem,
    removeNestedArrayItem,
    selectedClient,
    updateAppendixCell,
    updateArrayItem,
    updateContent,
    updateExecutiveSummary,
    updateForm,
    updateHeroMetric,
    updateNestedArrayItem,
    validation,
  }
}
