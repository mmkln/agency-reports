import { CLIENT_STATUS_META, CLIENT_TYPES } from '../../entities/client'
import {
  CLIENT_WORK_ITEM_STATUSES,
} from '../../entities/client-work-item'
import { DASHBOARD_LINK_STATUSES, DASHBOARD_LINK_STATUS_META } from '../../entities/dashboard-link'
import {
  NEEDED_ACTION_PRIORITY_META,
  NEEDED_ACTION_STATUS_META,
  normalizeNeededAction,
} from '../../entities/needed-from-client'
import {
  CLINIC_REPORTING_CAPABILITIES,
} from '../../entities/profile'
import { canAccessWorkspaceResource } from '../policies/accessPolicy'
import { hasAgencyAdminMembership } from '../policies/routeAccessPolicy'
import { listClientVisibleFileLinks } from './clientFilesLinksService'
import {
  getClientCallsBookingsPage,
  getClientComplianceApprovalsPage,
  getClientPatientAcquisitionPage,
  getClientReputationPage,
} from './clinicClientService'
import { getClientPerformanceOverviewPreview } from './clientPerformanceDashboardService'
import { listPublishedClientWorkItems } from './clientWorkItemService'
import {
  isDashboardVisibleToClient,
  isNeededActionVisibleToClient,
  isReportVisibleToClient,
  isUpdateVisibleToClient,
} from '../policies/visibilityPolicy'

function sortByDateDesc(a, b, fieldName) {
  return new Date(b[fieldName]).getTime() - new Date(a[fieldName]).getTime()
}

function getStatusMeta(status, registry) {
  return registry[status] ?? {
    label: status,
    tone: 'neutral',
  }
}

function mapNeededAction(action) {
  const normalizedAction = normalizeNeededAction(action)
  const dueTime = normalizedAction.due_date ? new Date(normalizedAction.due_date).getTime() : null
  const now = new Date().getTime()

  return {
    clientResponse: normalizedAction.client_response,
    description: normalizedAction.description,
    dueDate: normalizedAction.due_date,
    id: normalizedAction.id,
    isOverdue: normalizedAction.status === 'pending' && Boolean(dueTime) && dueTime < now,
    priority: normalizedAction.priority,
    priorityMeta: getStatusMeta(normalizedAction.priority, NEEDED_ACTION_PRIORITY_META),
    relatedLink: normalizedAction.related_link,
    responseHistory: normalizedAction.response_history,
    respondedAt: normalizedAction.client_responded_at,
    respondedBy: normalizedAction.client_responded_by,
    resolvedAt: normalizedAction.resolved_at,
    status: normalizedAction.status,
    statusMeta: getStatusMeta(normalizedAction.status, NEEDED_ACTION_STATUS_META),
    title: normalizedAction.title,
  }
}

function mapProject(project) {
  return {
    description: project.description,
    id: project.id,
    name: project.name,
    progressPercent: project.progress_percent,
    status: project.status,
  }
}

function getSnapshotOverviewCollections({ client, clientId, repositories, snapshot, viewer }) {
  return {
    activeWorkItems: getPublishedActiveWorkItems({ clientId, repositories, viewer }),
    clientStatus: snapshot.client?.status ?? client.status,
    currentFocus: snapshot.currentFocus ?? [],
    dashboardLinks: snapshot.dashboardLinks ?? [],
    neededActions: repositories.neededFromClient.listByWorkspaceId(clientId),
    projects: snapshot.projects ?? [],
    reports: snapshot.reports ?? [],
    updates: snapshot.updates ?? [],
  }
}

function getOverviewCollections({ client, clientId, repositories, source, viewer }) {
  if (source === 'draft') {
    if (!hasAgencyAdminMembership(viewer)) {
      return null
    }

    if (client.overview_draft) {
      return {
        activeWorkItems: getPublishedActiveWorkItems({ clientId, repositories, viewer }),
        clientStatus: client.overview_draft.client?.status ?? client.status,
        currentFocus: client.overview_draft.currentFocus ?? [],
        dashboardLinks: client.overview_draft.dashboardLinks ?? [],
        neededActions: repositories.neededFromClient.listByWorkspaceId(clientId),
        projects: client.overview_draft.projects ?? [],
        reports: client.overview_draft.reports ?? [],
        updates: client.overview_draft.updates ?? [],
      }
    }
  }

  if (client.overview_published_snapshot) {
    return getSnapshotOverviewCollections({
      client,
      clientId,
      repositories,
      snapshot: client.overview_published_snapshot,
      viewer,
    })
  }

  return {
    activeWorkItems: getPublishedActiveWorkItems({ clientId, repositories, viewer }),
    clientStatus: client.status,
    currentFocus: client.current_focus ?? [],
    dashboardLinks: repositories.dashboardLinks.listByWorkspaceId(clientId),
    neededActions: repositories.neededFromClient.listByWorkspaceId(clientId),
    projects: repositories.projects.listByWorkspaceId(clientId),
    reports: repositories.reports.listByWorkspaceId(clientId),
    updates: repositories.updates.listByWorkspaceId(clientId),
  }
}

