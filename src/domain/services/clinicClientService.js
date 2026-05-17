import { CLIENT_TYPES, CLIENT_TYPE_META } from '../../entities/client'
import {
  CLINIC_ACQUISITION_CHANNEL_META,
  CLINIC_PROFILE_SPECIALTY_META,
  CLINIC_SERVICE_LINE_STATUS_META,
  normalizeCallBookingMetric,
  normalizeClinicLocation,
  normalizeClinicProfile,
  normalizeClinicServiceLine,
  normalizePatientAcquisitionSnapshot,
  normalizeReputationSnapshot,
} from '../../entities/clinic'
import { USER_ROLES } from '../../entities/profile'
import { canAccessClient } from '../policies/accessPolicy'

function sortRawByDisplayOrder(left, right) {
  return (left.display_order ?? 0) - (right.display_order ?? 0)
    || left.name.localeCompare(right.name)
}

function mapLocation(location) {
  const normalizedLocation = normalizeClinicLocation(location)

  return {
    address: normalizedLocation.address,
    city: normalizedLocation.city,
    clientId: normalizedLocation.client_id,
    displayOrder: normalizedLocation.display_order,
    id: normalizedLocation.id,
    isActive: normalizedLocation.is_active,
    name: normalizedLocation.name,
    updatedAt: normalizedLocation.updated_at,
  }
}

function mapServiceLine(serviceLine, locationsById) {
  const normalizedServiceLine = normalizeClinicServiceLine(serviceLine)
  const locations = normalizedServiceLine.location_ids
    .map((locationId) => locationsById.get(locationId))
    .filter(Boolean)

  return {
    averageValue: normalizedServiceLine.average_value,
    capacityNote: normalizedServiceLine.capacity_note,
    clientId: normalizedServiceLine.client_id,
    displayOrder: normalizedServiceLine.display_order,
    id: normalizedServiceLine.id,
    locationIds: normalizedServiceLine.location_ids,
    locations,
    name: normalizedServiceLine.name,
    primaryChannel: normalizedServiceLine.primary_channel,
    status: normalizedServiceLine.status,
    statusMeta: CLINIC_SERVICE_LINE_STATUS_META[normalizedServiceLine.status],
    targetMonthlyBookings: normalizedServiceLine.target_monthly_bookings,
    updatedAt: normalizedServiceLine.updated_at,
  }
}

function mapProfile(profile) {
  if (!profile) {
    return null
  }

  const normalizedProfile = normalizeClinicProfile(profile)

  return {
    capacityNotes: normalizedProfile.capacity_notes,
    clientId: normalizedProfile.client_id,
    id: normalizedProfile.id,
    insuranceModel: normalizedProfile.insurance_model,
    primaryGoal: normalizedProfile.primary_goal,
    specialty: normalizedProfile.specialty,
    specialtyMeta: CLINIC_PROFILE_SPECIALTY_META[normalizedProfile.specialty],
    updatedAt: normalizedProfile.updated_at,
  }
}

function divide(numerator, denominator) {
  return denominator > 0 ? numerator / denominator : 0
}

function addSnapshotTotals(total, snapshot) {
  return {
    attendedAppointments: total.attendedAppointments + snapshot.attendedAppointments,
    bookedAppointments: total.bookedAppointments + snapshot.bookedAppointments,
    calls: total.calls + snapshot.calls,
    chats: total.chats + snapshot.chats,
    clicks: total.clicks + snapshot.clicks,
    forms: total.forms + snapshot.forms,
    impressions: total.impressions + snapshot.impressions,
    landingPageVisits: total.landingPageVisits + snapshot.landingPageVisits,
    qualifiedInquiries: total.qualifiedInquiries + snapshot.qualifiedInquiries,
    spend: total.spend + snapshot.spend,
  }
}

function createEmptyAcquisitionTotals() {
  return {
    attendedAppointments: 0,
    bookedAppointments: 0,
    calls: 0,
    chats: 0,
    clicks: 0,
    forms: 0,
    impressions: 0,
    landingPageVisits: 0,
    qualifiedInquiries: 0,
    spend: 0,
  }
}

