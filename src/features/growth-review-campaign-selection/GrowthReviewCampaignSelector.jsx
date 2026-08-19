import { useState } from 'react'

import { cn } from '@/lib/utils'
import { Icon } from '@/shared/icons'
import {
  Button,
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/shared/ui'

function formatCampaignDate(value) {
  if (!value) {
    return ''
  }

  const date = new Date(`${String(value).slice(0, 10)}T00:00:00.000Z`)

  if (Number.isNaN(date.getTime())) {
    return ''
  }

  return date.toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'short',
    timeZone: 'UTC',
    year: 'numeric',
  })
}

function getCampaignMeta(campaign) {
  const startDate = formatCampaignDate(campaign?.activityStartDate)
  const calculationLabel = campaign?.hasCompletedCalculation ? 'Calculated' : 'Not calculated'

  return [startDate, calculationLabel].filter(Boolean).join(' · ')
}

function CampaignTitle({ campaign, className, isLoading }) {
  return (
    <h2 className={className}>
      {campaign?.name || (isLoading ? 'Loading campaign' : 'Reactivation campaign')}
    </h2>
  )
}

export function GrowthReviewCampaignSelector({
  campaigns = [],
  className = '',
  isLoading = false,
  onSelect,
  selectedCampaign,
  titleClassName = 'text-body font-semibold text-text-primary',
}) {
  const [isOpen, setIsOpen] = useState(false)
  const hasChoices = campaigns.length > 1

  if (!hasChoices) {
    return (
      <CampaignTitle
        campaign={selectedCampaign}
        className={cn(titleClassName, className)}
        isLoading={isLoading}
      />
    )
  }

  function selectCampaign(campaignId) {
    onSelect?.(campaignId)
    setIsOpen(false)
  }

  function handleOptionKeyDown(event, campaignId) {
    if (event.key !== 'Enter' && event.key !== ' ') {
      return
    }

    event.preventDefault()
    selectCampaign(campaignId)
  }

  const triggerLabel = selectedCampaign?.name || 'Select campaign'

  return (
    <Popover onOpenChange={setIsOpen} open={isOpen}>
      <PopoverTrigger asChild>
        <Button
          aria-expanded={isOpen}
          aria-label={triggerLabel}
          className={cn(
            '-mx-item h-auto max-w-full justify-start rounded-control px-item py-tag text-left hover:bg-control-hover',
            titleClassName,
            className,
          )}
          size="sm"
          type="button"
          variant="ghost"
        >
          <span className="min-w-0 truncate">{triggerLabel}</span>
          <Icon className="text-text-quaternary" name="chevronDown" size={16} />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-80 p-tag">
        <Command className="rounded-island bg-transparent">
          <CommandList>
            {isLoading ? (
              <CommandEmpty>Loading campaigns...</CommandEmpty>
            ) : (
              <CommandGroup className="p-tag" heading="Campaigns">
                {campaigns.map((campaign) => {
                  const isSelected = campaign.id === selectedCampaign?.id

                  return (
                    <CommandItem
                      aria-selected={isSelected}
                      className={cn(
                        'cursor-pointer gap-item px-control py-item',
                        isSelected && 'bg-control-selected text-text-primary',
                      )}
                      data-selected={isSelected}
                      key={campaign.id}
                      onClick={() => selectCampaign(campaign.id)}
                      onKeyDown={(event) => handleOptionKeyDown(event, campaign.id)}
                      tabIndex={0}
                    >
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-ui font-medium text-text-primary">
                          {campaign.name || 'Untitled campaign'}
                        </span>
                        <span className="mt-1 block truncate text-label font-medium text-text-muted">
                          {getCampaignMeta(campaign)}
                        </span>
                      </span>
                      {isSelected ? (
                        <Icon className="text-success" name="checkCircle2" size={16} />
                      ) : null}
                    </CommandItem>
                  )
                })}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
