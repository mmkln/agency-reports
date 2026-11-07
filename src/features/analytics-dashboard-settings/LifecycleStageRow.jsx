import { LIFECYCLE_STATUS_OPTIONS } from '@/entities/analytics-dashboard'
import {
  RadixSelect,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui'

const UNMAPPED_VALUE = 'unmapped'

export function LifecycleStageRow({ assignment, onChange, stage }) {
  return (
    <div className="grid gap-item py-item sm:grid-cols-[minmax(0,1fr)_minmax(12rem,0.72fr)] sm:items-center">
      <p className="min-w-0 truncate text-ui text-text-primary">{stage.label}</p>
      <RadixSelect
        onValueChange={(value) => onChange(stage.id, value === UNMAPPED_VALUE ? '' : value)}
        value={assignment || UNMAPPED_VALUE}
      >
        <SelectTrigger aria-label={`Reporting status for ${stage.label}`} size="sm">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={UNMAPPED_VALUE}>Not mapped</SelectItem>
          {LIFECYCLE_STATUS_OPTIONS.map((option) => (
            <SelectItem key={option.key} value={option.key}>{option.label}</SelectItem>
          ))}
        </SelectContent>
      </RadixSelect>
    </div>
  )
}
