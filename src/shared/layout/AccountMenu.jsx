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

import { clearAuthSession } from '../../domain/services/authService'
import { Icon } from '../icons'
import { useToast } from '../notifications'
import { useTheme } from '../theme'

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

export function AccountMenu({ activeRole, hasUnsavedChanges, onAuthChange, viewer }) {
  const navigate = useNavigate()
  const toast = useToast()

  return (
    <SidebarMenuItem>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <SidebarMenuButton
            aria-label="Open account menu"
            title={`${viewer.name} - ${activeRole.label}`}
            tooltip={viewer.name}
            type="button"
            variant="quiet"
          >
            <Icon className="text-current" name="user" size={18} />
            <span className="min-w-0 leading-tight">
              <span className="block truncate text-label text-text-primary">{viewer.name}</span>
              <span className="mt-0.5 block truncate text-label font-normal text-text-muted">{activeRole.label}</span>
            </span>
          </SidebarMenuButton>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-56" side="right">
          <DropdownMenuLabel>
            <span className="block text-ui text-text-primary">{viewer.name}</span>
            <span className="mt-0.5 block text-label font-normal text-text-secondary">{viewer.email}</span>
            <span className="mt-2 inline-flex rounded-full bg-control px-2 py-0.5 text-label text-text-secondary">
              {activeRole.label}
            </span>
          </DropdownMenuLabel>
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
              clearAuthSession()
              onAuthChange?.()
              navigate('/login', { replace: true })
            }}
          >
            Logout
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </SidebarMenuItem>
  )
}
