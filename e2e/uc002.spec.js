import { expect, test } from '@playwright/test'

import { PORTAL_STORAGE_KEY } from '../src/app/providers/repositories/createLocalStoragePortalRepository.js'
import { SEED_IDS } from '../src/app/providers/repositories/portalSeedData.js'
import { AUTH_SESSION_STORAGE_KEY, DEMO_AUTH_PASSWORD } from '../src/domain/services/authService.js'

const ADMIN_EMAIL = 'admin@growthlab.example'
const CLIENT_EMAIL = 'client@greendental.example'
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

async function clearAuthSession(page) {
  await page.evaluate((authKey) => {
    window.localStorage.removeItem(authKey)
  }, AUTH_SESSION_STORAGE_KEY)
}

async function signIn(page, email) {
  await clearAuthSession(page)
  await page.goto('/login')
  await expect(page.getByRole('heading', { name: 'Sign in to your account' })).toBeVisible()
  await page.locator('input[name="email"]').fill(email)
  await page.locator('input[name="password"]').fill(DEMO_AUTH_PASSWORD)
  await page.getByRole('button', { name: 'Sign in' }).click()
}

async function signInAsAdmin(page) {
  await signIn(page, ADMIN_EMAIL)
  await expect(page).toHaveURL(/\/admin\/clients/)
}

async function signInAsClient(page) {
  await signIn(page, CLIENT_EMAIL)
  await expect(page).toHaveURL(/\/client\/overview/)
}

test.beforeEach(async ({ page }) => {
  await resetLocalDemo(page)
})

test('agency admin can add a dashboard link in a modal and preview it', async ({ page }) => {
  const dashboardName = `E2E Marketing Dashboard ${Date.now()}`

  await signInAsAdmin(page)
  await page.goto('/admin/dashboard-links')
  await expect(page.getByRole('heading', { name: 'Dashboard Links' })).toBeVisible()

  await page.getByRole('link', { name: 'New Dashboard' }).click()
  await expect(page.getByRole('dialog', { name: 'Add dashboard link' })).toBeVisible()

  await page.getByLabel('Dashboard name *').fill(dashboardName)
  await page.getByLabel('Status *').click()
  await page.getByRole('option', { name: 'Active' }).click()
  await page.getByLabel('Embed URL').fill('https://example.com/embed-dashboard')
  await page.getByLabel('Public URL').fill('https://example.com/full-dashboard')
  await page.getByLabel('Description').fill('E2E dashboard description')
  await page.getByRole('button', { name: 'Create dashboard' }).click()

  await expect(page.getByText('Dashboard saved', { exact: true }).first()).toBeVisible()
  const dashboardRow = page.getByRole('row').filter({ hasText: dashboardName })
  await expect(dashboardRow).toBeVisible()
  await expect(dashboardRow).toContainText('Active')
  await expect(dashboardRow).toContainText('Client visible')

  await dashboardRow.getByRole('link', { name: 'Preview' }).click()
  await expect(page).toHaveURL(/\/admin\/client-dashboard-preview/)
  await expect(page.getByRole('heading', { exact: true, name: 'Marketing Dashboard' })).toBeVisible()
  await expect(page.getByRole('heading', { name: dashboardName })).toBeVisible()
  await expect(page.getByText('E2E dashboard description')).toBeVisible()
})

test('client can open their active dashboard and cannot open another client dashboard', async ({ page }) => {
  await signInAsClient(page)
  await page.goto(`/client/dashboard?clientId=${SEED_IDS.CLIENT_GREEN_DENTAL}&dashboardId=${SEED_IDS.DASHBOARD_GREEN_APRIL}`)

  await expect(page.getByRole('heading', { name: 'Marketing Dashboard' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Marketing Performance Dashboard' })).toBeVisible()
  await expect(page.getByRole('link', { name: 'Latest summary' })).toBeVisible()
  await expect(page.getByTitle('Marketing Performance Dashboard')).toBeVisible()

  await page.goto(`/client/dashboard?clientId=${SEED_IDS.CLIENT_NORTHSTAR_DENTAL}&dashboardId=${SEED_IDS.DASHBOARD_GREEN_APRIL}`)

  await expect(page.getByRole('heading', { name: 'Access denied' }).nth(1)).toBeVisible()
  await expect(page.getByText('You do not have permission to view this client portal.')).toBeVisible()
})

test('unavailable dashboard shows a controlled client fallback', async ({ page }) => {
  await signInAsAdmin(page)
  await page.goto('/admin/dashboard-links')

  const dashboardRow = page.getByRole('row').filter({ hasText: 'Marketing Performance Dashboard' })
  await dashboardRow.getByLabel('Dashboard actions').click()
  await page.getByRole('menuitem', { name: 'Set Unavailable' }).click()
  await expect(page.getByText('Dashboard status updated', { exact: true }).first()).toBeVisible()

  await signInAsClient(page)
  await page.goto(`/client/dashboard?clientId=${SEED_IDS.CLIENT_GREEN_DENTAL}&dashboardId=${SEED_IDS.DASHBOARD_GREEN_APRIL}`)

  await expect(page.getByRole('heading', { name: 'Dashboard is temporarily unavailable' })).toBeVisible()
  await expect(page.getByText('Marketing dashboard is being prepared.')).toBeVisible()
  await expect(page.getByRole('link', { name: 'Open full dashboard' }).first()).toBeVisible()
})
