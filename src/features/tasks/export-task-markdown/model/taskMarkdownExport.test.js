import { describe, expect, it } from 'vitest'

import { TASK_STATUSES } from '../../../../entities/task'
import { VISIBILITY } from '../../../../entities/update'
import { createAgencyAccessViewer } from '../../../../domain/test/accessViewerTestHelpers'
import { previewTaskMarkdownImport } from '../../import-task-markdown'
import { exportTasksToMarkdown } from './taskMarkdownExport'

const IDS = Object.freeze({
  AGENCY: '11111111-1111-4111-8111-111111111111',
  CLIENT: '22222222-2222-4222-8222-222222222222',
})

function createEntityRepository(initialRecords = []) {
  const records = initialRecords.map((record) => ({ ...record }))

  return {
    findById(id) {
      return records.find((record) => record.id === id) ?? null
    },
    list() {
      return records
    },
    listByClientId(clientId) {
      return records.filter((record) => record.client_id === clientId)
    },
    upsert(record) {
      records.push(record)
      return record
    },
  }
}

function createRepositories() {
  return {
    clients: createEntityRepository([
      {
        agency_id: IDS.AGENCY,
        id: IDS.CLIENT,
        name: 'Client',
      },
    ]),
    get workspaces() {
      return this.clients
    },
    projects: createEntityRepository([]),
    tasks: createEntityRepository([
      {
        client_id: IDS.CLIENT,
        description: 'Confirm event names before publishing.',
        id: 'task-1',
        project_id: '',
        status: TASK_STATUSES.IN_PROGRESS,
        title: 'Tracking QA',
        visibility: VISIBILITY.INTERNAL,
      },
      {
        client_id: IDS.CLIENT,
        description: '',
        id: 'task-2',
        project_id: '',
        status: TASK_STATUSES.DONE,
        title: 'Launch checklist',
        visibility: VISIBILITY.INTERNAL,
      },
    ]),
  }
}

function createAdminViewer() {
  return createAgencyAccessViewer({
    agencyId: IDS.AGENCY,
    managedWorkspaceIds: [IDS.CLIENT],
    name: 'Admin',
  })
}

describe('task Markdown export', () => {
  it('exports tasks grouped by status with descriptions', () => {
    const markdown = exportTasksToMarkdown({
      tasks: [
        {
          description: 'Confirm event names before publishing.',
          status: TASK_STATUSES.IN_PROGRESS,
          title: 'Tracking QA',
        },
        {
          status: TASK_STATUSES.DONE,
          title: 'Launch checklist',
        },
      ],
      title: 'Green Dental Tasks',
    })

    expect(markdown).toContain('# Green Dental Tasks')
    expect(markdown).toContain('## In Progress')
    expect(markdown).toContain('- [ ] Tracking QA')
    expect(markdown).toContain('  Confirm event names before publishing.')
    expect(markdown).toContain('## Done')
    expect(markdown).toContain('- [x] Launch checklist')
  })

  it('round-trips exported tasks into an import preview that skips existing titles', () => {
    const repositories = createRepositories()
    const markdown = exportTasksToMarkdown({
      tasks: repositories.tasks.list(),
      title: 'Exported Tasks',
    })
    const plan = previewTaskMarkdownImport({
      clientId: IDS.CLIENT,
      rawMarkdown: markdown,
      repositories,
      viewer: createAdminViewer(),
    })

    expect(plan.counts.skip).toBe(2)
    expect(plan.counts.create).toBe(0)
    expect(plan.items).toEqual(expect.arrayContaining([
      expect.objectContaining({ action: 'skip', label: 'Tracking QA' }),
      expect.objectContaining({ action: 'skip', label: 'Launch checklist' }),
    ]))
  })
})