function mapPatientAcquisitionSnapshot(snapshot, { locationsById, serviceLinesById }) {
  const normalizedSnapshot = normalizePatientAcquisitionSnapshot(snapshot)
  const inquiries = normalizedSnapshot.calls + normalizedSnapshot.forms + normalizedSnapshot.chats

  return {
    attendedAppointments: normalizedSnapshot.attended_appointments,
    bookedAppointments: normalizedSnapshot.booked_appointments,
    bookingRate: divide(normalizedSnapshot.booked_appointments, inquiries),
    calls: normalizedSnapshot.calls,
    channel: normalizedSnapshot.channel,
    channelMeta: CLINIC_ACQUISITION_CHANNEL_META[normalizedSnapshot.channel],
    chats: normalizedSnapshot.chats,
    clientId: normalizedSnapshot.client_id,
    clicks: normalizedSnapshot.clicks,
    costPerBookedAppointment: divide(normalizedSnapshot.spend, normalizedSnapshot.booked_appointments),
    dataSource: normalizedSnapshot.data_source,
    forms: normalizedSnapshot.forms,
    id: normalizedSnapshot.id,
    impressions: normalizedSnapshot.impressions,
    inquiries,
    insight: normalizedSnapshot.insight,
    landingPageVisits: normalizedSnapshot.landing_page_visits,
    lastUpdatedAt: normalizedSnapshot.last_updated_at,
    location: normalizedSnapshot.location_id ? locationsById.get(normalizedSnapshot.location_id) ?? null : null,
    locationId: normalizedSnapshot.location_id,
    periodEnd: normalizedSnapshot.period_end,
    periodLabel: normalizedSnapshot.period_label,
    periodStart: normalizedSnapshot.period_start,
    qualifiedInquiries: normalizedSnapshot.qualified_inquiries,
    serviceLine: normalizedSnapshot.service_line_id
      ? serviceLinesById.get(normalizedSnapshot.service_line_id) ?? null
      : null,
    serviceLineId: normalizedSnapshot.service_line_id,
    spend: normalizedSnapshot.spend,
    summary: normalizedSnapshot.summary,
  }
}

function buildAcquisitionFunnel(totals) {
  const inquiries = totals.calls + totals.forms + totals.chats

  return [
    { id: 'impressions', label: 'Impressions', value: totals.impressions },
    { id: 'clicks', label: 'Clicks', value: totals.clicks },
    { id: 'visits', label: 'Landing page visits', value: totals.landingPageVisits },
    { id: 'inquiries', label: 'Calls / forms / chats', value: inquiries },
    { id: 'qualified', label: 'Qualified inquiries', value: totals.qualifiedInquiries },
    { id: 'booked', label: 'Booked appointments', value: totals.bookedAppointments },
    { id: 'attended', label: 'Attended appointments', value: totals.attendedAppointments },
  ]
}

function mapCallBookingMetric(metric, { locationsById, serviceLinesById }) {
  const normalizedMetric = normalizeCallBookingMetric(metric)

  return {
    answeredCalls: normalizedMetric.answered_calls,
    answeredRate: divide(normalizedMetric.answered_calls, normalizedMetric.total_calls),
    averageResponseSeconds: normalizedMetric.average_response_seconds,
    bookedFromCalls: normalizedMetric.booked_from_calls,
    callBookingRate: divide(normalizedMetric.booked_from_calls, normalizedMetric.total_calls),
    clientId: normalizedMetric.client_id,
    dataSource: normalizedMetric.data_source,
    firstTimeCalls: normalizedMetric.first_time_calls,
    followUpNeededCount: normalizedMetric.follow_up_needed_count,
    formLeads: normalizedMetric.form_leads,
    id: normalizedMetric.id,
    insight: normalizedMetric.insight,
    lastUpdatedAt: normalizedMetric.last_updated_at,
    location: normalizedMetric.location_id ? locationsById.get(normalizedMetric.location_id) ?? null : null,
    locationId: normalizedMetric.location_id,
    missedCalls: normalizedMetric.missed_calls,
    missedRate: divide(normalizedMetric.missed_calls, normalizedMetric.total_calls),
    noResponseLeads: normalizedMetric.no_response_leads,
    notBookedReasons: normalizedMetric.not_booked_reasons,
    periodEnd: normalizedMetric.period_end,
    periodLabel: normalizedMetric.period_label,
    periodStart: normalizedMetric.period_start,
    serviceLine: normalizedMetric.service_line_id
      ? serviceLinesById.get(normalizedMetric.service_line_id) ?? null
      : null,
    serviceLineId: normalizedMetric.service_line_id,
    summary: normalizedMetric.summary,
    totalCalls: normalizedMetric.total_calls,
  }
}

