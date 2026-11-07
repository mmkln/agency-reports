import { Link } from 'react-router-dom'

import { Icon } from '@/shared/icons'

import { Button } from './Button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useInspectorId } from './inspectorId'

function SettingsMenuItemContent({ item }) {
  return (
    <>
      {item.iconName ? (
        <Icon className="mt-micro text-text-muted" name={item.iconName} size={16} />
      ) : null}
      <span className="min-w-0">
        <span className="block font-medium text-text-primary">{item.label}</span>
        {item.description ? (
          <span className="mt-micro block text-label leading-snug text-text-muted">
            {item.description}
          </span>
        ) : null}
      </span>
    </>
  )
}

export function DashboardSettingsMenu({ id, items = [], label = 'Settings' }) {
  const inspectorId = useInspectorId('DashboardSettingsMenu', id)
  const visibleItems = items.filter((item) => item && item.hidden !== true)

  if (visibleItems.length === 0) {
    return null
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          className="h-8 rounded-control px-3 text-label"
          id={inspectorId}
          size="sm"
          type="button"
          variant="secondary"
        >
          <Icon name="settings" size={14} />
          {label}
          <Icon className="text-text-quaternary" name="chevronDown" size={14} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        {visibleItems.map((item) => (
          item.to ? (
            <DropdownMenuItem asChild className="items-start" key={item.id ?? item.label}>
              <Link to={item.to}>
                <SettingsMenuItemContent item={item} />
              </Link>
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem
              className="items-start"
              disabled={item.disabled}
              key={item.id ?? item.label}
              onSelect={() => item.onSelect?.()}
            >
              <SettingsMenuItemContent item={item} />
            </DropdownMenuItem>
          )
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
