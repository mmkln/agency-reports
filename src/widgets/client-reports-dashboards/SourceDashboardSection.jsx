import {
  DashboardEmbedFrame,
  DashboardPageSummary,
  DashboardUnavailableState,
  NoDashboardState,
} from '../dashboard-embed'

export function SourceDashboardSection({ clientId, copy, dashboardPage }) {
  const dashboard = dashboardPage.dashboard

  return (
    <section className="grid gap-4" id="source-dashboard">
      <div>
        <p className="text-label text-text-muted">{copy?.sourceDashboardEyebrow ?? 'Source Dashboard'}</p>
        <h2 className="mt-1 text-heading text-text-primary">
          {copy?.sourceDashboardTitle ?? 'External dashboard detail'}
        </h2>
      </div>

      {!dashboard ? (
        <NoDashboardState />
      ) : (
        <>
          <DashboardPageSummary clientId={clientId} dashboard={dashboard} />
          {!dashboard.isAvailable ? (
            <DashboardUnavailableState dashboard={dashboard} />
          ) : (
            <DashboardEmbedFrame dashboard={dashboard} />
          )}
        </>
      )}
    </section>
  )
}
