import { Input } from '@/components/ui/input'

import { useInspectorId } from './inspectorId'

export function NumberField({ id, inputId, label, onValueChange, value, ...props }) {
  const inspectorId = useInspectorId('NumberField', id)
  const controlId = inputId ?? `${inspectorId}-input`

  return (
    <label className="flex flex-col gap-item" id={inspectorId}>
      <span className="text-label text-text-muted">{label}</span>
      <Input
        id={controlId}
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
