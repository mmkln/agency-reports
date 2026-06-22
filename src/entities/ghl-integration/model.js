export const GHL_SOURCE_SYSTEM = 'ghl'

export const GHL_GROWTH_REVIEW_EVENT_TYPES = Object.freeze({
  APPOINTMENT_CREATED: 'appointment_created',
  APPOINTMENT_UPDATED: 'appointment_updated',
  CALL_EVENT: 'call_event',
  CONTACT_CREATED: 'contact_created',
  CONTACT_UPDATED: 'contact_updated',
  CONVERSATION_MESSAGE: 'conversation_message',
  MESSAGE_STATUS_UPDATED: 'message_status_updated',
  OPPORTUNITY_CREATED: 'opportunity_created',
  OPPORTUNITY_STAGE_CHANGED: 'opportunity_stage_changed',
  WORKFLOW_TOUCH_EVENT: 'workflow_touch_event',
})

export const NORMALIZED_CLINIC_SOURCES = Object.freeze({
  EMAIL: 'email',
  GBP: 'gbp',
  GOOGLE_ADS: 'google_ads',
  META: 'meta',
  ORGANIC: 'organic',
  REACTIVATION: 'reactivation',
  REFERRAL: 'referral',
  SMS: 'sms',
  UNKNOWN: 'unknown',
  WALK_IN: 'walk_in',
})

const SOURCE_RULES = Object.freeze([
  [NORMALIZED_CLINIC_SOURCES.META, /\b(meta|facebook|fb|instagram|ig)\b/i],
  [NORMALIZED_CLINIC_SOURCES.GOOGLE_ADS, /\b(google ads|google_ads|adwords|gads|paid search|ppc)\b/i],
  [NORMALIZED_CLINIC_SOURCES.GBP, /\b(gbp|google business|google profile|business profile)\b/i],
  [NORMALIZED_CLINIC_SOURCES.REFERRAL, /\b(referral|referred)\b/i],
  [NORMALIZED_CLINIC_SOURCES.REACTIVATION, /\b(reactivation|winback|win-back|recall|lapsed)\b/i],
  [NORMALIZED_CLINIC_SOURCES.WALK_IN, /\b(walk in|walk-in|walk_in)\b/i],
  [NORMALIZED_CLINIC_SOURCES.EMAIL, /\b(email|mail)\b/i],
  [NORMALIZED_CLINIC_SOURCES.SMS, /\b(sms|text)\b/i],
  [NORMALIZED_CLINIC_SOURCES.ORGANIC, /\b(organic|seo|direct)\b/i],
])

function isPlainObject(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}

function normalizeText(value = '') {
  return String(value ?? '').trim()
}

function normalizeArray(value) {
  return Array.isArray(value) ? value : []
}

function firstText(...values) {
  return values.map(normalizeText).find(Boolean) ?? ''
}

function safeIsoDate(value, fallback) {
  const date = new Date(value || fallback)

  return Number.isNaN(date.getTime()) ? new Date(fallback).toISOString() : date.toISOString()
}

function stableStringify(value) {
  if (Array.isArray(value)) {
    return `[${value.map(stableStringify).join(',')}]`
  }

  if (isPlainObject(value)) {
    return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${stableStringify(value[key])}`).join(',')}}`
  }

  return JSON.stringify(value)
}

export function createStableEventHash(value) {
  const text = stableStringify(value)
  let hash = 0

  for (let index = 0; index < text.length; index += 1) {
    hash = ((hash << 5) - hash) + text.charCodeAt(index)
    hash |= 0
  }

  return `hash-${Math.abs(hash)}`
}

function getPayloadEnvelope(input) {
  if (!isPlainObject(input)) {
    return {}
  }

  return isPlainObject(input.payload) ? input.payload : input
}

function getCustomFields(source) {
  return isPlainObject(source.custom_fields)
    ? source.custom_fields
    : isPlainObject(source.customFields)
      ? source.customFields
      : {}
}

function getTags(source) {
  return normalizeArray(source.tags).map(normalizeText).filter(Boolean)
}

