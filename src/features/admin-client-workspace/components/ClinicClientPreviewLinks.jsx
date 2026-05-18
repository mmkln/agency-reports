import { Link } from 'react-router-dom'

import { Icon } from '../../../shared/icons'

function buildPreviewHref(href, clientId, source) {
  const params = new URLSearchParams({ clientId })

  if (source === 'draft') {
    params.set('preview', 'draft')
  }

  return `${href}?${params.toString()}`
}

export function ClinicClientPreviewLinks({ clientId, links = [] }) {
  if (!clientId || links.length === 0) {
    return null
  }

  return (
    <div className="flex flex-wrap items-center gap-tag">
      {links.map((link) => (
        <Link
          className="inline-flex h-control-small items-center gap-1 text-label text-link no-underline hover:text-link-hover"
          key={`${link.href}:${link.label}:${link.source ?? 'published'}`}
          to={buildPreviewHref(link.href, clientId, link.source)}
        >
          {link.label}
          <Icon name="arrowUpRight" size={12} />
        </Link>
      ))}
    </div>
  )
}
