import { Link } from 'react-router-dom'

import { Icon } from '@/shared/icons'
import { Button } from '@/shared/ui'

import {
  getWorkspaceDataSourcesPath,
  getWorkspaceTagCatalogPath,
} from '../model'

const dataNavigationItems = [
  {
    iconName: 'database',
    id: 'data',
    label: 'Connections',
    to: getWorkspaceDataSourcesPath,
  },
  {
    iconName: 'tag',
    id: 'tag-catalog',
    label: 'Tag Catalog',
    to: getWorkspaceTagCatalogPath,
  },
]

export function WorkspaceDataNavigation({ currentPage, workspaceId }) {
  if (!workspaceId) {
    return null
  }

  return (
    <nav aria-label="Data sections" className="-mx-1 overflow-x-auto px-1">
      <div className="inline-flex min-w-max items-center gap-micro rounded-control bg-control p-micro">
        {dataNavigationItems.map((item) => {
          const isActive = currentPage === item.id

          return (
            <Button
              asChild
              className="h-control-small rounded-control px-control"
              key={item.id}
              size="sm"
              variant={isActive ? 'secondary' : 'ghost'}
            >
              <Link aria-current={isActive ? 'page' : undefined} to={item.to(workspaceId)}>
                <Icon name={item.iconName} size={14} />
                {item.label}
              </Link>
            </Button>
          )
        })}
      </div>
    </nav>
  )
}
