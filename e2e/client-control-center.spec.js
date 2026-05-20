import { expect, test } from '@playwright/test'

import { PORTAL_STORAGE_KEY } from '../src/app/providers/repositories/createLocalStoragePortalRepository.js'
import { SEED_IDS } from '../src/app/providers/repositories/portalSeedData.js'
import { AUTH_SESSION_STORAGE_KEY, DEMO_AUTH_PASSWORD } from '../src/domain/services/authService.js'
import { CLIENT_WORK_ITEM_PUBLISH_STATES } from '../src/entities/client-work-item/index.js'
import { NEEDED_ACTION_STATUSES } from '../src/entities/needed-from-client/index.js'
import { TASK_STATUSES } from '../src/entities/task/index.js'

test.setTimeout(120_000)

const ADMIN_EMAIL = 'admin@growthlab.example'
const CLIENT_EMAIL = 'client@greendental.example'
const TEAM_EMAIL = 'mia@growthlab.example'
const DEMO_ROLE_KEY = 'agency-reports.demo-role'

async function resetLocalDemo(page) {
  await page.goto('/', { waitUntil: 'domcontentloaded' })
  await page.evaluate(({ authKey, demoRoleKey, portalKey }) => {
    window.localStorage.removeItem(authKey)
    window.localStorage.removeItem(demoRoleKey)
    window.localStorage.removeItem(portalKey)
    window.sessionStorage.clear()
  }, {
    authKey: AUTH_SESSION_STORAGE_KEY,
    demoRoleKey: DEMO_ROLE_KEY,
    portalKey: PORTAL_STORAGE_KEY,
  })
}

async function signInAsClient(page) {
  await page.evaluate(({ authKey, demoRoleKey }) => {
    window.localStorage.removeItem(authKey)
    window.localStorage.setItem(demoRoleKey, 'client')
  }, {
    authKey: AUTH_SESSION_STORAGE_KEY,
    demoRoleKey: DEMO_ROLE_KEY,
  })
  await page.goto('/login', { waitUntil: 'domcontentloaded' })
  await page.locator('input[name="email"]').fill(CLIENT_EMAIL)
  await page.locator('input[name="password"]').fill(DEMO_AUTH_PASSWORD)
  await page.getByRole('button', { name: 'Sign in' }).click()
  await expect(page).toHaveURL(/\/client\/overview/)
}

async function signInAsAdmin(page) {
  await page.evaluate(({ authKey, demoRoleKey }) => {
    window.localStorage.removeItem(authKey)
    window.localStorage.setItem(demoRoleKey, 'admin')
  }, {
    authKey: AUTH_SESSION_STORAGE_KEY,
    demoRoleKey: DEMO_ROLE_KEY,
  })
  await page.goto('/login', { waitUntil: 'domcontentloaded' })
  await page.locator('input[name="email"]').fill(ADMIN_EMAIL)
  await page.locator('input[name="password"]').fill(DEMO_AUTH_PASSWORD)
  await page.getByRole('button', { name: 'Sign in' }).click()
  await expect(page).toHaveURL(/\/admin\/clients/)
}

async function signInAsTeam(page) {
  await page.evaluate(({ authKey, demoRoleKey }) => {
    window.localStorage.removeItem(authKey)
    window.localStorage.setItem(demoRoleKey, 'team')
  }, {
    authKey: AUTH_SESSION_STORAGE_KEY,
    demoRoleKey: DEMO_ROLE_KEY,
  })
  await page.goto('/login', { waitUntil: 'domcontentloaded' })
  await page.locator('input[name="email"]').fill(TEAM_EMAIL)
  await page.locator('input[name="password"]').fill(DEMO_AUTH_PASSWORD)
  await page.getByRole('button', { name: 'Sign in' }).click()
  await expect(page).toHaveURL(/\/team\/tasks/)
}

test.beforeEach(async ({ page }) => {
  await resetLocalDemo(page)
})