export function normalizeClinicSource({
  customFields = {},
  rawSource = '',
  tags = [],
  utmCampaign = '',
  utmMedium = '',
  utmSource = '',
} = {}) {
  const searchable = [
    rawSource,
    utmSource,
    utmMedium,
    utmCampaign,
    ...tags,
    customFields.source,
    customFields.Source,
    customFields.contact_source,
    customFields.original_source,
    customFields.reactivation_track,
  ].map(normalizeText).filter(Boolean).join(' ')

  for (const [source, pattern] of SOURCE_RULES) {
    if (pattern.test(searchable)) {
      return source
    }
  }

  return NORMALIZED_CLINIC_SOURCES.UNKNOWN
}

function getReactivationTrack(source) {
  const customFields = getCustomFields(source)
  const trackValue = firstText(
    source.reactivation_track,
    source.reactivationTrack,
    customFields.reactivation_track,
    customFields.reactivationTrack,
    customFields.track,
  ).toUpperCase()
  const tagTrack = getTags(source)
    .map((tag) => tag.match(/\btrack\s*([RABC])\b/i)?.[1])
    .find(Boolean)
    ?.toUpperCase()
  const track = trackValue || tagTrack

  return ['R', 'A', 'B', 'C'].includes(track) ? track : null
}

export function normalizeGhlGrowthReviewEvent(input = {}, {
  clientId,
  now = new Date().toISOString(),
} = {}) {
  const source = isPlainObject(input) ? input : {}
  const payload = getPayloadEnvelope(source)
  const customFields = getCustomFields(payload)
  const tags = getTags(payload)
  const eventType = firstText(source.event_type, source.eventType, source.type, payload.event_type, payload.eventType)
  const contactId = firstText(source.contact_id, source.contactId, payload.contact_id, payload.contactId, payload.contact?.id)
  const opportunityId = firstText(source.opportunity_id, source.opportunityId, payload.opportunity_id, payload.opportunityId, payload.opportunity?.id)
  const appointmentId = firstText(source.appointment_id, source.appointmentId, payload.appointment_id, payload.appointmentId, payload.appointment?.id)
  const messageId = firstText(source.message_id, source.messageId, payload.message_id, payload.messageId, payload.message?.id)
  const workflowId = firstText(source.workflow_id, source.workflowId, payload.workflow_id, payload.workflowId, payload.workflow?.id)
  const occurredAt = safeIsoDate(firstText(
    source.occurred_at,
    source.occurredAt,
    source.event_at,
    source.timestamp,
    payload.occurred_at,
    payload.event_at,
    payload.created_at,
    payload.createdAt,
  ), now)
  const rawSource = firstText(
    source.source_raw,
    source.source,
    payload.source_raw,
    payload.source,
    payload.original_source,
    payload.originalSource,
    customFields.source,
  )
  const normalizedSource = normalizeClinicSource({
    customFields,
    rawSource,
    tags,
    utmCampaign: firstText(source.utm_campaign, payload.utm_campaign, payload.utmCampaign),
    utmMedium: firstText(source.utm_medium, payload.utm_medium, payload.utmMedium),
    utmSource: firstText(source.utm_source, payload.utm_source, payload.utmSource),
  })
  const externalEventId = firstText(
    source.external_event_id,
    source.event_id,
    source.id,
    payload.event_id,
    payload.id,
    messageId,
    appointmentId,
    opportunityId,
    contactId,
    createStableEventHash(payload),
  )

  return {
    appointment_id: appointmentId,
    campaign_raw: firstText(source.campaign_raw, source.campaign, payload.campaign_raw, payload.campaign, payload.utm_campaign),
    client_id: firstText(clientId, source.client_id, source.clientId, payload.client_id, payload.clientId),
    contact_id: contactId,
    custom_fields: customFields,
    event_type: eventType || GHL_GROWTH_REVIEW_EVENT_TYPES.CONTACT_UPDATED,
    external_event_id: externalEventId,
    id: `raw-ghl-${externalEventId}`,
    location_id: firstText(source.location_id, source.locationId, payload.location_id, payload.locationId),
    message_id: messageId,
    normalized_source: normalizedSource,
    occurred_at: occurredAt,
    opportunity_id: opportunityId,
    payload,
    payload_hash: createStableEventHash(payload),
    pipeline_id: firstText(source.pipeline_id, payload.pipeline_id, payload.pipelineId),
    pipeline_stage_id: firstText(source.pipeline_stage_id, payload.pipeline_stage_id, payload.pipelineStageId),
    pipeline_stage_name: firstText(source.pipeline_stage_name, payload.pipeline_stage_name, payload.pipelineStageName, payload.stage_name),
    raw_source: rawSource,
    received_at: safeIsoDate(source.received_at, now),
    reactivation_track: getReactivationTrack({
      ...payload,
      reactivation_track: firstText(source.reactivation_track, payload.reactivation_track),
    }),
    source_system: GHL_SOURCE_SYSTEM,
    tags,
    workflow_id: workflowId,
  }
}

