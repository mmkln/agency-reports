import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

import { Icon } from '../icons'
import { BrandLogo } from '../ui'

export function TopNav({ activeRoute, defaultRoute, routes }) {
  return (
    <nav className="sticky top-0 z-20 border-b border-slate-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 justify-between">
          <div className="flex items-center overflow-x-auto">
            <BrandLogo className="mr-8 shrink-0" href={defaultRoute.href} variant="static" />

            <div className="flex gap-1">
              {routes.map((route) => {
                const isActive = route.id === activeRoute.id

                return (
                  <a
                    className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium no-underline transition-all duration-200 ${
                      isActive
                        ? 'bg-indigo-50 text-indigo-700'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                    href={route.href}
                    key={route.id}
                  >
                    <Icon
                      className={isActive ? 'text-indigo-600' : 'text-slate-500'}
                      name={route.iconName}
                      size={16}
                    />
                    <span>{route.navLabel ?? route.label}</span>
                  </a>
                )
              })}
            </div>
          </div>

          <div className="ml-4 hidden items-center gap-4 md:flex">
            <label className="relative w-64 lg:w-80">
              <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <Icon className="text-slate-400" name="search" size={16} />
              </span>
              <input
                className="block w-full rounded-lg border border-slate-200 bg-slate-50/50 py-2 pr-3 pl-10 text-sm leading-5 text-slate-900 placeholder-slate-400 transition-colors focus:border-transparent focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                placeholder="Search patients, leads..."
                type="text"
              />
            </label>
            <button
              className="relative rounded-full p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
              type="button"
            >
              <Icon name="bell" size={20} />
              <span className="absolute top-1.5 right-1.5 block h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white" />
            </button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  aria-label="Open account menu"
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-indigo-200 bg-gradient-to-tr from-indigo-100 to-indigo-50 transition-all hover:border-indigo-300 hover:shadow-sm focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:outline-none"
                  type="button"
                >
                  <Icon className="text-indigo-600" name="user" size={18} />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <span className="block text-sm font-semibold text-slate-900">DentalFlow Admin</span>
                  <span className="mt-0.5 block text-xs font-normal text-slate-500">admin@dentalflow.com</span>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild className="cursor-pointer text-rose-600 focus:text-rose-700">
                  <a href="#login">Logout</a>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </nav>
  )
}
