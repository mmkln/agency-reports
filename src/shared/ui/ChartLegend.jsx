export function ChartLegend({ items, valueKey = 'value' }) {
  return (
    <div className="grid w-full grid-cols-2 gap-x-4 gap-y-3 px-4 max-[520px]:grid-cols-1">
      {items.map((item) => (
        <div className="flex items-center justify-between text-sm" key={item.name ?? item.label}>
          <div className="flex items-center">
            <span className="mr-2 h-3 w-3 rounded-full" style={{ backgroundColor: item.color }} />
            <span className="font-medium text-text-secondary">{item.name ?? item.label}</span>
          </div>
          <span className="font-medium text-text-muted">{item[valueKey]}%</span>
        </div>
      ))}
    </div>
  )
}