function getPublishedActiveWorkItems({ clientId, repositories, viewer }) {
  if (!repositories.clientWorkItems) {
    return []
  }

  const result = listPublishedClientWorkItems({
    clientId,
    repositories,
    viewer,
  })

  if (result.status === 'error') {
    return []
  }

  return result.workItems.filter((item) => item.status !== CLIENT_WORK_ITEM_STATUSES.DELIVERED)
}

function getPerformancePreview({ clientId, repositories, viewer }) {
  if (!repositories.performanceDashboardPeriods) {
    return null
  }

  const preview = getClientPerformanceOverviewPreview({
    clientId,
    repositories,
    viewer,
  })

  return preview.status === 'ready' ? preview.performanceDashboard : null
}

function getFilesLinksPreview({ clientId, repositories, viewer }) {
  if (!repositories.clientFileLinks) {
    return []
  }

  const result = listClientVisibleFileLinks({
    clientId,
    repositories,
    viewer,
  })

  if (result.status === 'error') {
    return []
  }

  return result.fileLinks.slice(0, 4)
}

function getReadyClinicPage(loader, input) {
  const page = loader(input)

  return page.status === 'ready' ? page : null
}

function getClinicOverviewPreview({ clientId, neededActions, repositories, viewer }) {
  const input = { clientId, repositories, viewer }
  const acquisition = getReadyClinicPage(getClientPatientAcquisitionPage, input)
  const callsBookings = getReadyClinicPage(getClientCallsBookingsPage, input)
  const reputation = getReadyClinicPage(getClientReputationPage, input)
  const compliance = getReadyClinicPage(getClientComplianceApprovalsPage, input)
  const topSnapshot = acquisition?.snapshots
    ?.slice()
    .sort((left, right) => right.bookedAppointments - left.bookedAppointments)[0] ?? null

  return {
    actionNeededCount: neededActions.filter((action) => action.status === 'pending').length,
    booking: callsBookings
      ? {
          followUpNeededCount: callsBookings.totals.followUpNeededCount,
          href: `/client/calls-bookings?clientId=${clientId}`,
          missedCalls: callsBookings.totals.missedCalls,
          missedRate: callsBookings.totals.missedRate,
          noResponseLeads: callsBookings.totals.noResponseLeads,
        }
      : null,
    compliance: compliance
      ? {
          href: `/client/compliance-approvals?clientId=${clientId}`,
          limitedAds: compliance.totals.limitedAds,
          openIssues: compliance.totals.openIssues,
          pendingApprovals: compliance.totals.pendingApprovals,
          riskFlaggedReviews: compliance.totals.riskFlaggedReviews,
        }
      : null,
    patientAcquisition: acquisition
      ? {
          bookedAppointments: acquisition.totals.bookedAppointments,
          costPerBookedAppointment: acquisition.totals.costPerBookedAppointment,
          href: `/client/patient-acquisition?clientId=${clientId}`,
          inquiries: acquisition.totals.inquiries,
          topLocation: topSnapshot?.location?.name ?? null,
          topServiceLine: topSnapshot?.serviceLine?.name ?? null,
        }
      : null,
    reputation: reputation
      ? {
          googleRating: reputation.totals.googleRating,
          href: `/client/reputation?clientId=${clientId}`,
          reviewsGained: reputation.totals.reviewsGained,
          unansweredReviews: reputation.totals.unansweredReviews,
        }
      : null,
    clientId,
    dentalGrowthReviewHref: (viewer?.capabilities ?? []).includes(CLINIC_REPORTING_CAPABILITIES.DENTAL_GROWTH_REVIEW_VIEW)
      ? `/client/growth-review?clientId=${clientId}`
      : null,
    serviceLinesHref: `/client/service-lines?clientId=${clientId}`,
  }
}