test('client sidebar exposes mature Client Control Center destinations only', async ({ page }) => {
  await signInAsClient(page)

  const primaryNav = page.getByRole('list', { name: 'Primary navigation' })
  const expectedLinks = [
    ['Overview', '/client/overview'],
    ['Action Needed', '/client/action-needed'],
    ['Executive', '/client/executive-performance'],
    ['Reports', '/client/reports-dashboards'],
    ['Requests', '/client/requests'],
  ]

  for (const [label, href] of expectedLinks) {
    await expect(primaryNav.getByRole('link', { exact: true, name: label })).toHaveAttribute('href', href)
  }

  await primaryNav.getByRole('button', { exact: true, name: 'Performance' }).click()
  await expect(primaryNav.getByRole('link', { exact: true, name: 'Acquisition' })).toHaveAttribute('href', '/client/patient-acquisition')
  await expect(primaryNav.getByRole('link', { exact: true, name: 'Calls' })).toHaveAttribute('href', '/client/calls-bookings')
  await expect(primaryNav.getByRole('link', { exact: true, name: 'Services' })).toHaveAttribute('href', '/client/service-lines')
  await expect(primaryNav.getByRole('link', { exact: true, name: 'Reputation' })).toHaveAttribute('href', '/client/reputation')
  await primaryNav.getByRole('button', { exact: true, name: 'Resources' }).click()
  await expect(primaryNav.getByRole('link', { exact: true, name: 'Compliance' })).toHaveAttribute('href', '/client/compliance-approvals')
  await expect(primaryNav.getByRole('link', { exact: true, name: 'Files' })).toHaveAttribute('href', '/client/files-links')
  await expect(primaryNav.getByRole('link', { exact: true, name: 'Updates' })).toHaveAttribute('href', '/client/updates')
  await expect(primaryNav.getByRole('link', { exact: true, name: 'Projects' })).toHaveCount(0)
  await expect(primaryNav.getByRole('link', { exact: true, name: 'Dashboard' })).toHaveCount(0)
  await expect(primaryNav.getByRole('link', { exact: true, name: 'Monthly Strategy' })).toHaveCount(0)
  await expect(primaryNav.getByRole('link', { exact: true, name: 'Daily Operations' })).toHaveCount(0)
  await expect(primaryNav.getByRole('link', { exact: true, name: 'Settings' })).toHaveCount(0)
  await expect(page.getByRole('link', { exact: true, name: 'Settings' })).toHaveAttribute('href', '/client/settings')
  await expect(page.getByText('Contact', { exact: true })).toBeVisible()
  await expect(page.getByRole('link', { name: 'Ask a question' })).toHaveAttribute(
    'href',
    `/client/requests?clientId=${SEED_IDS.CLIENT_GREEN_DENTAL}`,
  )
})

test('client user cannot open admin Client Control Center workspaces', async ({ page }) => {
  await signInAsClient(page)
  await page.goto(`/admin/client-updates?clientId=${SEED_IDS.CLIENT_GREEN_DENTAL}`)

  await expect(page).toHaveURL(/\/access-denied/)
  await expect(page.getByRole('heading', { name: 'Access denied' })).toBeVisible()
  await expect(page.getByRole('link', { name: 'Return to home' })).toHaveAttribute(
    'href',
    `/client/overview?clientId=${SEED_IDS.CLIENT_GREEN_DENTAL}`,
  )
})

test('agency admin preview link opens the matching published client surface', async ({ page }) => {
  await signInAsAdmin(page)
  await page.goto(`/admin/client-files-links?clientId=${SEED_IDS.CLIENT_GREEN_DENTAL}`, { waitUntil: 'domcontentloaded' })

  const previewLink = page.getByRole('link', { name: /Preview published client page/ })

  await expect(previewLink).toHaveAttribute(
    'href',
    `/admin/client-files-links-preview?clientId=${SEED_IDS.CLIENT_GREEN_DENTAL}`,
  )

  await previewLink.click()

  await expect(page).toHaveURL(/\/admin\/client-files-links-preview/)
  await expect(page.locator('h1').getByText('Files & Links')).toBeVisible()
  await expect(page.getByRole('button', { name: /Deliverables 1/ })).toBeVisible()
  await expect(page.getByRole('button', { name: /Archived 1/ })).toBeVisible()
})

