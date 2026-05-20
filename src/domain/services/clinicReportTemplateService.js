import { CLIENT_TYPES } from '../../entities/client'
import { assertClinicAggregateRecord } from '../../entities/clinic'
import { USER_ROLES } from '../../entities/profile'
import {
  getClientCallsBookingsPage,
  getClientClinicServiceLinesPage,
  getClientComplianceApprovalsPage,
  getClientPatientAcquisitionPage,
  getClientReputationPage,
} from './clinicClientService'
import { listClientNeededActions } from './neededFromClientService'

function assertAgencyAdmin(viewer) {
  if (viewer?.role !== USER_ROLES.AGENCY_ADMIN || !viewer.agencyId) {
    throw new Error('Only admins can manage reports.')
  }
}

function normalizeText(value = '') {
  return String(value).trim()
}

function normalizeNumber(value) {
  const numberValue = Number(value)
  return Number.isFinite(numberValue) ? numberValue : 0
}

function normalizeList(value) {
  if (Array.isArray(value)) {
    return value.map((item) => normalizeText(item)).filter(Boolean)
  }

  return normalizeText(value)
    .split('\n')
    .map((item) => normalizeText(item).replace(/^-+\s*/, ''))
    .filter(Boolean)
}

export function normalizeClinicReportSections(value = null) {
  if (!value) {
    return null
  }

  assertClinicAggregateRecord(value, 'Clinic report sections')

  return {
    agency_work_completed: normalizeList(value.agencyWorkCompleted ?? value.agency_work_completed),
    booking_leakage: {
      follow_up_needed: normalizeNumber(value.bookingLeakage?.followUpNeeded ?? value.booking_leakage?.follow_up_needed),
      missed_calls: normalizeNumber(value.bookingLeakage?.missedCalls ?? value.booking_leakage?.missed_calls),
      no_response_leads: normalizeNumber(value.bookingLeakage?.noResponseLeads ?? value.booking_leakage?.no_response_leads),
      summary: normalizeText(value.bookingLeakage?.summary ?? value.booking_leakage?.summary),
    },
    clinic_actions_needed: normalizeList(value.clinicActionsNeeded ?? value.clinic_actions_needed),
    compliance: {
      limited_ads: normalizeNumber(value.compliance?.limitedAds ?? value.compliance?.limited_ads),
      open_issues: normalizeNumber(value.compliance?.openIssues ?? value.compliance?.open_issues),
      pending_approvals: normalizeNumber(value.compliance?.pendingApprovals ?? value.compliance?.pending_approvals),
      summary: normalizeText(value.compliance?.summary),
    },
    next_month_plan: normalizeList(value.nextMonthPlan ?? value.next_month_plan),
    patient_acquisition: {
      booked_appointments: normalizeNumber(value.patientAcquisition?.bookedAppointments ?? value.patient_acquisition?.booked_appointments),
      cost_per_booked_appointment: normalizeNumber(
        value.patientAcquisition?.costPerBookedAppointment ?? value.patient_acquisition?.cost_per_booked_appointment,
      ),
      inquiries: normalizeNumber(value.patientAcquisition?.inquiries ?? value.patient_acquisition?.inquiries),
      summary: normalizeText(value.patientAcquisition?.summary ?? value.patient_acquisition?.summary),
      top_locations: normalizeList(value.patientAcquisition?.topLocations ?? value.patient_acquisition?.top_locations),
      top_service_lines: normalizeList(value.patientAcquisition?.topServiceLines ?? value.patient_acquisition?.top_service_lines),
    },
    reputation: {
      google_rating: normalizeNumber(value.reputation?.googleRating ?? value.reputation?.google_rating),
      reviews_gained: normalizeNumber(value.reputation?.reviewsGained ?? value.reputation?.reviews_gained),
      summary: normalizeText(value.reputation?.summary),
      unanswered_reviews: normalizeNumber(value.reputation?.unansweredReviews ?? value.reputation?.unanswered_reviews),
    },
  }
}

export function mapClinicReportSections(sections) {
  if (!sections) {
    return null
  }

  const normalizedSections = normalizeClinicReportSections(sections)

  return {
    agencyWorkCompleted: normalizedSections.agency_work_completed,
    bookingLeakage: {
      followUpNeeded: normalizedSections.booking_leakage.follow_up_needed,
      missedCalls: normalizedSections.booking_leakage.missed_calls,
      noResponseLeads: normalizedSections.booking_leakage.no_response_leads,
      summary: normalizedSections.booking_leakage.summary,
    },
    clinicActionsNeeded: normalizedSections.clinic_actions_needed,
    compliance: {
      limitedAds: normalizedSections.compliance.limited_ads,
      openIssues: normalizedSections.compliance.open_issues,
      pendingApprovals: normalizedSections.compliance.pending_approvals,
      summary: normalizedSections.compliance.summary,
    },
    nextMonthPlan: normalizedSections.next_month_plan,
    patientAcquisition: {
      bookedAppointments: normalizedSections.patient_acquisition.booked_appointments,
      costPerBookedAppointment: normalizedSections.patient_acquisition.cost_per_booked_appointment,
      inquiries: normalizedSections.patient_acquisition.inquiries,
      summary: normalizedSections.patient_acquisition.summary,
      topLocations: normalizedSections.patient_acquisition.top_locations,
      topServiceLines: normalizedSections.patient_acquisition.top_service_lines,
    },
    reputation: {
      googleRating: normalizedSections.reputation.google_rating,
      reviewsGained: normalizedSections.reputation.reviews_gained,
      summary: normalizedSections.reputation.summary,
      unansweredReviews: normalizedSections.reputation.unanswered_reviews,
    },
  }
}

