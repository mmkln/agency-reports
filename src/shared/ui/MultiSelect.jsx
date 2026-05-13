import { CheckIcon, ChevronsUpDown } from 'lucide-react'
import { useMemo, useState } from 'react'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

import { Popover, PopoverContent, PopoverTrigger } from './Popover'

export function MultiSelect({
  className,
  disabled = false,
  emptyText = 'No options found.',
  onChange,
  onContentClick,
  onTriggerClick,
  options,
  placeholder = 'Select options...',
  popoverClassName,
  size = 'default',
  value,
}) {
  const [open, setOpen] = useState(false)
  const selectedLabels = useMemo(
    () => options
      .filter((option) => value.includes(option.value))
      .map((option) => option.label),
    [options, value],
  )

  const toggleValue = (nextValue) => {
    if (value.includes(nextValue)) {
      onChange(value.filter((currentValue) => currentValue !== nextValue))
      return
    }

    onChange([...value, nextValue])
  }

  return (
    <Popover onOpenChange={setOpen} open={open}>
      <PopoverTrigger asChild>
        <Button
          className={cn(
            'w-full justify-between rounded-control border border-control-border bg-control text-left text-ui text-text-primary shadow-none hover:bg-control-hover',
            size === 'compact'
              ? 'h-control-small px-item py-tag text-label'
              : 'h-target px-component py-item',
            className,
          )}
          disabled={disabled}
          onClick={onTriggerClick}
          type="button"
          variant="ghost"
        >
          <span className="truncate">
            {selectedLabels.length ? selectedLabels.join(', ') : placeholder}
          </span>
          <ChevronsUpDown className="ml-item h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className={cn('w-popover max-w-viewport-safe p-item', popoverClassName)}
        onClick={onContentClick}
      >
        <div className="grid max-h-72 gap-micro overflow-y-auto">
          {options.length ? options.map((option) => {
            const selected = value.includes(option.value)

            return (
              <button
                className="flex items-center gap-item rounded-item px-control py-tag text-left text-ui text-text-primary transition-colors duration-motion-fast ease-motion-standard hover:bg-control-hover"
                key={String(option.value)}
                onClick={() => toggleValue(option.value)}
                type="button"
              >
                <span
                  className={cn(
                    'flex h-4 w-4 items-center justify-center rounded-sm border border-action',
                    selected
                      ? 'bg-premium-blue text-primary-foreground'
                      : 'border-separator text-text-quaternary [&_svg]:invisible',
                  )}
                >
                  <CheckIcon className="h-3 w-3" />
                </span>
                <span className="truncate">{option.label}</span>
              </button>
            )
          }) : (
            <p className="px-control py-item text-ui text-text-muted">{emptyText}</p>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}
