import { Button, Popover, PopoverContent, PopoverTrigger } from '@/shared/ui'
import { Icon } from '@/shared/icons'

export function AnalyticsExplanationPopover({ explanation, label }) {
  if (!explanation) {
    return null
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button aria-label={`How ${label} is calculated`} size="icon-sm" type="button" variant="ghost">
          <Icon name="helpCircle" size={16} />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="grid w-80 gap-component p-component">
        <div className="grid gap-tag">
          <p className="text-ui font-semibold text-text-primary">{label}</p>
          <p className="text-ui text-text-secondary">{explanation.description}</p>
        </div>
        <dl className="grid gap-control text-label">
          <div className="grid gap-micro">
            <dt className="text-text-muted">How it is calculated</dt>
            <dd className="text-text-primary">{explanation.calculation}</dd>
          </div>
          <div className="grid gap-micro">
            <dt className="text-text-muted">Source</dt>
            <dd className="text-text-primary">{explanation.source}</dd>
          </div>
          <div className="grid gap-micro">
            <dt className="text-text-muted">Date field</dt>
            <dd className="text-text-primary">{explanation.date_field}</dd>
          </div>
        </dl>
      </PopoverContent>
    </Popover>
  )
}
