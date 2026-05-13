import { Card, CardContent } from '@/components/ui/card'

import { Icon } from '../icons'

export function KpiCard({
  bgColor,
  color,
  helperText,
  iconName,
  label,
  trend,
  trendLabel = 'vs last month',
  value,
}) {
  return (
    <Card className="transition-shadow hover:shadow-block">
      <CardContent className="flex flex-col justify-between">
        <div className="mb-4 flex items-start justify-between">
          <div>
            <p className="mb-1 text-sm font-medium text-text-secondary">{label}</p>
            <h3 className="m-0 text-3xl font-bold text-text-primary">{value}</h3>
          </div>
          <div className={`rounded-block p-3 ${bgColor}`}>
            <Icon className={color} name={iconName} size={24} />
          </div>
        </div>
        {trend ? (
          <div className="mt-2 flex items-center">
            <span className="flex items-center text-sm font-medium text-success-foreground">
              <Icon className="mr-1" name="arrowUpRight" size={16} />
              {trend}
            </span>
            {trendLabel ? <span className="ml-2 text-sm text-text-muted">{trendLabel}</span> : null}
          </div>
        ) : helperText ? (
          <p className="mt-2 text-sm text-text-secondary">{helperText}</p>
        ) : null}
      </CardContent>
    </Card>
  )
}
