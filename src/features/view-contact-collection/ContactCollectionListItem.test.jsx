import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import { ContactCollectionListItem } from './ContactCollectionListItem'

describe('ContactCollectionListItem', () => {
  it('keeps the contact row focused on identity, source, and date', () => {
    const html = renderToStaticMarkup(
      <ContactCollectionListItem
        item={{
          contact: {
            externalUrl: 'https://app.gohighlevel.com/v2/location/location-1/contacts/detail/contact-1',
            name: 'Lauren Dwyer',
          },
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
    expect(html).toContain('href="https://app.gohighlevel.com/v2/location/location-1/contacts/detail/contact-1"')
    expect(html).toContain('target="_blank"')
    expect(html).toContain('rel="noreferrer"')
    expect(html).not.toContain('New Lead')
    expect(html).not.toContain('New</')
  })

  it('renders a plain contact name when an external URL is unavailable', () => {
    const html = renderToStaticMarkup(
      <ContactCollectionListItem
        item={{
          contact: { externalUrl: '', name: 'Lauren Dwyer' },
          context: { label: 'Lauren Dwyer' },
          occurredAt: null,
          source: { label: 'Meta Ads' },
        }}
        timezone="UTC"
      />,
    )

    expect(html).toContain('Lauren Dwyer')
    expect(html).not.toContain('<a')
  })

  it('does not repeat the contact name as context', () => {
    const html = renderToStaticMarkup(
      <ContactCollectionListItem
        item={{
          contact: { externalUrl: '', name: 'Lauren Dwyer' },
          context: { label: '  LAUREN   DWYER ' },
          occurredAt: null,
          source: { label: 'Meta Ads' },
        }}
        timezone="UTC"
      />,
    )

    expect(html.match(/Lauren Dwyer/g)).toHaveLength(1)
    expect(html).toContain('Meta Ads')
  })
})