function createEmptyCallBookingTotals() {
  return {
    answeredCalls: 0,
    bookedFromCalls: 0,
    firstTimeCalls: 0,
    followUpNeededCount: 0,
    formLeads: 0,
    missedCalls: 0,
    noResponseLeads: 0,
    responseSecondsWeightedTotal: 0,
    totalCalls: 0,
  }
}

function addCallBookingTotals(total, metric) {
  return {
    answeredCalls: total.answeredCalls + metric.answeredCalls,
    bookedFromCalls: total.bookedFromCalls + metric.bookedFromCalls,
    firstTimeCalls: total.firstTimeCalls + metric.firstTimeCalls,
    followUpNeededCount: total.followUpNeededCount + metric.followUpNeededCount,
    formLeads: total.formLeads + metric.formLeads,
    missedCalls: total.missedCalls + metric.missedCalls,
    noResponseLeads: total.noResponseLeads + metric.noResponseLeads,
    responseSecondsWeightedTotal: total.responseSecondsWeightedTotal
      + (metric.averageResponseSeconds * metric.totalCalls),
    totalCalls: total.totalCalls + metric.totalCalls,
  }
}

function aggregateNotBookedReasons(metrics) {
  const reasonsByName = new Map()

  metrics.forEach((metric) => {
    metric.notBookedReasons.forEach((item) => {
      reasonsByName.set(item.reason, (reasonsByName.get(item.reason) ?? 0) + item.count)
    })
  })

  return [...reasonsByName.entries()]
    .map(([reason, count]) => ({ count, reason }))
    .sort((left, right) => right.count - left.count || left.reason.localeCompare(right.reason))
}

function mapReputationSnapshot(snapshot, { locationsById }) {
  const normalizedSnapshot = normalizeReputationSnapshot(snapshot)

  return {
    clientId: normalizedSnapshot.client_id,
    dataSource: normalizedSnapshot.data_source,
    gbpUpdates: normalizedSnapshot.gbp_updates,
    googleRating: normalizedSnapshot.google_rating,
    id: normalizedSnapshot.id,
    insight: normalizedSnapshot.insight,
    lastUpdatedAt: normalizedSnapshot.last_updated_at,
    localVisibilityNote: normalizedSnapshot.local_visibility_note,
    location: normalizedSnapshot.location_id ? locationsById.get(normalizedSnapshot.location_id) ?? null : null,
    locationId: normalizedSnapshot.location_id,
    negativeReviews: normalizedSnapshot.negative_reviews,
    periodEnd: normalizedSnapshot.period_end,
    periodLabel: normalizedSnapshot.period_label,
    periodStart: normalizedSnapshot.period_start,
    providerProfileCompleteness: normalizedSnapshot.provider_profile_completeness,
    reviewCount: normalizedSnapshot.review_count,
    reviewRequestSent: normalizedSnapshot.review_request_sent,
    reviewRequestStatus: normalizedSnapshot.review_request_sent > 0 ? 'Active' : 'Not started',
    reviewResponseDrafts: normalizedSnapshot.review_response_drafts,
    reviewsGained: normalizedSnapshot.reviews_gained,
    summary: normalizedSnapshot.summary,
    unansweredReviews: normalizedSnapshot.unanswered_reviews,
  }
}

