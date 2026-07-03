import { useEffect, useMemo, useState } from 'react'

import { cn } from '@/lib/utils'

import { useInspectorId } from './inspectorId'

function replaceHash(sectionId) {
  const nextHash = `#${encodeURIComponent(sectionId)}`

  if (window.location.hash === nextHash) {
    return
  }

  window.history.replaceState(null, '', nextHash)
}

function scrollToSection(sectionId, behavior = 'smooth') {
  document.getElementById(sectionId)?.scrollIntoView({
    behavior,
    block: 'start',
  })
}

export function SectionRailNav({
  ariaLabel = 'Page sections',
  className = '',
  id,
  items = [],
}) {
  const inspectorId = useInspectorId('SectionRailNav', id)
  const sectionItems = useMemo(
    () => items.filter((item) => item?.id && item?.label),
    [items],
  )
  const sectionIds = useMemo(
    () => sectionItems.map((item) => item.id),
    [sectionItems],
  )
  const [activeId, setActiveId] = useState(sectionItems[0]?.id ?? '')
  const [lockedActiveId, setLockedActiveId] = useState('')
  const currentActiveId = lockedActiveId || (
    sectionIds.includes(activeId) ? activeId : sectionIds[0]
  )

  useEffect(() => {
    if (!sectionIds.length) {
      return undefined
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const visibleEntry = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0]

        if (visibleEntry?.target?.id) {
          setActiveId(visibleEntry.target.id)
        }
      },
      {
        root: null,
        rootMargin: '-24% 0px -60% 0px',
        threshold: [0.08, 0.2, 0.4, 0.6],
      },
    )

    sectionIds.forEach((sectionId) => {
      const element = document.getElementById(sectionId)
      if (element) {
        observer.observe(element)
      }
    })

    return () => observer.disconnect()
  }, [sectionIds])

  useEffect(() => {
    const hashId = decodeURIComponent(window.location.hash.replace('#', ''))

    if (!hashId || !sectionIds.includes(hashId)) {
      return undefined
    }

    const frameId = window.requestAnimationFrame(() => {
      setLockedActiveId(hashId)
      scrollToSection(hashId, 'auto')

      window.setTimeout(() => {
        setLockedActiveId('')
      }, 300)
    })

    return () => window.cancelAnimationFrame(frameId)
  }, [sectionIds])

  function handleSectionClick(sectionId, event) {
    event.currentTarget.blur()

    setLockedActiveId(sectionId)
    replaceHash(sectionId)
    scrollToSection(sectionId)

    window.setTimeout(() => {
      setLockedActiveId('')
    }, 700)
  }

  if (sectionItems.length < 3) {
    return null
  }

  return (
    <nav
      aria-label={ariaLabel}
      className={cn(
        'group fixed right-content-gutter top-1/2 z-40 hidden -translate-y-1/2 lg:block',
        className,
      )}
      id={inspectorId}
    >
      <div className="relative min-h-64 w-64">
        <div className="absolute right-0 top-1/2 grid -translate-y-1/2 justify-items-end gap-tag py-control transition-opacity duration-motion-fast ease-motion-standard group-hover:opacity-0 group-focus-within:opacity-0">
          {sectionItems.map((item) => {
            const isActive = currentActiveId === item.id

            return (
              <button
                aria-current={isActive ? 'location' : undefined}
                aria-label={`Go to ${item.label}`}
                className={cn(
                  'h-px rounded-full transition-all duration-motion-fast ease-motion-standard focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/35',
                  isActive
                    ? 'w-7 bg-text-primary'
                    : 'w-4 bg-text-quaternary hover:w-6 hover:bg-text-secondary',
                )}
                key={item.id}
                onClick={(event) => handleSectionClick(item.id, event)}
                type="button"
              />
            )
          })}
        </div>

        <div className="pointer-events-none absolute right-0 top-1/2 w-64 -translate-y-1/2 opacity-0 transition-opacity duration-motion ease-motion-standard group-hover:pointer-events-auto group-hover:opacity-100 group-focus-within:pointer-events-auto group-focus-within:opacity-100">
          <div className="rounded-block bg-material-chrome p-tag shadow-material ring-1 ring-separator">
            {sectionItems.map((item) => {
              const isActive = currentActiveId === item.id

              return (
                <button
                  aria-current={isActive ? 'location' : undefined}
                  className={cn(
                    'flex min-h-control-small w-full items-center rounded-control px-control text-left text-label transition-colors duration-motion-fast ease-motion-standard focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/35',
                    isActive
                      ? 'bg-control-selected text-text-primary'
                      : 'text-text-secondary hover:bg-control-hover hover:text-text-primary',
                  )}
                  key={item.id}
                  onClick={(event) => handleSectionClick(item.id, event)}
                  type="button"
                >
                  <span className="truncate">{item.label}</span>
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </nav>
  )
}
