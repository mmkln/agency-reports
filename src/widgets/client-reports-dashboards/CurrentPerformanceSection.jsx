import {
  EmptyState,
  Panel,
  PanelBody,
  PanelHeader,
} from '@/shared/ui'

import { ClientPerformanceDashboard } from '../client-performance'

export function CurrentPerformanceSection({ copy, mode, performancePage }) {
  const sectionCopy = {
    emptyDescription: copy?.currentPerformanceEmptyDescription ?? 'Published outcome metrics, goals, trends, and interpretation will appear here after agency review.',
    emptyTitle: copy?.currentPerformanceEmptyTitle ?? 'Current performance is being prepared',
    eyebrow: copy?.currentPerformanceEyebrow ?? 'Current Performance',
    subtitle: copy?.currentPerformanceSubtitle ?? 'The agency has not published interpreted analytics for this client yet.',
    title: copy?.currentPerformanceTitle ?? 'Business-value analytics',
  }

  if (!performancePage.performanceDashboard) {
    return (
      <Panel>
        <PanelHeader
          subtitle={sectionCopy.subtitle}
          title={sectionCopy.eyebrow}
        />
        <PanelBody>
          <EmptyState
            description={sectionCopy.emptyDescription}
            iconName="barChart"
            title={sectionCopy.emptyTitle}
          />
        </PanelBody>
      </Panel>
    )
  }

  return (
    <section className="grid gap-4" id="current-performance">
      <div>
        <p className="text-label text-text-muted">{sectionCopy.eyebrow}</p>
        <h2 className="mt-1 text-heading text-text-primary">{sectionCopy.title}</h2>
      </div>
      <ClientPerformanceDashboard
        mode={mode}
        page={performancePage}
        showRelatedLinks={false}
      />
    </section>
  )
}
