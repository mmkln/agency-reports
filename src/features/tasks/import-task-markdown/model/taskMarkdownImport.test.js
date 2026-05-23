import { describe, expect, it } from 'vitest'

import { TASK_STATUSES } from '../../../../entities/task'
import { VISIBILITY } from '../../../../entities/update'
import { createAgencyAccessViewer } from '../../../../domain/test/accessViewerTestHelpers'
import {
  applyTaskMarkdownImport,
  previewTaskMarkdownImport,
} from './taskMarkdownImport'

const IDS = Object.freeze({
  AGENCY: '11111111-1111-4111-8111-111111111111',
  CLIENT: '22222222-2222-4222-8222-222222222222',
  PROJECT: '33333333-3333-4333-8333-333333333333',
  TASK_EXISTING: '44444444-4444-4444-8444-444444444444',
  TASK_NEW: '55555555-5555-4555-8555-555555555555',
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
    listByWorkspaceId(workspaceId) {
      return records.filter((record) => record.workspace_id === workspaceId || record.client_id === workspaceId)
    },
    upsert(record) {
      const index = records.findIndex((item) => item.id === record.id)

      if (index >= 0) {
        records[index] = { ...records[index], ...record }
      } else {
        records.push(record)
      }

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
    projects: createEntityRepository([
      {
        client_id: IDS.CLIENT,
        id: IDS.PROJECT,
        name: 'Website',
      },
    ]),
    tasks: createEntityRepository([
      {
        assignee_name: '',
        client_id: IDS.CLIENT,
        id: IDS.TASK_EXISTING,
        project_id: IDS.PROJECT,
        sort_order: 10,
        status: TASK_STATUSES.TODO,
        title: 'Existing task',
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

describe('task Markdown import', () => {
  it('previews creates and skips existing tasks by title', () => {
    const plan = previewTaskMarkdownImport({
      clientId: IDS.CLIENT,
      projectId: IDS.PROJECT,
      rawMarkdown: `
## In Progress
- [ ] Existing task
- [ ] Build tracking plan

## Done
- [ ] QA launch checklist`,
      repositories: createRepositories(),
      viewer: createAdminViewer(),
    })

    expect(plan.counts).toMatchObject({
      create: 2,
      skip: 1,
    })
    expect(plan.items).toEqual(expect.arrayContaining([
      expect.objectContaining({ action: 'skip', label: 'Existing task' }),
      expect.objectContaining({ action: 'create', label: 'Build tracking plan', status: TASK_STATUSES.IN_PROGRESS }),
      expect.objectContaining({ action: 'create', label: 'QA launch checklist', status: TASK_STATUSES.DONE }),
    ]))
  })

  it('applies previewed create items through the task workspace service', () => {
    const repositories = createRepositories()
    const plan = previewTaskMarkdownImport({
      clientId: IDS.CLIENT,
      projectId: IDS.PROJECT,
      rawMarkdown: `
## To Do
- [ ] Imported task`,
      repositories,
      viewer: createAdminViewer(),
    })

    const createdTasks = applyTaskMarkdownImport({
      idGenerator: () => IDS.TASK_NEW,
      now: () => '2026-05-16T10:00:00.000Z',
      preview: plan,
      repositories,
      viewer: createAdminViewer(),
    })

    expect(createdTasks).toHaveLength(1)
    expect(repositories.tasks.findById(IDS.TASK_NEW)).toMatchObject({
      client_id: IDS.CLIENT,
      client_visible: false,
      created_at: '2026-05-16T10:00:00.000Z',
      project_id: IDS.PROJECT,
      status: TASK_STATUSES.TODO,
      title: 'Imported task',
      visibility: VISIBILITY.INTERNAL,
    })
  })
})
