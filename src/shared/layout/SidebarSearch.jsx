import { cn } from '@/lib/utils'

import { Icon } from '../icons'
import {
  sidebarIconSlotClass,
  sidebarLabelClass,
  sidebarRowClass,
} from './appSidebarStyles'

export function SidebarSearch({ placeholder }) {
  return (
    <div className={cn(sidebarRowClass({ tone: 'search' }), 'cursor-text')}>
      <span className={sidebarIconSlotClass}>
        <Icon className="text-current" name="search" size={17} />
      </span>
      <label className={cn(sidebarLabelClass, 'hidden sm:block')}>
        <span className="sr-only">Global finder</span>
        <input
          className="h-target w-full bg-transparent text-ui text-text-primary outline-none placeholder:text-text-placeholder"
          placeholder={placeholder}
          type="search"
        />
      </label>
    </div>
  )
}
