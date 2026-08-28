const ENTITY_LABELS = {
  contact: 'Contact',
  opportunity: 'Opportunity',
}

export function createEmptyMapping(overrides = {}) {
  return {
    entity: 'contact',
    expectedValues: [],
    fieldId: '',
    fieldKey: '',
    id: '',
    isActive: true,
    priority: 0,
    source: 'tag',
    ...overrides,
  }
}

export function canonicalizeMapping(mapping) {
  if (mapping.source === 'tag') {
    return {
      ...mapping,
      entity: 'contact',
      fieldId: '',
      fieldKey: '',
    }
  }
  return mapping
}

export function isConfiguredMapping(mapping) {
  if (mapping.isActive === false || !mapping.expectedValues.length) {
    return false
  }
  if (mapping.source === 'tag') {
    return true
  }
  return Boolean(mapping.entity && (mapping.fieldId || mapping.fieldKey))
}

export function getMappingPresentation(mapping, { customFields = [], tags = [] } = {}) {
  if (mapping.source === 'tag') {
    const value = mapping.expectedValues[0] ?? ''
    const tag = tags.find((option) => (
      option.value === value
      || option.externalId === value
      || option.label === value
    ))

    return {
      configured: Boolean(value),
      detail: 'Contact tag',
      title: tag?.label || value || 'Choose source',
    }
  }

  const field = customFields.find((option) => option.id === mapping.fieldId)
  const owner = ENTITY_LABELS[field?.entity ?? mapping.entity] ?? 'Custom'
  const fieldLabel = field?.label || mapping.fieldKey || mapping.fieldId || 'Choose source'
  const expectedValues = mapping.expectedValues.join(', ')

  return {
    configured: Boolean(
      mapping.expectedValues.length
      && mapping.entity
      && (mapping.fieldId || mapping.fieldKey),
    ),
    detail: fieldLabel === 'Choose source' ? '' : `${owner} custom field`,
    title: expectedValues ? `${fieldLabel} = ${expectedValues}` : fieldLabel,
  }
}

export function getMappingsPresentation(mappings, options = {}) {
  const configured = mappings.filter(isConfiguredMapping)

  if (configured.length === 0) {
    return { configured: false, detail: '', title: 'Choose source' }
  }

  if (configured.length === 1) {
    return getMappingPresentation(configured[0], options)
  }

  const presentations = configured.map((mapping) => getMappingPresentation(mapping, options))

  return {
    configured: true,
    detail: `${configured.length} alternative conditions`,
    title: presentations.map((presentation) => presentation.title).join(' OR '),
  }
}
