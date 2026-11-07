import { describe, expect, it } from 'vitest'

import {
  canonicalizeMapping,
  getMappingPresentation,
  getMappingsPresentation,
} from './mappingRuleModel'

describe('mappingRuleModel', () => {
  it('keeps contact ownership as the canonical tag mapping semantics', () => {
    expect(canonicalizeMapping({
      entity: 'opportunity',
      expectedValues: ['reactivation_booked'],
      fieldId: 'legacy-field',
      fieldKey: 'legacy.key',
      source: 'tag',
    })).toMatchObject({
      entity: 'contact',
      fieldId: '',
      fieldKey: '',
      source: 'tag',
    })
  })

  it('uses the human GHL tag label as the primary mapping presentation', () => {
    expect(getMappingPresentation({
      entity: 'contact',
      expectedValues: ['reactivation_booked'],
      source: 'tag',
    }, {
      tags: [{ label: 'Reactivation Booked', value: 'reactivation_booked' }],
    })).toEqual({
      configured: true,
      detail: 'Contact tag',
      title: 'Reactivation Booked',
    })
  })

  it('keeps custom-field ownership visible without exposing raw field keys first', () => {
    expect(getMappingPresentation({
      entity: 'opportunity',
      expectedValues: ['accepted'],
      fieldId: 'field-1',
      fieldKey: 'opportunity.treatment_accepted',
      source: 'custom_field',
    }, {
      customFields: [{
        entity: 'opportunity',
        id: 'field-1',
        label: 'Treatment accepted',
      }],
    })).toEqual({
      configured: true,
      detail: 'Opportunity custom field',
      title: 'Treatment accepted = accepted',
    })
  })

  it('keeps every alternative source visible in the collapsed mapping summary', () => {
    expect(getMappingsPresentation([{
      entity: 'contact',
      expectedValues: ['reactivation_booked'],
      source: 'tag',
    }, {
      entity: 'opportunity',
      expectedValues: ['booked'],
      fieldId: 'field-1',
      source: 'custom_field',
    }], {
      customFields: [{
        entity: 'opportunity',
        id: 'field-1',
        label: 'Booking status',
      }],
      tags: [{ label: 'Reactivation Booked', value: 'reactivation_booked' }],
    })).toEqual({
      configured: true,
      detail: '2 alternative conditions',
      title: 'Reactivation Booked OR Booking status = booked',
    })
  })
})