function summarizeReputationSnapshots(snapshots) {
  const latestSnapshot = snapshots[0] ?? null

  return {
    gbpUpdates: snapshots.reduce((total, snapshot) => total + snapshot.gbpUpdates, 0),
    googleRating: latestSnapshot?.googleRating ?? 0,
    negativeReviews: snapshots.reduce((total, snapshot) => total + snapshot.negativeReviews, 0),
    providerProfileCompleteness: latestSnapshot?.providerProfileCompleteness ?? 0,
    reviewCount: latestSnapshot?.reviewCount ?? 0,
    reviewRequestSent: snapshots.reduce((total, snapshot) => total + snapshot.reviewRequestSent, 0),
    reviewResponseDrafts: snapshots.reduce((total, snapshot) => total + snapshot.reviewResponseDrafts, 0),
    reviewsGained: snapshots.reduce((total, snapshot) => total + snapshot.reviewsGained, 0),
    unansweredReviews: snapshots.reduce((total, snapshot) => total + snapshot.unansweredReviews, 0),
  }
}

function canReadClinicClient({ client, clientId, viewer }) {
  if (!client || client.type !== CLIENT_TYPES.CLINIC) {
    return false
  }

  if (viewer?.role === USER_ROLES.AGENCY_ADMIN) {
    return Boolean(viewer.agencyId && client.agency_id === viewer.agencyId)
  }

  return canAccessClient(viewer, clientId)
}

export function getClientClinicFoundationPage({
  clientId,
  repositories,
  viewer,
}) {
  const client = repositories.clients.findById(clientId)

  if (!canReadClinicClient({ client, clientId, viewer })) {
    return {
      reason: 'access_denied',
      status: 'error',
    }
  }

  const locations = (repositories.clinicLocations?.listByClientId(clientId) ?? [])
    .sort(sortRawByDisplayOrder)
    .map(mapLocation)
  const locationsById = new Map(locations.map((location) => [location.id, location]))
  const serviceLines = (repositories.clinicServiceLines?.listByClientId(clientId) ?? [])
    .sort(sortRawByDisplayOrder)
    .map((serviceLine) => mapServiceLine(serviceLine, locationsById))
  const profileRecord = repositories.clinicProfiles?.listByClientId(clientId)?.[0] ?? null

  return {
    client: {
      id: client.id,
      name: client.name,
      portalSlug: client.portal_slug,
      type: client.type,
      typeMeta: CLIENT_TYPE_META[client.type],
    },
    locations,
    profile: mapProfile(profileRecord),
    serviceLines,
    status: 'ready',
  }
}

export function getClientClinicServiceLinesPage(input) {
  const foundationPage = getClientClinicFoundationPage(input)

  if (foundationPage.status === 'error') {
    return foundationPage
  }

  return {
    client: foundationPage.client,
    isEmpty: foundationPage.serviceLines.length === 0,
    locations: foundationPage.locations,
    profile: foundationPage.profile,
    serviceLines: foundationPage.serviceLines,
    status: 'ready',
  }
}

