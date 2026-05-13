import { Input } from '@/components/ui/input'

export function NumberField({ label, onValueChange, value, ...props }) {
  return (
    <label className="flex flex-col gap-item">
      <span className="text-label text-text-muted">{label}</span>
      <Input
        onChange={(event) => {
          const nextValue = event.target.value.trim()
          onValueChange(nextValue === '' ? Number.NaN : Number(nextValue))
        }}
        type="number"
        value={value}
        {...props}
      />
    </label>
  )
}
