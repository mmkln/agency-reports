import { expect, test } from '@playwright/test'

import { PORTAL_STORAGE_KEY } from '../src/app/providers/repositories/createLocalStoragePortalRepository.js'
import { SEED_IDS } from '../src/app/providers/repositories/portalSeedData.js'
import { AUTH_SESSION_STORAGE_KEY, DEMO_AUTH_PASSWORD } from '../src/domain/services/authService.js'

test.setTimeout(120_000)

const ADMIN_EMAIL = 'admin@growthlab.example'
const CLIENT_EMAIL = 'client@greendental.example'
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

async function signIn(page, { demoRoleKey, email, expectedUrl }) {
  await page.evaluate(({ authKey, roleKey, selectedRole }) => {
    window.localStorage.removeItem(authKey)
    window.localStorage.setItem(roleKey, selectedRole)
  }, {
    authKey: AUTH_SESSION_STORAGE_KEY,
    roleKey: DEMO_ROLE_KEY,
    selectedRole: demoRoleKey,
  })
  await page.goto('/login', { waitUntil: 'domcontentloaded' })
  await page.locator('input[name="email"]').fill(email)
  await page.locator('input[name="password"]').fill(DEMO_AUTH_PASSWORD)
  await page.getByRole('button', { name: 'Sign in' }).click()
  await expect(page).toHaveURL(expectedUrl)
}

async function signInAsAdmin(page) {
  await signIn(page, {
    demoRoleKey: 'admin',
    email: ADMIN_EMAIL,
    expectedUrl: /\/admin\/clients/,
  })
}

async function signInAsClinicClient(page) {
  await signIn(page, {
    demoRoleKey: 'client',
    email: CLIENT_EMAIL,
    expectedUrl: /\/client\/growth-review/,
  })
}

function primaryNav(page) {
  return page.getByRole('navigation', { name: 'Primary navigation' })
}

test.beforeEach(async ({ page }) => {
  await resetLocalDemo(page)
})

test('admin shell exposes only account creation/setup in general navigation', async ({ page }) => {
  await signInAsAdmin(page)

  await expect(page.locator('h1').getByText('Accounts', { exact: true })).toBeVisible()
  await expect(primaryNav(page).getByRole('link', { exact: true, name: 'Accounts' })).toHaveAttribute('href', '/admin/clients')

  for (const removedLabel of ['Tasks', 'Dashboards', 'Performance', 'Reports']) {
    await expect(primaryNav(page).getByRole('link', { exact: true, name: removedLabel })).toHaveCount(0)
  }

  const greenDentalRow = page.getByRole('row').filter({ hasText: 'Green Dental Clinic' })
  await expect(greenDentalRow.getByRole('link', { name: 'Open' })).toHaveAttribute(
    'href',
    `/admin/clinic-setup?clientId=${GREEN_DENTAL_CLIENT_ID}`,
  )
  await greenDentalRow.getByRole('link', { name: 'Open' }).click()

  await expect(page).toHaveURL(`/admin/clinic-setup?clientId=${GREEN_DENTAL_CLIENT_ID}`)
  await expect(page.locator('h1').getByText('Green Dental Clinic', { exact: true })).toBeVisible()
  await expect(primaryNav(page).getByRole('link', { exact: true, name: 'Clinic Setup' })).toBeVisible()
  await expect(primaryNav(page).getByRole('link', { exact: true, name: 'Access' })).toBeVisible()
  await expect(primaryNav(page).getByRole('link', { exact: true, name: 'Review Admin' })).toBeVisible()

  for (const removedLabel of ['Overview', 'Projects', 'Actions', 'Requests', 'Clinic Results', 'Metrics', 'Reputation', 'Compliance', 'Updates', 'Files & Links', 'Activity']) {
    await expect(primaryNav(page).getByRole('link', { exact: true, name: removedLabel })).toHaveCount(0)
  }
})

test('admin can configure clinic setup and access Dental Growth Review admin', async ({ page }) => {
  await signInAsAdmin(page)
  await page.goto(`/admin/clinic-setup?clientId=${GREEN_DENTAL_CLIENT_ID}`, { waitUntil: 'domcontentloaded' })

  await expect(page.getByRole('heading', { name: 'Clinic Profile' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Locations' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Service Lines' })).toBeVisible()
  await expect(page.getByText('Do not enter patient-level identifiers here.')).toBeVisible()

  await page.getByLabel('Primary growth goal').fill('E2E lean clinic setup goal.')
  await page.getByRole('button', { name: 'Save clinic setup' }).click()
  await expect(page.getByText('Saved', { exact: true })).toBeVisible()

  const savedGoal = await page.evaluate(({ clientId, portalKey }) => {
    const portalData = JSON.parse(window.localStorage.getItem(portalKey))
    return portalData.clinic_profiles.find((profile) => profile.client_id === clientId)?.primary_goal
  }, {
    clientId: GREEN_DENTAL_CLIENT_ID,
    portalKey: PORTAL_STORAGE_KEY,
  })

  expect(savedGoal).toBe('E2E lean clinic setup goal.')

  await primaryNav(page).getByRole('link', { exact: true, name: 'Review Admin' }).click()
  await expect(page).toHaveURL(`/admin/clinic-reporting?clientId=${GREEN_DENTAL_CLIENT_ID}`)
  await expect(page.getByRole('heading', { name: 'Reporting Records' })).toBeVisible()
  await expect(page.locator('main').getByRole('link', { name: 'Dental Growth Review' })).toHaveAttribute(
    'href',
    `/client/growth-review?clientId=${GREEN_DENTAL_CLIENT_ID}`,
  )
  await expect(page.locator('main').getByRole('link', { name: 'Executive dashboard' })).toHaveCount(0)
  await expect(page.locator('main').getByRole('link', { name: 'Daily ops' })).toHaveCount(0)
})

test('clinic client lands on Dental Growth Review with only lean client navigation', async ({ page }) => {
  await signInAsClinicClient(page)

  await expect(page.locator('h1').getByText('Dental Growth Review', { exact: true })).toBeVisible()
  await expect(primaryNav(page).getByRole('link', { exact: true, name: 'Dental Growth Review' })).toHaveAttribute('href', '/client/growth-review')

  for (const removedLabel of ['Overview', 'Action Needed', 'Acquisition', 'Calls', 'Services', 'Reputation', 'Compliance', 'Reports', 'Requests', 'Files', 'Updates', 'Projects']) {
    await expect(primaryNav(page).getByRole('link', { exact: true, name: removedLabel })).toHaveCount(0)
  }

  await page.getByRole('link', { exact: true, name: 'Settings' }).click()
  await expect(page).toHaveURL('/client/settings')
  await expect(page.locator('h1').getByText('Settings', { exact: true })).toBeVisible()
})

test('removed routes are no longer registered as product destinations', async ({ page }) => {
  await signInAsAdmin(page)

  for (const removedPath of [
    '/admin/tasks',
    '/admin/dashboard-links',
    '/admin/reports',
    '/admin/client-overview',
    '/client/overview',
    '/client/action-needed',
    '/client/reports-dashboards',
    '/client/patient-acquisition',
    '/clinic/daily-ops',
    '/team/clinic-operator',
  ]) {
    await page.goto(removedPath, { waitUntil: 'domcontentloaded' })
    await expect(page).toHaveURL('/')
    await expect(page.getByRole('link', { name: 'Log in' })).toBeVisible()
  }
})
