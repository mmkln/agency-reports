import { expect, test } from '@playwright/test'

import { PORTAL_STORAGE_KEY } from '../src/app/providers/repositories/createLocalStoragePortalRepository.js'
import { SEED_IDS } from '../src/app/providers/repositories/portalSeedData.js'
import { AUTH_SESSION_STORAGE_KEY, DEMO_AUTH_PASSWORD } from '../src/domain/services/authService.js'
import { CLIENT_WORK_ITEM_PUBLISH_STATES } from '../src/entities/client-work-item/index.js'
import { CLIENT_TYPES } from '../src/entities/client/index.js'
import { NEEDED_ACTION_STATUSES } from '../src/entities/needed-from-client/index.js'
import { TASK_STATUSES } from '../src/entities/task/index.js'

test.setTimeout(120_000)

const ADMIN_EMAIL = 'admin@growthlab.example'
const CLIENT_EMAIL = 'client@greendental.example'
const CLIENT_TEAM_EMAIL = 'ops@greendental.example'
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

async function signInAsClientTeam(page) {
  await page.evaluate(({ authKey, demoRoleKey }) => {
    window.localStorage.removeItem(authKey)
    window.localStorage.setItem(demoRoleKey, 'frontdesk')
  }, {
    authKey: AUTH_SESSION_STORAGE_KEY,
    demoRoleKey: DEMO_ROLE_KEY,
  })
  await page.goto('/login', { waitUntil: 'domcontentloaded' })
  await page.locator('input[name="email"]').fill(CLIENT_TEAM_EMAIL)
  await page.locator('input[name="password"]').fill(DEMO_AUTH_PASSWORD)
  await page.getByRole('button', { name: 'Sign in' }).click()
  await expect(page).toHaveURL(/\/clinic\/daily-ops/)
}

