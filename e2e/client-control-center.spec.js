import { expect, test } from '@playwright/test'

import { PORTAL_STORAGE_KEY } from '../src/app/providers/repositories/createLocalStoragePortalRepository.js'
import { SEED_IDS } from '../src/app/providers/repositories/portalSeedData.js'
import { AUTH_SESSION_STORAGE_KEY, DEMO_AUTH_PASSWORD } from '../src/domain/services/authService.js'

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

async function signInAsClient(page) {
  await page.evaluate((authKey) => {
    window.localStorage.removeItem(authKey)
  }, AUTH_SESSION_STORAGE_KEY)
  await page.goto('/login')
  await page.locator('input[name="email"]').fill(CLIENT_EMAIL)
  await page.locator('input[name="password"]').fill(DEMO_AUTH_PASSWORD)
  await page.getByRole('button', { name: 'Sign in' }).click()
  await expect(page).toHaveURL(/\/client\/overview/)
}

test.beforeEach(async ({ page }) => {
  await resetLocalDemo(page)
})

test('client sidebar exposes mature Client Control Center destinations only', async ({ page }) => {
  await signInAsClient(page)

  const primaryNav = page.getByRole('navigation', { name: 'Primary navigation' })
  const expectedLinks = [
    ['Overview', '/client/overview'],
    ['Action Needed', '/client/action-needed'],
    ['Projects', '/client/projects'],
    ['Reports & Dashboards', '/client/reports-dashboards'],
    ['Files & Links', '/client/files-links'],
    ['Requests', '/client/requests'],
    ['Updates', '/client/updates'],
    ['Settings', '/client/settings'],
  ]

  for (const [label, href] of expectedLinks) {
    await expect(primaryNav.getByRole('link', { exact: true, name: label })).toHaveAttribute('href', href)
  }

  await expect(primaryNav.getByRole('link', { exact: true, name: 'Dashboard' })).toHaveCount(0)
  await expect(primaryNav.getByRole('link', { exact: true, name: 'Performance' })).toHaveCount(0)
  await expect(primaryNav.getByRole('link', { exact: true, name: 'Reports' })).toHaveCount(0)
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
