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
      className="fixed right-4 bottom-4 z-[80] w-[220px] rounded-lg border border-island-border bg-material-regular p-2 shadow-material backdrop-blur"
    >
      <div className="mb-1 px-2 text-label uppercase text-text-muted">
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
                'flex min-h-10 w-full items-center gap-2 rounded-md px-2.5 py-2 text-left text-ui transition',
                isActive
                  ? 'bg-control-selected text-text-primary shadow-sm'
                  : 'text-text-secondary hover:bg-control-hover hover:text-text-primary',
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
