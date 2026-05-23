import { useMemo, useState } from 'react'

import {
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/shared/ui'
import { cn } from '@/lib/utils'
import { CLIENT_STATUS_META, CLIENT_TYPE_META } from '@/entities/client'
import { Icon } from '@/shared/icons'

function getClientInitials(client) {
  return String(client?.name ?? '')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('') || 'AC'
}

function getClientMeta(client) {
  if (!client) {
    return 'Account workspace'
  }

  const statusLabel = CLIENT_STATUS_META[client.status]?.label
  const typeLabel = CLIENT_TYPE_META[client.type]?.label
  const metaParts = [statusLabel, typeLabel].filter(Boolean)

  if (metaParts.length > 0) {
    return metaParts.join(' • ')
  }

  return 'Account workspace'
}

function AccountAvatar({ client, size = 'default' }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        'grid shrink-0 place-items-center rounded-full bg-fill-secondary font-semibold leading-none text-text-secondary',
        size === 'small' ? 'size-6 text-[10px]' : 'size-8 text-label',
      )}
    >
      {getClientInitials(client)}
    </span>
  )
}

export function ClientWorkspaceSwitcher({
  clients = [],
  isLoading = false,
  onExitWorkspace,
  onSelectClient,
  selectedClientId,
  showExitWorkspace = false,
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState('')
  const selectedClient = clients.find((client) => client.id === selectedClientId) ?? null
  const triggerLabel = selectedClient?.name ?? 'Select account'
  const normalizedQuery = query.trim().toLowerCase()
  const filteredClients = useMemo(() => {
    if (!normalizedQuery) {
      return clients
    }

    return clients.filter((client) => {
      const searchValue = [
        client.name,
        client.portal_slug,
        client.portalSlug,
        client.primary_contact_name,
        client.primaryContactName,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()

      return searchValue.includes(normalizedQuery)
    })
  }, [clients, normalizedQuery])

  function selectClient(clientId) {
    onSelectClient?.(clientId)
    setIsOpen(false)
    setQuery('')
  }

  function handleOptionKeyDown(event, clientId) {
    if (event.key !== 'Enter' && event.key !== ' ') {
      return
    }

    event.preventDefault()
    selectClient(clientId)
  }

  return (
    <>
      {showExitWorkspace ? (
        <SidebarMenuItem>
          <SidebarMenuButton
            onClick={onExitWorkspace}
            tooltip="Back to agency"
            type="button"
            variant="quiet"
          >
            <Icon className="text-current" name="arrowRight" size={18} />
            <span>Back to agency</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
      ) : null}
      <SidebarMenuItem>
        <Popover onOpenChange={setIsOpen} open={isOpen}>
          <PopoverTrigger asChild>
            <SidebarMenuButton
              aria-label={triggerLabel}
              aria-expanded={isOpen}
              tooltip={triggerLabel}
              type="button"
              variant="quiet"
            >
              <AccountAvatar client={selectedClient} size="small" />
              <span className="min-w-0 text-left">
                <span className="block truncate text-ui text-text-primary">{triggerLabel}</span>
                <span className="block truncate text-label text-text-muted">{getClientMeta(selectedClient)}</span>
              </span>
            </SidebarMenuButton>
          </PopoverTrigger>
          <PopoverContent align="start" className="w-80 p-tag" side="right" sideOffset={10}>
            <Command className="rounded-island bg-transparent">
              <CommandInput
                aria-label="Search accounts"
                className="h-control-small py-0"
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search accounts..."
                value={query}
              />
              <CommandList>
                {isLoading ? (
                  <CommandEmpty>Loading accounts...</CommandEmpty>
                ) : filteredClients.length === 0 ? (
                  <CommandEmpty>No accounts found.</CommandEmpty>
                ) : (
                  <CommandGroup className="p-tag" heading="Account workspaces">
                    {filteredClients.map((client) => {
                      const isSelected = client.id === selectedClientId

                      return (
                        <CommandItem
                          aria-selected={isSelected}
                          className={cn(
                            'cursor-pointer gap-item px-control py-item',
                            isSelected && 'bg-control-selected text-text-primary',
                          )}
                          data-selected={isSelected}
                          key={client.id}
                          onClick={() => selectClient(client.id)}
                          onKeyDown={(event) => handleOptionKeyDown(event, client.id)}
                          tabIndex={0}
                        >
                          <AccountAvatar client={client} />
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-ui text-text-primary">{client.name}</span>
                            <span className="block truncate text-label text-text-muted">{getClientMeta(client)}</span>
                          </span>
                        </CommandItem>
                      )
                    })}
                  </CommandGroup>
                )}
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </SidebarMenuItem>
    </>
  )
}
