import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@/shared/ui'

import { CLIENT_STATUSES, CLIENT_STATUS_META } from '../../../entities/client'
import { Icon } from '../../../shared/icons'

const statusOrder = [
  CLIENT_STATUSES.SETUP,
  CLIENT_STATUSES.ON_TRACK,
  CLIENT_STATUSES.NEEDS_ATTENTION,
  CLIENT_STATUSES.WAITING_CLIENT,
  CLIENT_STATUSES.BLOCKED,
  CLIENT_STATUSES.PAUSED,
]

const statusDescriptions = {
  [CLIENT_STATUSES.SETUP]: 'Workspace is being configured.',
  [CLIENT_STATUSES.ON_TRACK]: 'Work is progressing normally.',
  [CLIENT_STATUSES.NEEDS_ATTENTION]: 'Something needs review.',
  [CLIENT_STATUSES.WAITING_CLIENT]: 'Waiting for client action/approval.',
  [CLIENT_STATUSES.BLOCKED]: 'Work cannot move forward.',
  [CLIENT_STATUSES.PAUSED]: 'Work is intentionally paused.',
}

const toneIconClass = {
  green: 'text-success',
  amber: 'text-warning',
  rose: 'text-destructive',
  purple: 'text-premium-purple',
  neutral: 'text-text-muted',
  blue: 'text-action',
}

function StatusGlyph({ meta, size = 14 }) {
  return (
    <Icon
      aria-hidden="true"
      className={`shrink-0 ${toneIconClass[meta.tone] ?? toneIconClass.neutral}`}
      name={meta.icon}
      size={size}
    />
  )
}

export function ClientStatusSelector({ onSelect, status }) {
  const currentMeta = CLIENT_STATUS_META[status] ?? { label: status || 'Unknown', tone: 'neutral' }

  if (!onSelect) {
    return (
      <span aria-label={`Project status: ${currentMeta.label}`} className="inline-flex items-center gap-tag text-ui text-text-primary">
        <StatusGlyph meta={currentMeta} />
        {currentMeta.label}
      </span>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          aria-label={`Change project status. Current: ${currentMeta.label}. ${statusDescriptions[status] ?? ''}`}
          size="sm"
          type="button"
          variant="ghost"
        >
          <StatusGlyph meta={currentMeta} />
          <span>{currentMeta.label}</span>
          <Icon className="text-text-quaternary" name="chevronDown" size={12} />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="min-w-60" sideOffset={6}>
        <DropdownMenuRadioGroup onValueChange={onSelect} value={status}>
          {statusOrder.map((option) => {
            const meta = CLIENT_STATUS_META[option]

            return (
              <DropdownMenuRadioItem
                key={option}
                title={statusDescriptions[option]}
                value={option}
              >
                <StatusGlyph meta={meta} size={16} />
                <span className="whitespace-nowrap">{meta.label}</span>
              </DropdownMenuRadioItem>
            )
          })}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