async function updateProfileFromAccountSettings(page, { email, name, userId }) {
  await page.getByRole('button', { name: 'Open account menu' }).click()
  await page.getByRole('menuitem', { name: 'Account settings' }).click()
  await expect(page).toHaveURL(/\/account\/settings/)
  await expect(page.locator('h1').getByText('Account Settings')).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Profile' })).toBeVisible()
  const nameField = page.getByRole('textbox', { exact: true, name: 'Name' })
  const emailField = page.getByRole('textbox', { exact: true, name: 'Email' })
  const saveButton = page.getByRole('button', { name: 'Save profile' })

  await expect(nameField).toHaveValue(/\S/)
  await expect(emailField).toHaveValue(/\S+@\S+/)
  await nameField.fill(name)
  await emailField.fill(email)
  await expect(nameField).toHaveValue(name)
  await expect(emailField).toHaveValue(email)
  await expect(saveButton).toBeEnabled()
  await saveButton.click()
  await expect(page.getByText('Saved', { exact: true })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Open account menu' })).toHaveAttribute('title', new RegExp(name))
  await expect.poll(async () => page.evaluate(({ portalKey, userId: targetUserId }) => {
    const portalData = JSON.parse(window.localStorage.getItem(portalKey))
    const profile = portalData.profiles.find((item) => item.user_id === targetUserId)

    return {
      email: profile?.email,
      name: profile?.name,
    }
  }, {
    portalKey: PORTAL_STORAGE_KEY,
    userId,
  })).toEqual({
    email,
    name,
  })
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

test('client user cannot open clinic-only routes for a generic client', async ({ page }) => {
  await signInAsClient(page)
  await page.evaluate(({ clientId, clientTypes, portalKey }) => {
    const portalData = JSON.parse(window.localStorage.getItem(portalKey))
    const client = portalData.clients.find((item) => item.id === clientId)

    client.type = clientTypes.GENERIC
    window.localStorage.setItem(portalKey, JSON.stringify(portalData))
  }, {
    clientId: SEED_IDS.CLIENT_GREEN_DENTAL,
    clientTypes: CLIENT_TYPES,
    portalKey: PORTAL_STORAGE_KEY,
  })

  await page.goto(`/client/executive-performance?clientId=${SEED_IDS.CLIENT_GREEN_DENTAL}`, { waitUntil: 'domcontentloaded' })

  await expect(page).toHaveURL(/\/access-denied/)
  await expect(page.getByRole('heading', { name: 'Access denied' })).toBeVisible()
})

test('agency admin preview link opens the matching published client surface', async ({ page }) => {
  await signInAsAdmin(page)
  await page.goto(`/admin/client-files-links?clientId=${SEED_IDS.CLIENT_GREEN_DENTAL}`, { waitUntil: 'domcontentloaded' })

  const previewLink = page.getByRole('link', { name: /Preview published portal page/ })

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

test('account settings owns user profile for client users', async ({ page }) => {
  const updatedName = `Green Dental Owner ${Date.now()}`
  const updatedEmail = `client.${Date.now()}@greendental.example`

  await signInAsClient(page)
  await page.goto('/account/settings', { waitUntil: 'domcontentloaded' })

  await expect(page.locator('h1').getByText('Account Settings')).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Profile' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Appearance' })).toBeVisible()
  await expect(page.getByRole('textbox', { exact: true, name: 'Name' })).toHaveValue('Green Dental Client')
  await expect(page.getByRole('textbox', { exact: true, name: 'Email' })).toHaveValue('client@greendental.example')
  await page.getByRole('textbox', { exact: true, name: 'Name' }).fill(updatedName)
  await page.getByRole('textbox', { exact: true, name: 'Email' }).fill(updatedEmail)
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
  await expect(page.getByRole('heading', { name: 'Company' })).toHaveCount(0)
  await expect(page.getByRole('heading', { name: 'Team Members' })).toHaveCount(0)
})

test('client settings owns workspace context without profile or agency admin controls', async ({ page }) => {
  await signInAsClient(page)
  await page.goto(`/client/settings?clientId=${SEED_IDS.CLIENT_GREEN_DENTAL}`, { waitUntil: 'domcontentloaded' })

  await expect(page.locator('h1').getByText('Settings')).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Profile' })).toHaveCount(0)
  await expect(page.getByRole('heading', { name: 'Company' })).toBeVisible()
  await expect(page.locator('[id^="PropertyGrid"]').filter({ hasText: 'Green Dental Clinic' })).toBeVisible()
  await expect(page.locator('[id^="PropertyGrid"]').filter({ hasText: 'sarah@greendental.example' })).toBeVisible()
  await page.getByRole('link', { name: 'Team' }).click()
  await expect(page.getByRole('heading', { name: 'Team Members' })).toBeVisible()
  await expect(page.getByRole('link', { name: 'Notifications' })).toHaveCount(0)
  await page.getByRole('link', { name: 'Access' }).click()
  await expect(page.getByRole('heading', { name: 'Access' })).toBeVisible()
  await expect(page.getByRole('link', { name: 'New Account' })).toHaveCount(0)
  await expect(page.getByRole('button', { name: /Publish|Archive|Invite/i })).toHaveCount(0)
})

test('client team member can leave a workspace from access settings', async ({ page }) => {
  await signInAsClientTeam(page)
  const sessionUserId = await page.evaluate(({ authKey }) => (
    JSON.parse(window.localStorage.getItem(authKey))?.userId
  ), {
    authKey: AUTH_SESSION_STORAGE_KEY,
  })

  await page.goto(`/client/settings?clientId=${SEED_IDS.CLIENT_GREEN_DENTAL}&section=access`, { waitUntil: 'domcontentloaded' })

  await expect(page.getByRole('heading', { name: 'Access' })).toBeVisible()
  await page.getByRole('button', { name: 'Leave workspace' }).click()
  const dialog = page.getByRole('dialog', { name: 'Leave this workspace?' })

  await expect(dialog).toBeVisible()
  await dialog.getByRole('button', { name: 'Leave workspace' }).click()
  await expect(page).toHaveURL(/\/access-denied/)
  await expect.poll(async () => page.evaluate(({ portalKey, userId }) => {
    const portalData = JSON.parse(window.localStorage.getItem(portalKey))
    const membership = portalData.client_memberships.find((item) => item.user_id === userId)

    return membership?.status
  }, {
    portalKey: PORTAL_STORAGE_KEY,
    userId: sessionUserId,
  })).toBe('removed')
})

test('client admin can request business deletion for agency review', async ({ page }) => {
  await signInAsClient(page)
  await page.goto(`/client/settings?clientId=${SEED_IDS.CLIENT_GREEN_DENTAL}&section=access`, { waitUntil: 'domcontentloaded' })

  await expect(page.getByRole('heading', { name: 'Access' })).toBeVisible()
  await page.getByRole('button', { name: 'Request deletion' }).evaluate((button) => button.click())
  const dialog = page.getByRole('dialog', { name: 'Request business deletion?' })

  await expect(dialog).toBeVisible()
  await dialog.getByRole('button', { name: 'Submit request' }).click()
  await expect(page.getByText('Deletion request submitted', { exact: true })).toBeVisible()

  const deletionRequestTitle = await page.evaluate(({ clientId, portalKey }) => {
    const portalData = JSON.parse(window.localStorage.getItem(portalKey))
    const request = portalData.client_requests.find((item) => (
      item.client_id === clientId
      && item.request_type === 'business_deletion'
    ))

    return request?.title
  }, {
    clientId: SEED_IDS.CLIENT_GREEN_DENTAL,
    portalKey: PORTAL_STORAGE_KEY,
  })

  expect(deletionRequestTitle).toBe('Business deletion request - Green Dental Clinic')

  await signInAsAdmin(page)
  await page.goto(`/admin/client-submitted-requests?clientId=${SEED_IDS.CLIENT_GREEN_DENTAL}`, { waitUntil: 'domcontentloaded' })

  await expect(page.getByText('Business deletion request - Green Dental Clinic')).toBeVisible()
  await expect(page.getByText('Business deletion', { exact: true })).toBeVisible()
})

test('user can deactivate own account and cannot sign in again', async ({ page }) => {
  await signInAsClientTeam(page)
  await page.goto('/account/settings', { waitUntil: 'domcontentloaded' })

  await expect(page.locator('h1').getByText('Account Settings')).toBeVisible()
  await page.getByRole('button', { name: 'Deactivate account' }).focus()
  await page.keyboard.press('Enter')
  const dialog = page.getByRole('dialog', { name: 'Deactivate your account?' })

  await expect(dialog).toBeVisible()
  await dialog.getByRole('button', { name: 'Deactivate account' }).click()
  await expect(page).toHaveURL(/\/login/)
  await expect.poll(async () => page.evaluate(({ portalKey, userId }) => {
    const portalData = JSON.parse(window.localStorage.getItem(portalKey))
    const profile = portalData.profiles.find((item) => item.user_id === userId)

    return profile?.status
  }, {
    portalKey: PORTAL_STORAGE_KEY,
    userId: SEED_IDS.USER_CLIENT_TEAM_OPS_GREEN,
  })).toBe('inactive')

  await page.locator('input[name="email"]').fill(CLIENT_TEAM_EMAIL)
  await page.locator('input[name="password"]').fill(DEMO_AUTH_PASSWORD)
  await page.getByRole('button', { name: 'Sign in' }).click()
  await expect(page.getByRole('main').getByText('This account is inactive.')).toBeVisible()
})

test('user can change password and sign in with the new password', async ({ page }) => {
  const newPassword = `new-pass-${Date.now()}`

  await signInAsClientTeam(page)
  await page.goto('/account/settings', { waitUntil: 'domcontentloaded' })

  await expect(page.getByRole('heading', { name: 'Security' })).toBeVisible()
  await page.getByLabel('Current password').fill(DEMO_AUTH_PASSWORD)
  await page.getByLabel('New password', { exact: true }).fill(newPassword)
  await page.getByLabel('Confirm new password').fill(newPassword)
  await page.getByRole('button', { name: 'Change password' }).click()
  await expect(page.getByText('Saved', { exact: true })).toBeVisible()

  await page.evaluate(({ authKey }) => {
    window.localStorage.removeItem(authKey)
  }, {
    authKey: AUTH_SESSION_STORAGE_KEY,
  })
  await page.goto('/login', { waitUntil: 'domcontentloaded' })
  await page.locator('input[name="email"]').fill(CLIENT_TEAM_EMAIL)
  await page.locator('input[name="password"]').fill(DEMO_AUTH_PASSWORD)
  await page.getByRole('button', { name: 'Sign in' }).click()
  await expect(page.getByRole('main').getByText('Invalid password.')).toBeVisible()

  await page.locator('input[name="password"]').fill(newPassword)
  await page.getByRole('button', { name: 'Sign in' }).click()
  await expect(page).toHaveURL(/\/clinic\/daily-ops/)
})

test('user can save account notification preferences', async ({ page }) => {
  await signInAsClientTeam(page)
  await page.goto('/account/settings', { waitUntil: 'domcontentloaded' })

  await expect(page.getByRole('heading', { name: 'Notifications' })).toBeVisible()
  await expect(page.getByText('Sessions are not configured yet')).toHaveCount(0)
  await page.getByLabel('Weekly summary').click()
  await page.getByRole('button', { name: 'Save notifications' }).click()

  await expect.poll(async () => page.evaluate(({ portalKey, userId }) => {
    const portalData = JSON.parse(window.localStorage.getItem(portalKey))
    const profile = portalData.profiles.find((item) => item.user_id === userId)

    return profile?.notification_preferences
  }, {
    portalKey: PORTAL_STORAGE_KEY,
    userId: SEED_IDS.USER_CLIENT_TEAM_OPS_GREEN,
  })).toEqual({
    action_needed: true,
    email_updates: true,
    weekly_summary: true,
  })
})

test('account settings lets every portal role update their own profile', async ({ page }) => {
  await signInAsAdmin(page)
  await updateProfileFromAccountSettings(page, {
    email: `admin.${Date.now()}@growthlab.example`,
    name: `GrowthLab Admin ${Date.now()}`,
    userId: SEED_IDS.USER_ADMIN_GROWTHLAB,
  })

  await signInAsTeam(page)
  await updateProfileFromAccountSettings(page, {
    email: `mia.${Date.now()}@growthlab.example`,
    name: `Mia Carter ${Date.now()}`,
    userId: SEED_IDS.USER_TEAM_MIA,
  })

  await signInAsClient(page)
  await updateProfileFromAccountSettings(page, {
    email: `client.${Date.now()}@greendental.example`,
    name: `Green Dental Client ${Date.now()}`,
    userId: SEED_IDS.USER_CLIENT_GREEN,
  })

  await signInAsClientTeam(page)
  await updateProfileFromAccountSettings(page, {
    email: `ops.${Date.now()}@greendental.example`,
    name: `Green Dental Ops ${Date.now()}`,
    userId: SEED_IDS.USER_CLIENT_TEAM_OPS_GREEN,
  })
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

test('team prepared summaries stay internal until admin publishes review state', async ({ page }) => {
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
  await page.getByLabel('Portal-ready update').fill(summary)
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
  await expect(page).toHaveURL(/\/access-denied/)
  await expect(page.getByRole('heading', { name: 'Access denied' })).toBeVisible()
  await expect(page.getByText(summary)).toHaveCount(0)
  await expect(page.getByText(taskTitle)).toHaveCount(0)

  await signInAsAdmin(page)
  await page.goto(`/admin/client-work-review?clientId=${SEED_IDS.CLIENT_GREEN_DENTAL}`, { waitUntil: 'domcontentloaded' })

  const reviewItem = page.getByTestId(`client-work-review-${preparedState.workItemId}`)

  await expect(reviewItem).toBeVisible()
  await reviewItem.getByRole('button', { name: 'Publish' }).click()
  await expect(page.getByText('Published to portal', { exact: true })).toBeVisible()
  await expect.poll(async () => page.evaluate(({ portalKey, taskId }) => {
    const portalData = JSON.parse(window.localStorage.getItem(portalKey))
    return portalData.client_work_items.find((item) => item.source_task_id === taskId)?.publish_state
  }, {
    portalKey: PORTAL_STORAGE_KEY,
    taskId,
  })).toBe(CLIENT_WORK_ITEM_PUBLISH_STATES.PUBLISHED)

  await signInAsClient(page)
  await page.goto(`/client/projects?clientId=${SEED_IDS.CLIENT_GREEN_DENTAL}&projectId=${SEED_IDS.PROJECT_REPORTING}&filter=all`, { waitUntil: 'domcontentloaded' })
  await expect(page).toHaveURL(/\/access-denied/)
  await expect(page.getByRole('heading', { name: 'Access denied' })).toBeVisible()
  await expect(page.getByText(taskTitle)).toHaveCount(0)
  await expect(page.getByText(summary)).toHaveCount(0)
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

test('clinic client cannot open the generic project detail route', async ({ page }) => {
  await signInAsClient(page)
  await page.goto(`/client/projects?clientId=${SEED_IDS.CLIENT_GREEN_DENTAL}`, { waitUntil: 'domcontentloaded' })

  await expect(page).toHaveURL(/\/access-denied/)
  await expect(page.getByRole('heading', { name: 'Access denied' })).toBeVisible()
  await expect(page.getByText('Internal tracking note')).toHaveCount(0)
})