test('client settings owns account context without agency admin controls', async ({ page }) => {
  const updatedName = `Green Dental Owner ${Date.now()}`
  const updatedEmail = `client.${Date.now()}@greendental.example`

  await signInAsClient(page)
  await page.goto(`/client/settings?clientId=${SEED_IDS.CLIENT_GREEN_DENTAL}`, { waitUntil: 'domcontentloaded' })

  await expect(page.locator('h1').getByText('Settings')).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Profile' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Company' })).toBeVisible()
  await expect(page.getByLabel('Name')).toHaveValue('Green Dental Client')
  await expect(page.getByLabel('Email')).toHaveValue('client@greendental.example')
  await page.getByLabel('Name').fill(updatedName)
  await page.getByLabel('Email').fill(updatedEmail)
  await page.getByRole('button', { name: 'Save profile' }).click()
  await expect(page.getByText('Saved', { exact: true })).toBeVisible()
  await expect.poll(async () => page.evaluate(({ portalKey, userId }) => {
    const portalData = JSON.parse(window.localStorage.getItem(portalKey))
    const profile = portalData.profiles.find((item) => item.user_id === userId)

    return {
      email: profile?.email,
      name: profile?.name,
    }
  }, {
    portalKey: PORTAL_STORAGE_KEY,
    userId: SEED_IDS.USER_CLIENT_GREEN,
  })).toEqual({
    email: updatedEmail,
    name: updatedName,
  })
  await expect(page.locator('[id^="PropertyGrid"]').filter({ hasText: 'Green Dental Clinic' })).toBeVisible()
  await expect(page.locator('[id^="PropertyGrid"]').filter({ hasText: 'sarah@greendental.example' })).toBeVisible()
  await page.getByRole('link', { name: 'Team' }).click()
  await expect(page.getByRole('heading', { name: 'Team Members' })).toBeVisible()
  await page.getByRole('link', { name: 'Notifications' }).click()
  await expect(page.getByText('Notification Settings', { exact: true })).toBeVisible()
  await page.getByRole('link', { name: 'Security' }).click()
  await expect(page.getByText('Security and Authorization', { exact: true })).toBeVisible()
  await expect(page.getByRole('link', { name: 'New Client' })).toHaveCount(0)
  await expect(page.getByRole('button', { name: /Publish|Archive|Invite/i })).toHaveCount(0)
})

test('client can approve an action without mutating linked internal task status', async ({ page }) => {
  await signInAsClient(page)
  await page.goto(`/client/action-needed?clientId=${SEED_IDS.CLIENT_GREEN_DENTAL}`, { waitUntil: 'domcontentloaded' })

  const actionCard = page.locator('article').filter({ hasText: 'Approve creative batch #2' })

  await expect(actionCard).toBeVisible()
  await actionCard.getByRole('button', { name: 'View details' }).click()

  const dialog = page.getByRole('dialog')

  await expect(dialog.getByRole('heading', { name: 'Approve creative batch #2' })).toBeVisible()
  await dialog.getByLabel('Response').fill('Approved for launch.')
  await dialog.getByRole('button', { name: 'Approve' }).click()

  await page.getByRole('button', { name: /Approved/ }).click()

  const approvedCard = page.locator('article').filter({ hasText: 'Approve creative batch #2' })

  await expect(approvedCard).toBeVisible()
  await expect(approvedCard.getByText('Your response')).toBeVisible()
  await expect(approvedCard.getByText('Approved for launch.')).toBeVisible()

  const persistedState = await page.evaluate(({ actionId, portalKey, taskId }) => {
    const portalData = JSON.parse(window.localStorage.getItem(portalKey))
    const action = portalData.needed_from_client.find((item) => item.id === actionId)
    const task = portalData.tasks.find((item) => item.id === taskId)

    return {
      actionStatus: action?.status,
      taskStatus: task?.status,
    }
  }, {
    actionId: SEED_IDS.NEEDED_CREATIVE_APPROVAL,
    portalKey: PORTAL_STORAGE_KEY,
    taskId: SEED_IDS.TASK_REVIEW_CREATIVES,
  })

  expect(persistedState).toEqual({
    actionStatus: NEEDED_ACTION_STATUSES.APPROVED,
    taskStatus: TASK_STATUSES.WAITING_CLIENT,
  })
})

