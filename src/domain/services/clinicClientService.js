import { CLIENT_TYPES, CLIENT_TYPE_META } from '../../entities/client'
import {
  CLINIC_ACQUISITION_CHANNEL_META,
  CLINIC_APPROVAL_STATUS_META,
  CLINIC_APPROVAL_TYPE_META,
  CLINIC_CAMPAIGN_STATUS_META,
  CLINIC_COMPLIANCE_STATUS_META,
  CLINIC_PROFILE_SPECIALTY_META,
  CLINIC_RECORD_PUBLISH_STATES,
  CLINIC_SERVICE_LINE_STATUS_META,
  normalizeCallBookingMetric,
  normalizeComplianceReview,
  normalizeClinicLocation,
  normalizeClinicProfile,
  normalizeClinicServiceLine,
  normalizeMedicalApproval,
  normalizePatientAcquisitionSnapshot,
  normalizeReputationSnapshot,
  normalizeServiceLinePerformance,
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

function mapServiceLinePerformance(performance, { locationsById, serviceLinesById }) {
  const normalizedPerformance = normalizeServiceLinePerformance(performance)

  return {
    adApprovalStatus: normalizedPerformance.ad_approval_status,
    bookedAppointments: normalizedPerformance.booked_appointments,
    bookingRate: divide(normalizedPerformance.booked_appointments, normalizedPerformance.inquiries),
    campaignName: normalizedPerformance.campaign_name,
    campaignStatus: normalizedPerformance.campaign_status,
    campaignStatusMeta: CLINIC_CAMPAIGN_STATUS_META[normalizedPerformance.campaign_status],
    capacityNote: normalizedPerformance.capacity_note,
    clientId: normalizedPerformance.client_id,
    complianceStatus: normalizedPerformance.compliance_status,
    complianceStatusMeta: CLINIC_COMPLIANCE_STATUS_META[normalizedPerformance.compliance_status],
    costPerBookedAppointment: normalizedPerformance.cost_per_booked_appointment
      || divide(normalizedPerformance.spend, normalizedPerformance.booked_appointments),
    costPerInquiry: normalizedPerformance.cost_per_inquiry
      || divide(normalizedPerformance.spend, normalizedPerformance.inquiries),
    dataSource: normalizedPerformance.data_source,
    id: normalizedPerformance.id,
    inquiries: normalizedPerformance.inquiries,
    insight: normalizedPerformance.insight,
    landingPageStatus: normalizedPerformance.landing_page_status,
    lastUpdatedAt: normalizedPerformance.last_updated_at,
    location: normalizedPerformance.location_id ? locationsById.get(normalizedPerformance.location_id) ?? null : null,
    locationId: normalizedPerformance.location_id,
    periodEnd: normalizedPerformance.period_end,
    periodLabel: normalizedPerformance.period_label,
    periodStart: normalizedPerformance.period_start,
    serviceLine: normalizedPerformance.service_line_id
      ? serviceLinesById.get(normalizedPerformance.service_line_id) ?? null
      : null,
    serviceLineId: normalizedPerformance.service_line_id,
    spend: normalizedPerformance.spend,
    summary: normalizedPerformance.summary,
  }
}

function createEmptyServiceLinePerformanceTotals() {
  return {
    bookedAppointments: 0,
    inquiries: 0,
    spend: 0,
  }
}

function addServiceLinePerformanceTotals(total, performance) {
  return {
    bookedAppointments: total.bookedAppointments + performance.bookedAppointments,
    inquiries: total.inquiries + performance.inquiries,
    spend: total.spend + performance.spend,
  }
}

function attachPerformanceToServiceLines(serviceLines, performanceRecords) {
  return serviceLines.map((serviceLine) => {
    const records = performanceRecords.filter((performance) => performance.serviceLineId === serviceLine.id)
    const totals = records.reduce(addServiceLinePerformanceTotals, createEmptyServiceLinePerformanceTotals())
    const latestPerformance = records[0] ?? null

    return {
      ...serviceLine,
      latestPerformance,
      performanceRecords: records,
      performanceTotals: {
        ...totals,
        bookingRate: divide(totals.bookedAppointments, totals.inquiries),
        costPerBookedAppointment: divide(totals.spend, totals.bookedAppointments),
        costPerInquiry: divide(totals.spend, totals.inquiries),
      },
    }
  })
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

function mapComplianceReview(review, { locationsById, serviceLinesById }) {
  const normalizedReview = normalizeComplianceReview(review)

  return {
    blockedItems: normalizedReview.blocked_items,
    clientId: normalizedReview.client_id,
    dataSource: normalizedReview.data_source,
    id: normalizedReview.id,
    lastUpdatedAt: normalizedReview.last_updated_at,
    limitedAds: normalizedReview.limited_ads,
    location: normalizedReview.location_id ? locationsById.get(normalizedReview.location_id) ?? null : null,
    locationId: normalizedReview.location_id,
    nextAction: normalizedReview.next_action,
    openIssues: normalizedReview.open_issues,
    pendingApprovals: normalizedReview.pending_approvals,
    platform: normalizedReview.platform,
    riskNote: normalizedReview.risk_note,
    serviceLine: normalizedReview.service_line_id
      ? serviceLinesById.get(normalizedReview.service_line_id) ?? null
      : null,
    serviceLineId: normalizedReview.service_line_id,
    status: normalizedReview.status,
    statusMeta: CLINIC_COMPLIANCE_STATUS_META[normalizedReview.status],
    summary: normalizedReview.summary,
    title: normalizedReview.title,
  }
}

function mapMedicalApproval(approval, { locationsById, serviceLinesById }) {
  const normalizedApproval = normalizeMedicalApproval(approval)

  return {
    approvalType: normalizedApproval.approval_type,
    approvalTypeMeta: CLINIC_APPROVAL_TYPE_META[normalizedApproval.approval_type],
    approvedAt: normalizedApproval.approved_at,
    approverLabel: normalizedApproval.approver_label,
    changesRequestedAt: normalizedApproval.changes_requested_at,
    clientId: normalizedApproval.client_id,
    decisionComment: normalizedApproval.decision_comment,
    dueDate: normalizedApproval.due_date,
    history: normalizedApproval.history,
    id: normalizedApproval.id,
    instructions: normalizedApproval.instructions,
    lastUpdatedAt: normalizedApproval.last_updated_at,
    location: normalizedApproval.location_id ? locationsById.get(normalizedApproval.location_id) ?? null : null,
    locationId: normalizedApproval.location_id,
    requestedByLabel: normalizedApproval.requested_by_label,
    serviceLine: normalizedApproval.service_line_id
      ? serviceLinesById.get(normalizedApproval.service_line_id) ?? null
      : null,
    serviceLineId: normalizedApproval.service_line_id,
    status: normalizedApproval.status,
    statusMeta: CLINIC_APPROVAL_STATUS_META[normalizedApproval.status],
    title: normalizedApproval.title,
    version: normalizedApproval.version,
  }
}

function summarizeCompliance({ approvals, reviews }) {
  return {
    approvedApprovals: approvals.filter((approval) => approval.status === 'approved').length,
    blockedItems: reviews.reduce((total, review) => total + review.blockedItems, 0),
    limitedAds: reviews.reduce((total, review) => total + review.limitedAds, 0),
    openIssues: reviews.reduce((total, review) => total + review.openIssues, 0),
    pendingApprovals: approvals.filter((approval) => approval.status === 'pending_medical_review').length,
    rejectedApprovals: approvals.filter((approval) => approval.status === 'rejected').length,
    reviewCount: reviews.length,
    riskFlaggedReviews: reviews.filter((review) => ['risk_flagged', 'blocked', 'limited_by_policy'].includes(review.status)).length,
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

function canPreviewClinicDrafts({ client, source, viewer }) {
  return source === 'draft'
    && viewer?.role === USER_ROLES.AGENCY_ADMIN
    && Boolean(viewer.agencyId && client?.agency_id === viewer.agencyId)
}

function isPublishedClinicRecord(record) {
  return record?.publish_state === CLINIC_RECORD_PUBLISH_STATES.PUBLISHED
}

function listClientVisibleClinicRecords({ clientId, repository, source }) {
  const records = repository?.listByClientId(clientId) ?? []

  if (source === 'draft') {
    return records
  }

  return records.filter(isPublishedClinicRecord)
}

export function getClientClinicFoundationPage({
  clientId,
  repositories,
  source = 'published',
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
    source: canPreviewClinicDrafts({ client, source, viewer }) ? 'draft' : 'published',
    status: 'ready',
  }
}

export function getClientClinicServiceLinesPage(input) {
  const foundationPage = getClientClinicFoundationPage(input)

  if (foundationPage.status === 'error') {
    return foundationPage
  }

  const serviceLinesById = new Map(foundationPage.serviceLines.map((serviceLine) => [serviceLine.id, serviceLine]))
  const locationsById = new Map(foundationPage.locations.map((location) => [location.id, location]))
  const performanceRecords = listClientVisibleClinicRecords({
    clientId: input.clientId,
    repository: input.repositories.serviceLinePerformance,
    source: foundationPage.source,
  })
    .map((performance) => mapServiceLinePerformance(performance, { locationsById, serviceLinesById }))
    .sort((left, right) => (
      new Date(right.periodStart).getTime() - new Date(left.periodStart).getTime()
      || (left.serviceLine?.name ?? '').localeCompare(right.serviceLine?.name ?? '')
    ))
  const serviceLines = attachPerformanceToServiceLines(foundationPage.serviceLines, performanceRecords)
  const totals = performanceRecords.reduce(addServiceLinePerformanceTotals, createEmptyServiceLinePerformanceTotals())

  return {
    client: foundationPage.client,
    isEmpty: serviceLines.length === 0,
    locations: foundationPage.locations,
    performanceRecords,
    profile: foundationPage.profile,
    serviceLines,
    source: foundationPage.source,
    status: 'ready',
    totals: {
      ...totals,
      bookingRate: divide(totals.bookedAppointments, totals.inquiries),
      costPerBookedAppointment: divide(totals.spend, totals.bookedAppointments),
      costPerInquiry: divide(totals.spend, totals.inquiries),
    },
  }
}

export function getClientPatientAcquisitionPage(input) {
  const foundationPage = getClientClinicFoundationPage(input)

  if (foundationPage.status === 'error') {
    return foundationPage
  }

  const serviceLinesById = new Map(foundationPage.serviceLines.map((serviceLine) => [serviceLine.id, serviceLine]))
  const locationsById = new Map(foundationPage.locations.map((location) => [location.id, location]))
  const snapshots = listClientVisibleClinicRecords({
    clientId: input.clientId,
    repository: input.repositories.patientAcquisitionSnapshots,
    source: foundationPage.source,
  })
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
    source: foundationPage.source,
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
  const metrics = listClientVisibleClinicRecords({
    clientId: input.clientId,
    repository: input.repositories.callBookingMetrics,
    source: foundationPage.source,
  })
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
    source: foundationPage.source,
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
  const snapshots = listClientVisibleClinicRecords({
    clientId: input.clientId,
    repository: input.repositories.reputationSnapshots,
    source: foundationPage.source,
  })
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
    source: foundationPage.source,
    status: 'ready',
    totals: summarizeReputationSnapshots(snapshots),
  }
}

export function getClientComplianceApprovalsPage(input) {
  const foundationPage = getClientClinicFoundationPage(input)

  if (foundationPage.status === 'error') {
    return foundationPage
  }

  const serviceLinesById = new Map(foundationPage.serviceLines.map((serviceLine) => [serviceLine.id, serviceLine]))
  const locationsById = new Map(foundationPage.locations.map((location) => [location.id, location]))
  const reviews = listClientVisibleClinicRecords({
    clientId: input.clientId,
    repository: input.repositories.complianceReviews,
    source: foundationPage.source,
  })
    .map((review) => mapComplianceReview(review, { locationsById, serviceLinesById }))
    .sort((left, right) => (
      right.openIssues - left.openIssues
      || left.title.localeCompare(right.title)
    ))
  const approvals = listClientVisibleClinicRecords({
    clientId: input.clientId,
    repository: input.repositories.medicalApprovals,
    source: foundationPage.source,
  })
    .map((approval) => mapMedicalApproval(approval, { locationsById, serviceLinesById }))
    .sort((left, right) => (
      new Date(left.dueDate ?? '9999-12-31').getTime() - new Date(right.dueDate ?? '9999-12-31').getTime()
      || left.title.localeCompare(right.title)
    ))

  return {
    approvals,
    client: foundationPage.client,
    isEmpty: reviews.length === 0 && approvals.length === 0,
    latestUpdatedAt: [...reviews, ...approvals]
      .map((item) => item.lastUpdatedAt)
      .filter(Boolean)
      .sort()
      .at(-1) ?? null,
    locations: foundationPage.locations,
    profile: foundationPage.profile,
    reviews,
    serviceLines: foundationPage.serviceLines,
    source: foundationPage.source,
    status: 'ready',
    totals: summarizeCompliance({ approvals, reviews }),
  }
}
