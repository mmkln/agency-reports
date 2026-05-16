import { expect, test } from '@playwright/test'

import { PORTAL_STORAGE_KEY } from '../src/app/providers/repositories/createLocalStoragePortalRepository.js'
import { SEED_IDS } from '../src/app/providers/repositories/portalSeedData.js'
import { AUTH_SESSION_STORAGE_KEY } from '../src/domain/services/authService.js'

const DEMO_ROLE_KEY = 'agency-reports.demo-role'

async function resetLocalDemo(page) {
  await page.goto('/')
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

async function signInAsAdmin(page) {
  await page.goto('/')
  await page.evaluate(({ authKey, adminUserId }) => {
    window.localStorage.setItem(authKey, JSON.stringify({
      expiresAt: new Date(Date.now() + 1000 * 60 * 60).toISOString(),
      userId: adminUserId,
    }))
  }, {
    adminUserId: SEED_IDS.USER_ADMIN_GROWTHLAB,
    authKey: AUTH_SESSION_STORAGE_KEY,
  })
  await page.goto('/admin/clients')
  await expect(page).toHaveURL(/\/admin\/clients/)
}

test.beforeEach(async ({ page }) => {
  await resetLocalDemo(page)
})

test('agency admin imports Markdown tasks into a client workspace', async ({ page }) => {
  const suffix = Date.now()
  const firstTask = `E2E imported tracking QA ${suffix}`
  const secondTask = `E2E imported launch checklist ${suffix}`

  await signInAsAdmin(page)
  await page.goto(`/admin/tasks?clientId=${SEED_IDS.CLIENT_GREEN_DENTAL}`)
  await expect(page.getByRole('heading', { name: 'Green Dental Clinic' })).toBeVisible()

  await page.getByRole('link', { name: 'Import Markdown' }).click()
  const dialog = page.getByRole('dialog', { name: 'Import task Markdown' })
  await expect(dialog).toBeVisible()
  await dialog.getByRole('textbox', { name: 'Task Markdown' }).fill(`
## In Progress
- [ ] ${firstTask}

## Done
- [x] ${secondTask}`)
  await dialog.getByRole('button', { name: 'Preview' }).click()
  await expect(dialog.getByText('Preview is ready.')).toBeVisible()
  await expect(dialog.locator('p').filter({ hasText: firstTask })).toBeVisible()
  await expect(dialog.locator('p').filter({ hasText: secondTask })).toBeVisible()

  await dialog.getByRole('button', { name: 'Create Tasks' }).click()
  await expect(page.getByText('Tasks imported', { exact: true }).first()).toBeVisible()
  await expect(page.getByRole('heading', { name: firstTask })).toBeVisible()
  await expect(page.getByRole('heading', { name: secondTask })).toBeVisible()

  const importedTasks = await page.evaluate(({ portalKey, titles }) => {
    const portalData = JSON.parse(window.localStorage.getItem(portalKey))

    return portalData.tasks.filter((task) => titles.includes(task.title))
  }, {
    portalKey: PORTAL_STORAGE_KEY,
    titles: [firstTask, secondTask],
  })

  expect(importedTasks).toEqual(expect.arrayContaining([
    expect.objectContaining({
      client_id: SEED_IDS.CLIENT_GREEN_DENTAL,
      status: 'in_progress',
      title: firstTask,
      visibility: 'internal',
    }),
    expect.objectContaining({
      client_id: SEED_IDS.CLIENT_GREEN_DENTAL,
      status: 'done',
      title: secondTask,
      visibility: 'internal',
    }),
  ]))
})

test('agency admin exports current task results as Markdown', async ({ page }) => {
  await signInAsAdmin(page)
  await page.goto(`/admin/tasks?clientId=${SEED_IDS.CLIENT_GREEN_DENTAL}`)
  await expect(page.getByRole('heading', { name: 'Green Dental Clinic' })).toBeVisible()

  await page.getByRole('link', { name: 'Export Markdown' }).click()
  const dialog = page.getByRole('dialog', { name: 'Export task Markdown' })
  await expect(dialog).toBeVisible()
  const exportedMarkdown = await dialog.getByRole('textbox', { name: 'Task Markdown' }).inputValue()

  expect(exportedMarkdown).toContain('# Green Dental Clinic Tasks')
  expect(exportedMarkdown).toContain('## In Progress')
  expect(exportedMarkdown).toContain('- [ ] Connect GA4 conversion event')
  expect(exportedMarkdown).toContain('## Waiting Client')
  expect(exportedMarkdown).toContain('## Blocked')
})