test('team prepared summaries stay hidden until admin publishes client work', async ({ page }) => {
  const summary = `E2E team prepared client summary ${Date.now()}`
  const taskId = '91919191-9191-4919-8919-919191919191'
  const taskTitle = `E2E unlinked client work ${Date.now()}`

  await signInAsTeam(page)
  await page.evaluate(({ clientId, portalKey, projectId, taskId, taskTitle }) => {
    const portalData = JSON.parse(window.localStorage.getItem(portalKey))

    portalData.tasks.push({
      assignee_name: 'Mia Carter',
      client_id: clientId,
      client_safe_summary: '',
      client_visible: false,
      created_at: '2026-05-18T10:00:00.000Z',
      description: 'E2E task starts as internal execution work only.',
      due_date: '2026-05-25',
      id: taskId,
      internal_note: 'E2E private task note must never reach the client.',
      project_id: projectId,
      sort_order: 77,
      status: 'in_progress',
      title: taskTitle,
      updated_at: '2026-05-18T10:00:00.000Z',
      visibility: 'internal',
    })

    window.localStorage.setItem(portalKey, JSON.stringify(portalData))
  }, {
    clientId: SEED_IDS.CLIENT_GREEN_DENTAL,
    portalKey: PORTAL_STORAGE_KEY,
    projectId: SEED_IDS.PROJECT_REPORTING,
    taskId,
    taskTitle,
  })

  await page.goto(`/team/tasks?clientId=${SEED_IDS.CLIENT_GREEN_DENTAL}`, { waitUntil: 'domcontentloaded' })

  const taskRow = page.locator('article').filter({ hasText: taskTitle }).first()

  await expect(taskRow).toBeVisible()
  await taskRow.getByRole('button').first().click()
  await page.getByLabel('Client-safe update').fill(summary)
  await page.getByRole('button', { name: 'Save Updates' }).evaluate((button) => button.click())
  await expect.poll(async () => page.evaluate(({ portalKey, taskId }) => {
    const portalData = JSON.parse(window.localStorage.getItem(portalKey))
    return portalData.tasks.find((item) => item.id === taskId)?.client_safe_summary
  }, {
    portalKey: PORTAL_STORAGE_KEY,
    taskId,
  })).toBe(summary)
  await expect(page.getByRole('button', { name: 'Send to Review' })).toBeEnabled()
  await page.getByRole('button', { name: 'Send to Review' }).click()
  await expect(page.getByText('Sent to admin review.')).toBeVisible()

  const preparedState = await page.evaluate(({ portalKey, taskId }) => {
    const portalData = JSON.parse(window.localStorage.getItem(portalKey))
    const task = portalData.tasks.find((item) => item.id === taskId)
    const workItem = portalData.client_work_items.find((item) => item.source_task_id === taskId)

    return {
      taskSummary: task?.client_safe_summary,
      workItemId: workItem?.id,
      workItemPublishState: workItem?.publish_state,
      workItemSummary: workItem?.summary,
    }
  }, {
    portalKey: PORTAL_STORAGE_KEY,
    taskId,
  })

  expect(preparedState).toMatchObject({
    taskSummary: summary,
    workItemPublishState: CLIENT_WORK_ITEM_PUBLISH_STATES.READY_FOR_REVIEW,
    workItemSummary: summary,
  })
  expect(preparedState.workItemId).toBeTruthy()

  await signInAsClient(page)
  await page.goto(`/client/projects?clientId=${SEED_IDS.CLIENT_GREEN_DENTAL}&projectId=${SEED_IDS.PROJECT_REPORTING}&filter=all`, { waitUntil: 'domcontentloaded' })
  await expect(page.getByText(summary)).toHaveCount(0)
  await expect(page.getByText(taskTitle)).toHaveCount(0)

  await signInAsAdmin(page)
  await page.goto(`/admin/client-work-review?clientId=${SEED_IDS.CLIENT_GREEN_DENTAL}`, { waitUntil: 'domcontentloaded' })

  const reviewItem = page.getByTestId(`client-work-review-${preparedState.workItemId}`)

  await expect(reviewItem).toBeVisible()
  await reviewItem.getByRole('button', { name: 'Publish' }).click()
  await expect(page.getByText('Published to client portal', { exact: true })).toBeVisible()
  await expect.poll(async () => page.evaluate(({ portalKey, taskId }) => {
    const portalData = JSON.parse(window.localStorage.getItem(portalKey))
    return portalData.client_work_items.find((item) => item.source_task_id === taskId)?.publish_state
  }, {
    portalKey: PORTAL_STORAGE_KEY,
    taskId,
  })).toBe(CLIENT_WORK_ITEM_PUBLISH_STATES.PUBLISHED)

  await signInAsClient(page)
  await page.goto(`/client/projects?clientId=${SEED_IDS.CLIENT_GREEN_DENTAL}&projectId=${SEED_IDS.PROJECT_REPORTING}&filter=all`, { waitUntil: 'domcontentloaded' })
  await expect(page.getByText(taskTitle)).toBeVisible()
  await expect(page.getByText(summary)).toBeVisible()
  await expect(page.getByText('E2E private task note must never reach the client.')).toHaveCount(0)

  const publishedState = await page.evaluate(({ portalKey, taskId }) => {
    const portalData = JSON.parse(window.localStorage.getItem(portalKey))
    const workItem = portalData.client_work_items.find((item) => item.source_task_id === taskId)

    return {
      publishState: workItem?.publish_state,
      summary: workItem?.summary,
    }
  }, {
    portalKey: PORTAL_STORAGE_KEY,
    taskId,
  })

  expect(publishedState).toEqual({
    publishState: CLIENT_WORK_ITEM_PUBLISH_STATES.PUBLISHED,
    summary,
  })
})

