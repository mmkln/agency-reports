import { expect, test } from '@playwright/test'

import { PORTAL_STORAGE_KEY } from '../src/app/providers/repositories/createLocalStoragePortalRepository.js'
import { SEED_IDS } from '../src/app/providers/repositories/portalSeedData.js'
import { AUTH_SESSION_STORAGE_KEY, DEMO_AUTH_PASSWORD } from '../src/domain/services/authService.js'

const ADMIN_EMAIL = 'admin@growthlab.example'
const DEMO_ROLE_KEY = 'agency-reports.demo-role'
const GREEN_DENTAL_CLIENT_ID = SEED_IDS.CLIENT_GREEN_DENTAL

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

function clientWorkspaceTabs(page) {
  return page.getByRole('navigation', { name: 'Client workspace sections' })
}

test.beforeEach(async ({ page }) => {
  await resetLocalDemo(page)
})

test('admin can manage clinic setup from the client workspace', async ({ page }) => {
  await signInAsAdmin(page)
  await page.goto(`/admin/clinic-setup?clientId=${GREEN_DENTAL_CLIENT_ID}`, { waitUntil: 'domcontentloaded' })

  await expect(page.locator('h1').getByText('Green Dental Clinic', { exact: true })).toBeVisible()

  for (const tabName of ['Clinic Setup', 'Clinic Metrics', 'Reputation', 'Compliance', 'Reports & Dashboards']) {
    await expect(clientWorkspaceTabs(page).getByRole('link', { name: tabName })).toBeVisible()
  }

  await expect(page.getByRole('heading', { name: 'Clinic Profile' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Locations' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Service Lines' })).toBeVisible()
  await expect(page.getByText('Do not enter patient-level identifiers here.')).toBeVisible()

  await page.getByLabel('Primary growth goal').fill('E2E increase booked implant and emergency appointments.')
  await page.getByRole('button', { name: 'Save clinic setup' }).click()
  await expect(page.getByText('Saved', { exact: true })).toBeVisible()

  const savedGoal = await page.evaluate(({ clientId, portalKey }) => {
    const portalData = JSON.parse(window.localStorage.getItem(portalKey))
    return portalData.clinic_profiles.find((profile) => profile.client_id === clientId)?.primary_goal
  }, {
    clientId: GREEN_DENTAL_CLIENT_ID,
    portalKey: PORTAL_STORAGE_KEY,
  })

  expect(savedGoal).toBe('E2E increase booked implant and emergency appointments.')
})

test('admin clinic metrics workspace manages aggregate records and client previews', async ({ page }) => {
  await signInAsAdmin(page)
  await page.goto(`/admin/clinic-metrics?clientId=${GREEN_DENTAL_CLIENT_ID}`, { waitUntil: 'domcontentloaded' })

  await expect(page.locator('h1').getByText('Green Dental Clinic', { exact: true })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Patient Acquisition Snapshots' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Calls & Bookings Snapshots' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Service Line Performance' })).toBeVisible()
  await expect(page.getByText('without storing PHI.')).toBeVisible()
  await expect(page.getByRole('button', { name: 'Save metrics' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Create missed-call action' }).first()).toBeVisible()

  await expect(page.getByRole('link', { name: 'Published acquisition' })).toHaveAttribute(
    'href',
    `/admin/client-patient-acquisition-preview?clientId=${GREEN_DENTAL_CLIENT_ID}`,
  )
  await expect(page.getByRole('link', { name: 'Draft calls' })).toHaveAttribute(
    'href',
    `/admin/client-calls-bookings-preview?clientId=${GREEN_DENTAL_CLIENT_ID}&preview=draft`,
  )
  await expect(page.getByRole('link', { name: 'Draft services' })).toHaveAttribute(
    'href',
    `/admin/client-service-lines-preview?clientId=${GREEN_DENTAL_CLIENT_ID}&preview=draft`,
  )

  await page.getByRole('link', { name: 'Draft calls' }).click()
  await expect(page).toHaveURL(/\/admin\/client-calls-bookings-preview/)
  await expect(page.locator('h1').getByText('Calls & Bookings', { exact: true })).toBeVisible()
})

test('admin reputation and compliance workspaces expose published and draft clinic previews', async ({ page }) => {
  await signInAsAdmin(page)
  await page.goto(`/admin/clinic-reputation?clientId=${GREEN_DENTAL_CLIENT_ID}`, { waitUntil: 'domcontentloaded' })

  await expect(page.getByRole('heading', { name: 'Reputation Snapshots' })).toBeVisible()
  await expect(page.getByText('without storing reviewer or patient identifiers.')).toBeVisible()
  await expect(page.getByRole('button', { name: 'Save reputation' })).toBeVisible()
  await expect(page.getByRole('link', { name: 'Published reputation' })).toHaveAttribute(
    'href',
    `/admin/client-reputation-preview?clientId=${GREEN_DENTAL_CLIENT_ID}`,
  )
  await expect(page.getByRole('link', { name: 'Draft reputation' })).toHaveAttribute(
    'href',
    `/admin/client-reputation-preview?clientId=${GREEN_DENTAL_CLIENT_ID}&preview=draft`,
  )

  await page.getByRole('link', { name: 'Draft reputation' }).click()
  await expect(page.locator('h1').getByText('Reputation', { exact: true })).toBeVisible()

  await page.goto(`/admin/clinic-compliance?clientId=${GREEN_DENTAL_CLIENT_ID}`, { waitUntil: 'domcontentloaded' })

  await expect(page.getByRole('heading', { name: 'Compliance Reviews' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Medical Approvals' })).toBeVisible()
  await expect(page.getByText('policy issues, medical claims, ad restrictions, and privacy/tracking status without PHI.')).toBeVisible()
  await expect(page.getByRole('button', { name: 'Save compliance' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Approve' }).first()).toBeVisible()
  await expect(page.getByRole('button', { name: 'Request changes' }).first()).toBeVisible()
  await expect(page.getByRole('button', { name: 'Reject' }).first()).toBeVisible()
  await expect(page.getByRole('link', { name: 'Published compliance' })).toHaveAttribute(
    'href',
    `/admin/client-compliance-approvals-preview?clientId=${GREEN_DENTAL_CLIENT_ID}`,
  )
  await expect(page.getByRole('link', { name: 'Draft compliance' })).toHaveAttribute(
    'href',
    `/admin/client-compliance-approvals-preview?clientId=${GREEN_DENTAL_CLIENT_ID}&preview=draft`,
  )

  await page.getByRole('link', { name: 'Published compliance' }).click()
  await expect(page.locator('h1').getByText('Compliance & Approvals', { exact: true })).toBeVisible()
})