export function createNormalizedLeadFromGhlEvent(event) {
  if (!event.contact_id && !event.opportunity_id && !event.appointment_id) {
    return null
  }

  return {
    campaign_raw: event.campaign_raw,
    client_id: event.client_id,
    contact_id: event.contact_id,
    created_at: event.occurred_at,
    external_source_id: event.opportunity_id || event.contact_id || event.appointment_id,
    id: `lead-${event.client_id}-${event.contact_id || event.opportunity_id || event.appointment_id}`,
    lead_id: event.opportunity_id || event.contact_id || event.appointment_id,
    normalized_source: event.normalized_source,
    raw_source: event.raw_source,
    reactivation_track: event.reactivation_track,
    source_system: event.source_system,
    updated_at: event.received_at,
  }
}

export function createNormalizedContactEventFromGhlEvent(event) {
  const direction = firstText(event.payload.direction, event.payload.message_direction, event.payload.type).toLowerCase()

  if (!event.contact_id || event.event_type !== GHL_GROWTH_REVIEW_EVENT_TYPES.CONVERSATION_MESSAGE) {
    return null
  }

  return {
    channel: firstText(event.payload.channel, event.payload.message_type, event.payload.messageType, 'unknown').toLowerCase(),
    client_id: event.client_id,
    contact_id: event.contact_id,
    direction: direction.includes('out') ? 'outbound' : direction.includes('in') ? 'inbound' : 'system',
    event_at: event.occurred_at,
    id: `contact-event-${event.client_id}-${event.external_event_id}`,
    message_id: event.message_id,
    source_system: event.source_system,
  }
}

export function createNormalizedBookingFromGhlEvent(event) {
  const stageName = event.pipeline_stage_name.toLowerCase()
  const status = firstText(event.payload.appointment_status, event.payload.status, event.payload.appointment?.status)

  if (
    ![
      GHL_GROWTH_REVIEW_EVENT_TYPES.APPOINTMENT_CREATED,
      GHL_GROWTH_REVIEW_EVENT_TYPES.APPOINTMENT_UPDATED,
      GHL_GROWTH_REVIEW_EVENT_TYPES.OPPORTUNITY_STAGE_CHANGED,
    ].includes(event.event_type)
  ) {
    return null
  }

  if (
    event.event_type === GHL_GROWTH_REVIEW_EVENT_TYPES.OPPORTUNITY_STAGE_CHANGED
    && !/\b(booked|booking|scheduled|appointment)\b/i.test(stageName)
  ) {
    return null
  }

  return {
    appointment_created_at: event.occurred_at,
    appointment_id: event.appointment_id,
    appointment_start_at: firstText(event.payload.appointment_start_at, event.payload.startTime, event.payload.appointment?.startTime),
    appointment_status: status || 'booked',
    campaign_raw: event.campaign_raw,
    client_id: event.client_id,
    contact_id: event.contact_id,
    id: `booking-${event.client_id}-${event.appointment_id || event.opportunity_id || event.external_event_id}`,
    lead_id: event.opportunity_id || event.contact_id,
    normalized_source: event.normalized_source,
    raw_source: event.raw_source,
    reactivation_track: event.reactivation_track,
    source_system: event.source_system,
  }
}
