import { CloseIcon } from '../icons'

export function ChecklistItem({ children, checked = false, pendingIcon = true, strikethrough = false }) {
  return (
    <li className="flex items-start gap-2.5 text-sm text-slate-700">
      <span
        className={`mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-[0.68rem] font-black ${
          checked
            ? 'border-emerald-600 bg-emerald-600 text-white after:mt-[-1px] after:h-1 after:w-2 after:-rotate-45 after:border-b-2 after:border-l-2 after:border-white after:content-[""]'
            : 'border-slate-300 bg-white text-slate-400'
        }`}
        aria-hidden="true"
      >
        {checked || !pendingIcon ? null : <CloseIcon size={10} />}
      </span>
      <span className={checked && strikethrough ? 'text-slate-500 line-through decoration-slate-400' : ''}>{children}</span>
    </li>
  )
}
