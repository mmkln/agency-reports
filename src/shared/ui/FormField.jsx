import { Input } from '@/components/ui/input'

import { useInspectorId } from './inspectorId'

export function FormField({ id, inputId, label, onValueChange, value, ...props }) {
  const inspectorId = useInspectorId('FormField', id)
  const controlId = inputId ?? `${inspectorId}-input`

  return (
    <label className="flex flex-col gap-item" id={inspectorId}>
      <span className="text-label text-text-muted">{label}</span>
      <Input
        id={controlId}
        onChange={(event) => onValueChange(event.target.value)}
        value={value}
        {...props}
      />
    </label>
  )
}
