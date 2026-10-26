import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  EmptyState,
  ResourceState,
  ScrollArea,
  SearchField,
  Skeleton,
  TablePagination,
} from '@/shared/ui'

import { ContactCollectionList } from './ContactCollectionList'
import { useContactCollection } from './useContactCollection'

function collectionSummary(collection) {
  if (!collection) {
    return 'Records included in this metric.'
  }
  const itemLabel = collection.totalRecords === 1
    ? collection.itemLabel
    : collection.itemLabelPlural
  const contactLabel = collection.uniqueContacts === 1 ? 'contact' : 'contacts'
  return `${collection.totalRecords.toLocaleString()} ${itemLabel} from ${collection.uniqueContacts.toLocaleString()} ${contactLabel}`
}

function CollectionLoadingState() {
  return (
    <div className="grid gap-0">
      {Array.from({ length: 6 }, (_, index) => (
        <div className="grid gap-tag border-b border-separator px-panel py-item" key={index}>
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-3 w-48 max-w-full" />
        </div>
      ))}
    </div>
  )
}

export function ContactCollectionDialog({ descriptor, onOpenChange, open, period, runtime }) {
  const state = useContactCollection({ descriptor, open, runtime })
  const collection = state.collection
  const pagination = collection?.pagination
  const totalItems = pagination?.totalItems ?? 0
  const startItem = totalItems === 0 ? 0 : (pagination.page - 1) * pagination.pageSize + 1
  const endItem = Math.min(pagination?.page * pagination?.pageSize || 0, totalItems)

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent className="max-h-overlay w-[calc(100vw-2rem)] max-w-modal-lg gap-0 overflow-hidden p-0">
        <DialogHeader className="border-b border-separator px-panel py-card pr-control-xl text-left">
          <DialogTitle>{collection?.title ?? descriptor.title}</DialogTitle>
          <DialogDescription>{collectionSummary(collection)}</DialogDescription>
        </DialogHeader>

        <div className="border-b border-separator px-panel py-item">
          <SearchField
            onValueChange={state.setQuery}
            placeholder="Search contacts"
            value={state.query}
          />
        </div>

        <ScrollArea className="max-h-overlay-detail-body min-h-0">
          {state.status === 'loading' ? <CollectionLoadingState /> : null}
          {state.status === 'error' ? (
            <ResourceState
              className="min-h-72 rounded-none bg-transparent"
              errorInfo={state.errorInfo}
              onRetry={state.reload}
            />
          ) : null}
          {state.status === 'ready' && collection?.items.length === 0 ? (
            <EmptyState
              className="min-h-72 rounded-none bg-transparent px-panel py-card"
              description={state.query ? 'Try another name, email, or phone.' : `No ${collection.itemLabelPlural} are included in this metric.`}
              iconName={collection.grain === 'appointment' ? 'calendar' : 'users'}
              title={state.query ? 'No matching contacts' : `No ${collection.itemLabelPlural} to show`}
            />
          ) : null}
          {state.status === 'ready' && collection?.items.length ? (
            <ContactCollectionList items={collection.items} timezone={period?.timezone} />
          ) : null}
        </ScrollArea>

        {pagination ? (
          <div className="border-t border-separator">
            <TablePagination
              canNextPage={pagination.page < pagination.totalPages}
              canPreviousPage={pagination.page > 1}
              endItem={endItem}
              itemLabel={collection.itemLabelPlural}
              nextPage={() => state.setPage(pagination.page + 1)}
              pageSize={pagination.pageSize}
              pageSizeOptions={[10, 25, 50]}
              previousPage={() => state.setPage(pagination.page - 1)}
              setPageSize={state.setPageSize}
              startItem={startItem}
              totalItems={totalItems}
            />
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  )
}
