import { CheckCircle2, ShieldCheck, User } from 'lucide-react'

import { DEMO_ROLE_OPTIONS } from '../providers/session/demoRoleSwitch'

const iconByName = {
  checkCircle2: CheckCircle2,
  shieldCheck: ShieldCheck,
  user: User,
}

export function DemoRoleSwitcher({ activeRoleKey, onRoleChange }) {
  return (
    <aside
      aria-label="Demo role switcher"
      className="fixed bottom-4 left-4 z-[80] w-[220px] rounded-lg border border-slate-200 bg-white/95 p-2 shadow-xl shadow-slate-950/10 backdrop-blur"
    >
      <div className="mb-1 px-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-500">
        Demo role
      </div>
      <div className="grid gap-1">
        {DEMO_ROLE_OPTIONS.map((option) => {
          const Icon = iconByName[option.iconName] ?? User
          const isActive = option.key === activeRoleKey

          return (
            <button
              aria-pressed={isActive}
              className={[
                'flex min-h-10 w-full items-center gap-2 rounded-md px-2.5 py-2 text-left text-sm transition',
                isActive
                  ? 'bg-slate-950 text-white shadow-sm'
                  : 'text-slate-700 hover:bg-slate-100 hover:text-slate-950',
              ].join(' ')}
              key={option.key}
              onClick={() => onRoleChange(option.key)}
              title={option.description}
              type="button"
            >
              <Icon className="size-4 shrink-0" aria-hidden="true" />
              <span className="min-w-0 flex-1 truncate font-medium">{option.label}</span>
            </button>
          )
        })}
      </div>
    </aside>
  )
}