export function getClientOverviewPage({ clientId, repositories, source = 'published', viewer }) {
  const client = repositories.workspaces.findById(clientId)

  if (!client || !canAccessWorkspaceResource(viewer, clientId)) {
    return {
      reason: 'access_denied',
      status: 'error',
    }
  }

  const collections = getOverviewCollections({
    client,
    clientId,
    repositories,
    source,
    viewer,
  })

  if (!collections) {
    return {
      reason: 'access_denied',
      status: 'error',
    }
  }

  const projects = collections.projects
    .map(mapProject)
    .sort((a, b) => b.progressPercent - a.progressPercent)

  const activeWorkItems = collections.activeWorkItems

  const latestUpdate = collections.updates
    .filter(isUpdateVisibleToClient)
    .sort((a, b) => sortByDateDesc(a, b, 'created_at'))[0] ?? null

  const neededActions = collections.neededActions
    .filter(isNeededActionVisibleToClient)
    .sort((a, b) => {
      const priority = {
        pending: 0,
        answered: 1,
        resolved: 2,
      }

      return (priority[a.status] ?? 3) - (priority[b.status] ?? 3)
        || new Date(a.due_date ?? 0).getTime() - new Date(b.due_date ?? 0).getTime()
    })
    .map(mapNeededAction)

  const dashboard = collections.dashboardLinks
    .filter(isDashboardVisibleToClient)
    .sort((a, b) => Number(b.show_on_overview) - Number(a.show_on_overview))[0] ?? null

  const latestReport = collections.reports
    .filter(isReportVisibleToClient)
    .sort((a, b) => sortByDateDesc(a, b, 'period_end'))[0] ?? null
  const performancePreview = getPerformancePreview({
    clientId,
    repositories,
    viewer,
  })
  const fileLinksPreview = getFilesLinksPreview({
    clientId,
    repositories,
    viewer,
  })
  const clinicOverview = client.type === CLIENT_TYPES.CLINIC
    ? getClinicOverviewPreview({
        clientId,
        neededActions,
        repositories,
        viewer,
      })
    : null
  const currentFocus = collections.currentFocus
  const isEmpty = currentFocus.length === 0
    && projects.length === 0
    && activeWorkItems.length === 0
    && !latestUpdate
    && neededActions.length === 0
    && !dashboard
    && !latestReport
    && fileLinksPreview.length === 0
    && !performancePreview

  return {
    activeWorkItems,
    client: {
      id: client.id,
      name: client.name,
      portalSlug: client.portal_slug,
      primaryContactEmail: client.primary_contact_email,
      primaryContactName: client.primary_contact_name,
      status: collections.clientStatus,
      statusMeta: getStatusMeta(collections.clientStatus, CLIENT_STATUS_META),
      type: client.type ?? CLIENT_TYPES.GENERIC,
    },
    clinicOverview,
    currentFocus,
    dashboard: dashboard
      ? {
          description: dashboard.description ?? '',
          embedUrl: dashboard.embed_url,
          fallbackMessage: dashboard.fallback_message,
          id: dashboard.id,
          isAvailable: dashboard.status === DASHBOARD_LINK_STATUSES.ACTIVE,
          name: dashboard.name,
          provider: dashboard.provider,
          publicUrl: dashboard.public_url,
          status: dashboard.status,
          statusMeta: getStatusMeta(dashboard.status, DASHBOARD_LINK_STATUS_META),
        }
      : null,
    isEmpty,
    latestReport: latestReport
      ? {
          dashboardUrl: latestReport.dashboard_url,
          id: latestReport.id,
          pdfUrl: latestReport.pdf_url,
          periodEnd: latestReport.period_end,
          periodStart: latestReport.period_start,
          summary: latestReport.summary,
          title: latestReport.title,
        }
      : null,
    latestUpdate: latestUpdate
      ? {
          body: latestUpdate.body,
          id: latestUpdate.id,
          title: latestUpdate.title,
          updatedAt: latestUpdate.updated_at,
        }
      : null,
    fileLinksPreview,
    neededActions,
    performancePreview,
    progressSummary: projects,
    status: 'ready',
    template: clinicOverview ? CLIENT_TYPES.CLINIC : CLIENT_TYPES.GENERIC,
  }
}

export function getClientOverview(args) {
  return getClientOverviewPage(args)
}
