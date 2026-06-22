import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar'
import { useNavigate } from 'react-router-dom'

import { Icon } from '../icons'
import { useToast } from '../notifications'
import { useTheme } from '../theme'
import { Button } from '../ui'

function ThemeModeControl() {
  const { resolvedTheme, setTheme, theme } = useTheme()

  return (
    <div className="px-1 py-1">
      <DropdownMenuLabel className="px-control py-tag">
        <span className="block text-label text-text-secondary">Appearance</span>
        <span className="mt-0.5 block text-label font-normal text-text-muted">
          Current: {resolvedTheme === 'dark' ? 'dark' : 'light'}
        </span>
      </DropdownMenuLabel>
      <DropdownMenuRadioGroup onValueChange={setTheme} value={theme}>
        <DropdownMenuRadioItem value="light">Light</DropdownMenuRadioItem>
        <DropdownMenuRadioItem value="dark">Dark</DropdownMenuRadioItem>
        <DropdownMenuRadioItem value="system">System</DropdownMenuRadioItem>
      </DropdownMenuRadioGroup>
    </div>
  )
}

function AccountMenuTrigger({ activeRole, presentation, viewer, ...triggerProps }) {
  if (presentation === 'header') {
    return (
      <Button
        aria-label="Open account menu"
        className="h-control-small gap-tag px-control"
        title={`${viewer.name} - ${activeRole.label}`}
        type="button"
        variant="ghost"
        {...triggerProps}
      >
        <Icon className="text-current" name="user" size={16} />
        <span className="hidden max-w-chip truncate text-label text-text-primary sm:inline">
          {viewer.name}
        </span>
      </Button>
    )
  }

  return (
    <SidebarMenuButton
      aria-label="Open account menu"
      title={`${viewer.name} - ${activeRole.label}`}
      tooltip={viewer.name}
      type="button"
      variant="quiet"
      {...triggerProps}
    >
      <Icon className="text-current" name="user" size={18} />
      <span className="min-w-0 leading-tight">
        <span className="block truncate text-label text-text-primary">{viewer.name}</span>
        <span className="mt-0.5 block truncate text-label font-normal text-text-muted">{activeRole.label}</span>
      </span>
    </SidebarMenuButton>
  )
}

function AccountMenuContent({ activeRole, align = 'start', hasUnsavedChanges, onSignOut, side = 'right', viewer }) {
  const navigate = useNavigate()
  const toast = useToast()

  return (
    <DropdownMenuContent align={align} className="w-56" side={side}>
      <DropdownMenuLabel>
        <span className="block text-ui text-text-primary">{viewer.name}</span>
        <span className="mt-0.5 block text-label font-normal text-text-secondary">{viewer.email}</span>
        <span className="mt-2 inline-flex rounded-full bg-control px-2 py-0.5 text-label text-text-secondary">
          {activeRole.label}
        </span>
      </DropdownMenuLabel>
      <DropdownMenuSeparator />
      <DropdownMenuItem
        className="cursor-pointer"
        onSelect={() => navigate('/account/settings')}
      >
        Account settings
      </DropdownMenuItem>
      <DropdownMenuSeparator />
      <ThemeModeControl />
      <DropdownMenuSeparator />
      <DropdownMenuItem
        className="cursor-pointer text-destructive focus:text-destructive"
        onSelect={() => {
          if (
            hasUnsavedChanges
            && !window.confirm('You have unsaved editor changes. Sign out anyway?')
          ) {
            return
          }

          toast.info('Signed out', 'You have returned to the login screen.')
          onSignOut?.()
          navigate('/login', { replace: true })
        }}
      >
        Logout
      </DropdownMenuItem>
    </DropdownMenuContent>
  )
}

export function AccountMenu({
  activeRole,
  align,
  hasUnsavedChanges,
  onSignOut,
  presentation = 'sidebar',
  side,
  viewer,
}) {
  const menu = (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <AccountMenuTrigger activeRole={activeRole} presentation={presentation} viewer={viewer} />
      </DropdownMenuTrigger>
      <AccountMenuContent
        activeRole={activeRole}
        align={align}
        hasUnsavedChanges={hasUnsavedChanges}
        onSignOut={onSignOut}
        side={side}
        viewer={viewer}
      />
    </DropdownMenu>
  )

  if (presentation === 'header') {
    return menu
  }

  return (
    <SidebarMenuItem>
      {menu}
    </SidebarMenuItem>
  )
}