test('client can inspect project detail without internal work noise', async ({ page }) => {
  await signInAsClient(page)
  await page.goto(`/client/projects?clientId=${SEED_IDS.CLIENT_GREEN_DENTAL}`, { waitUntil: 'domcontentloaded' })

  await expect(page.locator('h1').getByText('Projects')).toBeVisible()
  await expect(page.getByRole('link', { name: /Active/ })).toBeVisible()
  await expect(page.getByText('Campaign Setup').first()).toBeVisible()

  await page.locator('article').filter({ hasText: 'Campaign Setup' }).first().getByRole('link', { name: 'View project' }).click()
  await expect(page).toHaveURL(/projectId=/)
  await expect(page.getByText('Campaign Setup').first()).toBeVisible()

  await expect(page.getByRole('heading', { name: 'Milestones' })).toBeVisible()
  await expect(page.getByText('Kickoff')).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Client-relevant blockers' })).toBeVisible()
  await expect(page.getByText('Approve creative batch #2').first()).toBeVisible()
  await expect(page.getByText('Action needed: Approve creative batch #2').first()).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Related results' })).toBeVisible()
  await expect(page.getByRole('link', { name: /Marketing Performance Dashboard/ })).toBeVisible()
  await expect(page.getByRole('link', { name: /April 2026 Monthly Summary/ })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Project update history' })).toBeVisible()
  await expect(page.getByText('Creative batch prepared for launch')).toBeVisible()
  await expect(page.getByText('Internal tracking note')).toHaveCount(0)
})
