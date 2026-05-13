import { Input } from '@/components/ui/input'

export function FormField({ label, onValueChange, value, ...props }) {
  return (
    <label className="flex flex-col gap-item">
      <span className="text-label text-text-muted">{label}</span>
      <Input
        onChange={(event) => onValueChange(event.target.value)}
        value={value}
        {...props}
      />
    </label>
  )
}
