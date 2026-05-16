import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@/shared/ui'
import { Icon } from '@/shared/icons'

import { getTaskStatusMeta } from '../model'

const statusIconClasses = {
  amber: 'text-text-quaternary',
  blue: 'text-text-quaternary',
  green: 'text-text-quaternary',
  neutral: 'text-text-quaternary',
  purple: 'text-text-quaternary',
  rose: 'text-text-quaternary',
}

export function TaskStatusInlineValue({ status }) {
  const meta = getTaskStatusMeta(status)

  return (
    <span className="inline-flex items-center gap-2 text-ui text-text-primary">
      <Icon
        className={`shrink-0 ${statusIconClasses[meta.tone] ?? statusIconClasses.neutral}`}
        name={meta.icon ?? 'circle'}
        size={16}
      />
      {meta.label}
    </span>
  )
}

export function TaskStatusSelect({
  label = 'Change status',
  onChange,
  options,
  value,
}) {
  if (!options?.length || options.length <= 1) {
    return <TaskStatusInlineValue status={value} />
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button className="h-control-small gap-2 px-control-small" size="sm" type="button" variant="ghost">
          <TaskStatusInlineValue status={value} />
          <Icon className="text-text-muted" name="chevronDown" size={14} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel>{label}</DropdownMenuLabel>
        <DropdownMenuRadioGroup onValueChange={onChange} value={value}>
          {options.map((status) => {
            const meta = getTaskStatusMeta(status)

            return (
              <DropdownMenuRadioItem
                className="cursor-pointer"
                key={status}
                value={status}
              >
                <Icon
                  className={`shrink-0 ${statusIconClasses[meta.tone] ?? statusIconClasses.neutral}`}
                  name={meta.icon ?? 'circle'}
                  size={16}
                />
                <span className="min-w-0 flex-1 truncate">{meta.label}</span>
              </DropdownMenuRadioItem>
            )
          })}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
