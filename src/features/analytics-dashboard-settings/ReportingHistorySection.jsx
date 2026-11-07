import { useId } from 'react'

import { Input, Label } from '@/shared/ui'

export function ReportingHistorySection({ onChange, value }) {
  const inputId = useId()
  const now = new Date()
  const today = [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, '0'),
    String(now.getDate()).padStart(2, '0'),
  ].join('-')

  return (
    <section className="grid gap-item">
      <div>
        <h3 className="text-ui font-semibold text-text-primary">Reporting history</h3>
        <p className="mt-micro text-label text-text-muted">
          Sets the earliest date included in all-time values. The selected report end date remains the cutoff.
        </p>
      </div>
      <div className="grid max-w-sm gap-tag">
        <Label htmlFor={inputId}>History start date</Label>
        <Input
          id={inputId}
          max={today}
          onChange={(event) => onChange(event.target.value)}
          type="date"
          value={value}
        />
      </div>
    </section>
  )
}
