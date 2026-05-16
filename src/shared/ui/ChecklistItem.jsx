import { CloseIcon } from '../icons'
import { useInspectorId } from './inspectorId'

export function ChecklistItem({ children, checked = false, id, pendingIcon = true, strikethrough = false }) {
  const inspectorId = useInspectorId('ChecklistItem', id)

  return (
    <li id={inspectorId} className="flex items-start gap-2.5 text-ui text-text-secondary">
      <span
        className={`mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-label ${
          checked
            ? 'border-success bg-success text-text-inverted after:mt-[-1px] after:h-1 after:w-2 after:-rotate-45 after:border-b-2 after:border-l-2 after:border-text-inverted after:content-[""]'
            : 'border-control-border bg-control text-text-muted'
        }`}
        aria-hidden="true"
      >
        {checked || !pendingIcon ? null : <CloseIcon size={10} />}
      </span>
      <span className={checked && strikethrough ? 'text-text-muted line-through decoration-text-muted' : ''}>{children}</span>
    </li>
  )
}
