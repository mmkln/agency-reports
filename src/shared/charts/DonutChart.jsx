import { chartColors } from '../theme'

export function DonutChart({ centerLabel, centerValue, items }) {
  return (
    <div className="relative mb-card h-64 w-64">
      <svg className="h-full w-full -rotate-90 transform" viewBox="0 0 42 42">
        <circle cx="21" cy="21" fill="transparent" r="15.91549430918954" stroke={chartColors.grid} strokeWidth="6" />
        {items.map((item, index) => {
          const previous = items.slice(0, index).reduce((sum, source) => sum + source.value, 0)

          return (
            <circle
              className="cursor-pointer transition-[stroke-width] duration-motion-slow ease-motion-standard hover:stroke-[8]"
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
        <span className="text-data text-text-primary">{centerValue}</span>
        <span className="text-label text-text-muted uppercase">{centerLabel}</span>
      </div>
    </div>
  )
}
