import { Card, CardContent } from '@/components/ui/card'

import { Icon } from '../icons'
import { useInspectorId } from './inspectorId'

export function KpiCard({
  bgColor,
  color,
  helperText,
  id,
  iconName,
  label,
  trend,
  trendLabel = 'vs last month',
  value,
}) {
  const inspectorId = useInspectorId('KpiCard', id)

  return (
    <Card id={inspectorId} className="transition-shadow hover:shadow-block">
      <CardContent className="flex flex-col justify-between">
        <div className="mb-component flex items-start justify-between">
          <div>
            <p className="mb-micro text-label text-text-secondary">{label}</p>
            <h3 className="m-0 text-data text-text-primary">{value}</h3>
          </div>
          <div className={`rounded-block p-control ${bgColor}`}>
            <Icon className={color} name={iconName} size={24} />
          </div>
        </div>
        {trend ? (
          <div className="mt-item flex items-center">
            <span className="flex items-center text-ui text-success-foreground">
              <Icon className="mr-micro" name="arrowUpRight" size={16} />
              {trend}
            </span>
            {trendLabel ? <span className="ml-item text-ui text-text-muted">{trendLabel}</span> : null}
          </div>
        ) : helperText ? (
          <p className="mt-item text-ui text-text-secondary">{helperText}</p>
        ) : null}
      </CardContent>
    </Card>
  )
}
