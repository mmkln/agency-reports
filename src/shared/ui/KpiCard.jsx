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
    <Card className="transition-shadow hover:shadow-sm">
      <CardContent className="flex flex-col justify-between">
        <div className="mb-4 flex items-start justify-between">
          <div>
            <p className="mb-1 text-sm font-medium text-slate-500">{label}</p>
            <h3 className="m-0 text-3xl font-bold text-slate-900">{value}</h3>
          </div>
          <div className={`rounded-xl p-3 ${bgColor}`}>
            <Icon className={color} name={iconName} size={24} />
          </div>
        </div>
        {trend ? (
          <div className="mt-2 flex items-center">
            <span className="flex items-center text-sm font-medium text-emerald-600">
              <Icon className="mr-1" name="arrowUpRight" size={16} />
              {trend}
            </span>
            {trendLabel ? <span className="ml-2 text-sm text-slate-400">{trendLabel}</span> : null}
          </div>
        ) : helperText ? (
          <p className="mt-2 text-sm text-slate-500">{helperText}</p>
        ) : null}
      </CardContent>
    </Card>
  )
}
