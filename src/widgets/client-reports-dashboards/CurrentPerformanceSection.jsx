import {
  EmptyState,
  Panel,
  PanelBody,
  PanelHeader,
} from '@/shared/ui'

import { ClientPerformanceDashboard } from '../client-performance'

export function CurrentPerformanceSection({ mode, performancePage }) {
  if (!performancePage.performanceDashboard) {
    return (
      <Panel>
        <PanelHeader
          subtitle="The agency has not published interpreted analytics for this client yet."
          title="Current Performance"
        />
        <PanelBody>
          <EmptyState
            description="Published outcome metrics, goals, trends, and interpretation will appear here after agency review."
            iconName="barChart"
            title="Current performance is being prepared"
          />
        </PanelBody>
      </Panel>
    )
  }

  return (
    <section className="grid gap-4" id="current-performance">
      <div>
        <p className="text-label text-text-muted">Current Performance</p>
        <h2 className="mt-1 text-heading text-text-primary">Business-value analytics</h2>
      </div>
      <ClientPerformanceDashboard
        mode={mode}
        page={performancePage}
        showRelatedLinks={false}
      />
    </section>
  )
}
