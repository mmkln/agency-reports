import { renderToStaticMarkup } from 'react-dom/server'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'

import { ToastProvider } from '@/shared/notifications'

import { useGrowthReviewReviewsWorkflow } from './useGrowthReviewReviewsWorkflow'

function WorkflowProbe() {
  const workflow = useGrowthReviewReviewsWorkflow({
    apiClient: {},
    workspaceId: 'workspace-1',
  })

  return <span>{workflow.reviewDraft.name || 'empty-draft'}</span>
}

describe('useGrowthReviewReviewsWorkflow', () => {
  it('provides an empty draft before reviews are loaded', () => {
    const html = renderToStaticMarkup(
      <MemoryRouter>
        <ToastProvider>
          <WorkflowProbe />
        </ToastProvider>
      </MemoryRouter>,
    )

    expect(html).toContain('empty-draft')
  })
})
