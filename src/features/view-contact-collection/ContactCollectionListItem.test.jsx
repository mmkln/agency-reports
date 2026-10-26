import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import { ContactCollectionListItem } from './ContactCollectionListItem'

describe('ContactCollectionListItem', () => {
  it('keeps the contact row focused on identity, source, and date', () => {
    const html = renderToStaticMarkup(
      <ContactCollectionListItem
        item={{
          contact: { name: 'Lauren Dwyer' },
          context: { label: 'Lauren Dwyer' },
          details: [{ key: 'patient_type', value: 'New' }],
          occurredAt: '2026-10-25T12:00:00Z',
          source: { label: 'Meta Ads' },
          status: { label: 'New Lead' },
        }}
        timezone="UTC"
      />,
    )

    expect(html).toContain('Lauren Dwyer')
    expect(html).toContain('Meta Ads')
    expect(html).toContain('Oct 25')
    expect(html).not.toContain('New Lead')
    expect(html).not.toContain('New</')
  })
})
