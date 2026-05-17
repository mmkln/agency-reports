import { Link } from 'react-router-dom'

import { Button } from '@/shared/ui'
import { Icon } from '@/shared/icons'

import { SectionCard } from './_shared'

export function ContactAskQuestionBlock({ client }) {
  const contactName = client?.primaryContactName || 'Your agency contact'
  const contactEmail = client?.primaryContactEmail || ''
  const requestsHref = client?.id ? `/client/requests?clientId=${client.id}` : '/client/requests'

  return (
    <SectionCard
      action={(
        <Button asChild size="sm" variant="outline">
          <Link to={requestsHref}>
            Ask a question
            <Icon name="arrowUpRight" size={13} />
          </Link>
        </Button>
      )}
      iconName="messageSquare"
      title="Contact"
    >
      <div className="grid gap-3">
        <div>
          <p className="text-label text-text-muted">Primary contact</p>
          <p className="mt-1 text-ui text-text-primary">{contactName}</p>
          {contactEmail ? (
            <a className="mt-1 inline-flex text-ui text-link hover:underline" href={`mailto:${contactEmail}`}>
              {contactEmail}
            </a>
          ) : (
            <p className="mt-1 text-body text-text-secondary">
              Use Requests to send a question to the agency team.
            </p>
          )}
        </div>
        <p className="text-body text-text-secondary">
          Questions and change requests are tracked in Requests so the agency can review and respond without exposing internal tasks.
        </p>
      </div>
    </SectionCard>
  )
}