function getAdminClient({ clientId, repositories, viewer }) {
  const client = repositories.clients.findById(clientId)

  if (!client || client.agency_id !== viewer.agencyId) {
    throw new Error('Account was not found.')
  }

  return client
}

function formatMoney(value) {
  return `$${Math.round(value || 0).toLocaleString('en-US')}`
}

function getTopNames(items, valueSelector, nameSelector) {
  return [...items]
    .filter((item) => valueSelector(item) > 0)
    .sort((left, right) => valueSelector(right) - valueSelector(left))
    .slice(0, 3)
    .map(nameSelector)
    .filter(Boolean)
}

function buildClinicReportNarrative({
  actions,
  acquisition,
  callsBookings,
  compliance,
  reputation,
  serviceLines,
}) {
  const actionTitles = actions.actions
    .filter((action) => action.status === 'pending')
    .slice(0, 5)
    .map((action) => action.title)
  const topServiceLines = getTopNames(
    serviceLines.serviceLines,
    (serviceLine) => serviceLine.performanceTotals?.bookedAppointments ?? 0,
    (serviceLine) => serviceLine.name,
  )
  const topLocations = getTopNames(
    acquisition.snapshots,
    (snapshot) => snapshot.bookedAppointments,
    (snapshot) => snapshot.location?.name,
  )

  return {
    clientDecisionsNeeded: actionTitles.map((title) => `- ${title}`).join('\n'),
    clinicSections: {
      agencyWorkCompleted: [],
      bookingLeakage: {
        followUpNeeded: callsBookings.totals.followUpNeededCount,
        missedCalls: callsBookings.totals.missedCalls,
        noResponseLeads: callsBookings.totals.noResponseLeads,
        summary: callsBookings.operationalInsights.map((insight) => insight.recommendation).join(' '),
      },
      clinicActionsNeeded: actionTitles,
      compliance: {
        limitedAds: compliance.totals.limitedAds,
        openIssues: compliance.totals.openIssues,
        pendingApprovals: compliance.totals.pendingApprovals,
        summary: compliance.reviews
          .slice(0, 3)
          .map((review) => review.nextAction || review.riskNote || review.summary)
          .filter(Boolean)
          .join(' '),
      },
      nextMonthPlan: [],
      patientAcquisition: {
        bookedAppointments: acquisition.totals.bookedAppointments,
        costPerBookedAppointment: acquisition.totals.costPerBookedAppointment,
        inquiries: acquisition.totals.inquiries,
        summary: `${acquisition.totals.inquiries} inquiries produced ${acquisition.totals.bookedAppointments} booked appointments at ${formatMoney(acquisition.totals.costPerBookedAppointment)} per booked appointment.`,
        topLocations,
        topServiceLines,
      },
      reputation: {
        googleRating: reputation.totals.googleRating,
        reviewsGained: reputation.totals.reviewsGained,
        summary: `${reputation.totals.reviewsGained} new reviews were gained and ${reputation.totals.unansweredReviews} reviews still need response.`,
        unansweredReviews: reputation.totals.unansweredReviews,
      },
    },
    nextActions: [
      '- Improve follow-up on missed and no-response inquiries.',
      '- Continue scaling the best-performing service lines.',
      '- Resolve open compliance and approval items before expanding spend.',
    ].join('\n'),
    problems: [
      callsBookings.totals.missedCalls > 0 ? `- ${callsBookings.totals.missedCalls} missed calls may be leaking patient demand.` : '',
      compliance.totals.openIssues > 0 ? `- ${compliance.totals.openIssues} compliance issues remain open.` : '',
      reputation.totals.unansweredReviews > 0 ? `- ${reputation.totals.unansweredReviews} reviews still need response.` : '',
    ].filter(Boolean).join('\n'),
    results: [
      `Inquiries: ${acquisition.totals.inquiries}`,
      `Booked appointments: ${acquisition.totals.bookedAppointments}`,
      `Cost per booked appointment: ${formatMoney(acquisition.totals.costPerBookedAppointment)}`,
      `Missed calls: ${callsBookings.totals.missedCalls}`,
      `Reviews gained: ${reputation.totals.reviewsGained}`,
      `Open compliance issues: ${compliance.totals.openIssues}`,
    ].join('\n'),
    summary: `${acquisition.totals.bookedAppointments} booked appointments from ${acquisition.totals.inquiries} patient inquiries. The main operational focus is reducing booking leakage and clearing compliance or approval blockers.`,
  }
}

export function buildClinicReportDraftFromClientData({
  clientId,
  repositories,
  viewer,
}) {
  assertAgencyAdmin(viewer)

  const client = getAdminClient({ clientId, repositories, viewer })

  if (client.type !== CLIENT_TYPES.CLINIC) {
    throw new Error('Clinic report templates are only available for clinic clients.')
  }

  const pageInput = {
    clientId,
    repositories,
    viewer,
  }
  const acquisition = getClientPatientAcquisitionPage(pageInput)
  const callsBookings = getClientCallsBookingsPage(pageInput)
  const serviceLines = getClientClinicServiceLinesPage(pageInput)
  const reputation = getClientReputationPage(pageInput)
  const compliance = getClientComplianceApprovalsPage(pageInput)
  const actions = listClientNeededActions(pageInput)

  if ([acquisition, callsBookings, serviceLines, reputation, compliance, actions]
    .some((page) => page.status === 'error')) {
    throw new Error('Clinic report template data is not available.')
  }

  return buildClinicReportNarrative({
    actions,
    acquisition,
    callsBookings,
    compliance,
    reputation,
    serviceLines,
  })
}