export function getClientPatientAcquisitionPage(input) {
  const foundationPage = getClientClinicFoundationPage(input)

  if (foundationPage.status === 'error') {
    return foundationPage
  }

  const serviceLinesById = new Map(foundationPage.serviceLines.map((serviceLine) => [serviceLine.id, serviceLine]))
  const locationsById = new Map(foundationPage.locations.map((location) => [location.id, location]))
  const snapshots = (input.repositories.patientAcquisitionSnapshots?.listByClientId(input.clientId) ?? [])
    .map((snapshot) => mapPatientAcquisitionSnapshot(snapshot, { locationsById, serviceLinesById }))
    .sort((left, right) => (
      new Date(right.periodStart).getTime() - new Date(left.periodStart).getTime()
      || left.channel.localeCompare(right.channel)
      || (left.serviceLine?.name ?? '').localeCompare(right.serviceLine?.name ?? '')
    ))
  const totals = snapshots.reduce(addSnapshotTotals, createEmptyAcquisitionTotals())
  const inquiries = totals.calls + totals.forms + totals.chats

  return {
    client: foundationPage.client,
    funnel: buildAcquisitionFunnel(totals),
    isEmpty: snapshots.length === 0,
    latestUpdatedAt: snapshots
      .map((snapshot) => snapshot.lastUpdatedAt)
      .filter(Boolean)
      .sort()
      .at(-1) ?? null,
    locations: foundationPage.locations,
    profile: foundationPage.profile,
    serviceLines: foundationPage.serviceLines,
    snapshots,
    status: 'ready',
    totals: {
      ...totals,
      bookingRate: divide(totals.bookedAppointments, inquiries),
      costPerBookedAppointment: divide(totals.spend, totals.bookedAppointments),
      inquiries,
    },
  }
}

export function getClientCallsBookingsPage(input) {
  const foundationPage = getClientClinicFoundationPage(input)

  if (foundationPage.status === 'error') {
    return foundationPage
  }

  const serviceLinesById = new Map(foundationPage.serviceLines.map((serviceLine) => [serviceLine.id, serviceLine]))
  const locationsById = new Map(foundationPage.locations.map((location) => [location.id, location]))
  const metrics = (input.repositories.callBookingMetrics?.listByClientId(input.clientId) ?? [])
    .map((metric) => mapCallBookingMetric(metric, { locationsById, serviceLinesById }))
    .sort((left, right) => (
      new Date(right.periodStart).getTime() - new Date(left.periodStart).getTime()
      || (left.serviceLine?.name ?? '').localeCompare(right.serviceLine?.name ?? '')
    ))
  const rawTotals = metrics.reduce(addCallBookingTotals, createEmptyCallBookingTotals())

  return {
    client: foundationPage.client,
    isEmpty: metrics.length === 0,
    latestUpdatedAt: metrics
      .map((metric) => metric.lastUpdatedAt)
      .filter(Boolean)
      .sort()
      .at(-1) ?? null,
    locations: foundationPage.locations,
    metrics,
    notBookedReasons: aggregateNotBookedReasons(metrics),
    profile: foundationPage.profile,
    serviceLines: foundationPage.serviceLines,
    status: 'ready',
    totals: {
      ...rawTotals,
      answeredRate: divide(rawTotals.answeredCalls, rawTotals.totalCalls),
      averageResponseSeconds: divide(rawTotals.responseSecondsWeightedTotal, rawTotals.totalCalls),
      callBookingRate: divide(rawTotals.bookedFromCalls, rawTotals.totalCalls),
      missedRate: divide(rawTotals.missedCalls, rawTotals.totalCalls),
    },
  }
}

export function getClientReputationPage(input) {
  const foundationPage = getClientClinicFoundationPage(input)

  if (foundationPage.status === 'error') {
    return foundationPage
  }

  const locationsById = new Map(foundationPage.locations.map((location) => [location.id, location]))
  const snapshots = (input.repositories.reputationSnapshots?.listByClientId(input.clientId) ?? [])
    .map((snapshot) => mapReputationSnapshot(snapshot, { locationsById }))
    .sort((left, right) => (
      new Date(right.periodStart).getTime() - new Date(left.periodStart).getTime()
      || (left.location?.name ?? '').localeCompare(right.location?.name ?? '')
    ))

  return {
    client: foundationPage.client,
    isEmpty: snapshots.length === 0,
    latestSnapshot: snapshots[0] ?? null,
    latestUpdatedAt: snapshots
      .map((snapshot) => snapshot.lastUpdatedAt)
      .filter(Boolean)
      .sort()
      .at(-1) ?? null,
    locations: foundationPage.locations,
    profile: foundationPage.profile,
    serviceLines: foundationPage.serviceLines,
    snapshots,
    status: 'ready',
    totals: summarizeReputationSnapshots(snapshots),
  }
}
