import { Progress } from '@/shared/ui'

import { EmptyState, SectionCard } from './_shared'

export function ProgressSummaryBlock({ projects }) {
  return (
    <SectionCard iconName="barChart" title="Progress by stage">
      {projects.length > 0 ? (
        <div className="grid gap-5">
          {projects.map((project) => (
            <article className="grid gap-2" key={project.id}>
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <h3 className="text-ui text-text-primary">{project.name}</h3>
                  <p className="mt-1 text-label font-normal text-text-muted">Current stage: {project.description}</p>
                </div>
                <span className="shrink-0 text-data tabular-nums text-action">{project.progressPercent}%</span>
              </div>
              <Progress aria-label={`${project.name} progress`} value={project.progressPercent} />
            </article>
          ))}
        </div>
      ) : (
        <EmptyState>No progress summary has been published yet.</EmptyState>
      )}
    </SectionCard>
  )
}
