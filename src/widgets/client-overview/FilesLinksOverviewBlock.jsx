import { Link } from 'react-router-dom'

import { Button } from '@/shared/ui'

import { SectionCard } from './_shared'
import { Icon } from '../../shared/icons'

export function FilesLinksOverviewBlock({ clientId, fileLinks = [] }) {
  return (
    <SectionCard
      action={(
        <Button asChild size="sm" variant="outline">
          <Link to={`/client/files-links?clientId=${clientId}`}>
            View files
          </Link>
        </Button>
      )}
      iconName="fileText"
      title="Files & Links"
    >
      {fileLinks.length ? (
        <div className="grid gap-3">
          {fileLinks.map((fileLink) => (
            <article className="rounded-control bg-block-subtle px-3 py-2" key={fileLink.id}>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-ui text-text-primary">{fileLink.title}</p>
                  <p className="mt-1 truncate text-label font-normal text-text-muted">
                    {fileLink.projectName || fileLink.typeMeta.label}
                  </p>
                </div>
                {fileLink.url ? (
                  <a
                    aria-label={`Open ${fileLink.title}`}
                    className="mt-0.5 shrink-0 text-text-muted hover:text-link"
                    href={fileLink.url}
                    rel="noreferrer"
                    target="_blank"
                  >
                    <Icon name="arrowUpRight" size={14} />
                  </a>
                ) : null}
              </div>
            </article>
          ))}
        </div>
      ) : (
        <p className="text-body text-text-secondary">
          Published files, deliverables, and shared links will appear here.
        </p>
      )}
    </SectionCard>
  )
}
