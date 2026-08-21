import { describe, expect, it } from 'vitest'

import { filterSourceTags } from './model'

const tags = [{
  description: 'Starts the campaign workflow',
  externalId: 'tag-1',
  name: 'Sequence Started',
  sourceConnection: { externalAccountId: 'location-1' },
  usages: [{ campaignName: 'August Reactivation', signalLabel: 'Sequence Started' }],
}]

describe('filterSourceTags', () => {
  it('searches tag identity, source, and review usage', () => {
    expect(filterSourceTags(tags, 'sequence')).toEqual(tags)
    expect(filterSourceTags(tags, 'location-1')).toEqual(tags)
    expect(filterSourceTags(tags, 'august')).toEqual(tags)
    expect(filterSourceTags(tags, 'campaign workflow')).toEqual(tags)
    expect(filterSourceTags(tags, 'missing')).toEqual([])
  })
})
