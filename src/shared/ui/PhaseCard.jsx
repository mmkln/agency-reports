import { Icon } from '../icons'
import { ChecklistItem } from './ChecklistItem'
import { useInspectorId } from './inspectorId'
import { ProgressBar } from './ProgressBar'

export function PhaseCard({ accent = 'blue', duration, iconName, id, items, phase, progress, status, title }) {
  const inspectorId = useInspectorId('PhaseCard', id)
  const accentClass = {
    blue: {
      background: 'bg-action-muted',
      border: 'border-l-action',
      text: 'text-action',
    },
    green: {
      background: 'bg-success-muted/70',
      border: 'border-l-success',
      text: 'text-success-foreground',
    },
    orange: {
      background: 'bg-warning-muted/70',
      border: 'border-l-warning',
      text: 'text-warning-foreground',
    },
    purple: {
      background: 'bg-chart-4/10',
      border: 'border-l-chart-4',
      text: 'text-chart-4',
    },
    rose: {
      background: 'bg-destructive/10/70',
      border: 'border-l-destructive',
      text: 'text-destructive',
    },
  }[accent]

  return (
    <article id={inspectorId} className={`rounded-block border-l-4 p-card ${accentClass.background} ${accentClass.border}`}>
      <div className="mb-5 flex items-start justify-between gap-4 max-[640px]:flex-col">
        <div className="flex items-start gap-3">
          {iconName ? <Icon className={`mt-1 ${accentClass.text}`} name={iconName} size={30} /> : null}
          <div>
            <h3 className="m-0 text-heading text-text-primary">
              {phase}: {title}
            </h3>
            {duration ? <p className="mt-1 text-ui text-text-secondary">Duration: {duration}</p> : null}
          </div>
        </div>
        <div className="text-right max-[640px]:text-left">
          <p className="m-0 text-ui text-text-secondary">Progress</p>
          <strong className="block text-data tabular-nums text-text-primary">{progress}%</strong>
          {status ? <span className="sr-only">{status}</span> : null}
        </div>
      </div>

      <ProgressBar label={`${phase} progress`} showLabel={false} tone={accent} value={progress} />

      <ul className="m-0 mt-5 grid list-none gap-2.5 p-0">
        {items.map((item) => (
          <ChecklistItem checked={item.checked} key={item.label} pendingIcon={false} strikethrough>
            {item.label}
          </ChecklistItem>
        ))}
      </ul>
    </article>
  )
}
