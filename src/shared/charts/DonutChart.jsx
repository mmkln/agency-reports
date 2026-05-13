import { chartColors } from '../theme'

export function DonutChart({ centerLabel, centerValue, items }) {
  return (
    <div className="relative mb-8 h-64 w-64">
      <svg className="h-full w-full -rotate-90 transform" viewBox="0 0 42 42">
        <circle cx="21" cy="21" fill="transparent" r="15.91549430918954" stroke={chartColors.grid} strokeWidth="6" />
        {items.map((item, index) => {
          const previous = items.slice(0, index).reduce((sum, source) => sum + source.value, 0)

          return (
            <circle
              className="cursor-pointer transition-all duration-1000 ease-out hover:stroke-[8]"
              cx="21"
              cy="21"
              fill="transparent"
              key={item.name ?? item.label}
              r="15.91549430918954"
              stroke={item.color}
              strokeDasharray={`${item.value} ${100 - item.value}`}
              strokeDashoffset={100 - previous}
              strokeWidth="6"
            />
          )
        })}
      </svg>
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-bold text-text-primary">{centerValue}</span>
        <span className="text-xs font-semibold tracking-wider text-text-muted uppercase">{centerLabel}</span>
      </div>
    </div>
  )
}
