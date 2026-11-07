import { useState } from 'react'

import { getGrowthReviewReviewStatusMeta } from '@/entities/growth-review-review'
import { cn } from '@/lib/utils'
import { Icon } from '@/shared/icons'
import {
  Button,
  Command,
  CommandGroup,
  CommandItem,
  CommandList,
  Popover,
  PopoverContent,
  PopoverTrigger,
  StatusBadge,
} from '@/shared/ui'

function formatReviewDate(value) {
  if (!value) {
    return 'Start date not set'
  }

  const date = new Date(`${value}T00:00:00.000Z`)

  if (Number.isNaN(date.getTime())) {
    return 'Start date not set'
  }

  return date.toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'short',
    timeZone: 'UTC',
    year: 'numeric',
  })
}

export function ReviewSwitcher({
  onCreate,
  onSelect,
  reviews,
  selectedReview,
}) {
  const [isOpen, setIsOpen] = useState(false)
  const statusMeta = getGrowthReviewReviewStatusMeta(selectedReview.status)

  function selectReview(reviewId) {
    onSelect(reviewId)
    setIsOpen(false)
  }

  function createReview() {
    setIsOpen(false)
    onCreate()
  }

  return (
    <Popover onOpenChange={setIsOpen} open={isOpen}>
      <PopoverTrigger asChild>
        <Button
          aria-expanded={isOpen}
          aria-label={`Selected campaign review: ${selectedReview.name}`}
          className="-mx-control h-auto w-fit max-w-full justify-self-start justify-start px-control py-item text-left"
          type="button"
          variant="ghost"
        >
          <span className="min-w-0">
            <span className="block truncate text-ui font-semibold text-text-primary">
              {selectedReview.name}
            </span>
          </span>
          <StatusBadge meta={statusMeta} />
          <Icon className="text-text-quaternary" name="chevronDown" size={16} />
        </Button>
      </PopoverTrigger>

      <PopoverContent align="start" className="w-popover p-tag">
        <Command className="rounded-island bg-transparent">
          <CommandList>
            <CommandGroup className="p-tag" heading="Campaign reviews">
              {reviews.map((review) => {
                const isSelected = review.id === selectedReview.id

                return (
                  <CommandItem
                    aria-selected={isSelected}
                    className={cn(
                      'cursor-pointer gap-item px-control py-item',
                      isSelected && 'bg-control-selected text-text-primary',
                    )}
                    data-selected={isSelected}
                    key={review.id}
                    onClick={() => selectReview(review.id)}
                  >
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-ui font-medium text-text-primary">
                        {review.name}
                      </span>
                      <span className="mt-micro block truncate text-label font-normal text-text-muted">
                        {formatReviewDate(review.activityStartDate)}
                        {review.isDefault ? ' · Default' : ''}
                      </span>
                    </span>
                    {isSelected ? (
                      <Icon className="shrink-0 text-success" name="checkCircle2" size={16} />
                    ) : null}
                  </CommandItem>
                )
              })}
            </CommandGroup>
          </CommandList>
        </Command>

        <div className="border-t border-separator pt-tag">
          <Button
            className="w-full justify-start"
            onClick={createReview}
            type="button"
            variant="ghost"
          >
            <Icon name="plus" size={16} />
            Add campaign review
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}
