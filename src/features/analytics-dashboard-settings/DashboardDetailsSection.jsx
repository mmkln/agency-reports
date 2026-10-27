import { Input, Label } from '@/shared/ui'

export function DashboardDetailsSection({ onTitleChange, title }) {
  return (
    <section className="grid gap-item">
      <Label htmlFor="analytics-dashboard-title">Dashboard name</Label>
      <Input
        id="analytics-dashboard-title"
        maxLength={255}
        onChange={(event) => onTitleChange(event.target.value)}
        required
        value={title}
      />
    </section>
  )
}
