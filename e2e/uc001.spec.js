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
  await page.goto('/#login')
  await expect(page.getByRole('heading', { name: 'Sign in to your account' })).toBeVisible()
  await page.locator('input[name="email"]').fill(email)
  await page.locator('input[name="password"]').fill(DEMO_AUTH_PASSWORD)
  await page.getByRole('button', { name: 'Sign in' }).click()
}

async function signInAsAdmin(page) {
  await signIn(page, ADMIN_EMAIL)
  await expect(page).toHaveURL(/#admin-clients/)
  await expect(page.getByRole('heading', { name: 'Clients' })).toBeVisible()
}

async function signInAsClient(page) {
  await signIn(page, CLIENT_EMAIL)
  await expect(page).toHaveURL(/#client-overview/)
}

test.beforeEach(async ({ page }) => {
  await resetLocalDemo(page)
})

test('agency admin can sign in and open the clients workspace', async ({ page }) => {
  await signInAsAdmin(page)

  await expect(page.getByText('Green Dental Clinic')).toBeVisible()
  await expect(page.getByText('Northstar Dental Studio')).toBeVisible()
})

test('agency admin can create a client and the generated invite grants client overview access', async ({ page }) => {
  const suffix = Date.now()
  const clientName = `E2E Dental ${suffix}`
  const contactName = `Taylor Client ${suffix}`
  const contactEmail = `taylor.${suffix}@example.com`

  await signInAsAdmin(page)
  await page.getByRole('link', { name: 'New Client' }).click()
  await expect(page.getByRole('heading', { name: 'Create Client' })).toBeVisible()

  await page.getByPlaceholder('e.g. Green Dental Clinic').fill(clientName)
  await page.getByPlaceholder('e.g. Sarah Johnson').fill(contactName)
  await page.getByPlaceholder('sarah@greendental.com').fill(contactEmail)
  await page.getByRole('button', { name: 'Create Client' }).click()

  const clientRow = page.getByRole('row').filter({ hasText: clientName })
  await expect(clientRow).toBeVisible()
  await expect(clientRow).toContainText(contactEmail)
  await clientRow.locator('a[href^="#accept-invite?token="]').first().click()

  await expect(page.getByRole('heading', { name: 'Accept your invitation' })).toBeVisible()
  await expect(page.getByText(`You were invited to ${clientName}.`)).toBeVisible()
  await expect(page.locator('input[name="email"]')).toHaveValue(contactEmail)
  await page.getByRole('button', { name: 'Accept invite' }).click()

  await expect(page).toHaveURL(/#client-overview/)
  await expect(page.getByText(`Welcome, ${clientName}`)).toBeVisible()
})

test('client users cannot access another client overview', async ({ page }) => {
  await signInAsClient(page)

  await page.goto(`/#client-overview?clientId=${SEED_IDS.CLIENT_NORTHSTAR_DENTAL}`)

  await expect(page.getByRole('heading', { name: 'Access denied' }).nth(1)).toBeVisible()
  await expect(page.getByText('You do not have permission to view this client portal.')).toBeVisible()
})

test('admin draft changes stay private until publish, then appear on the client overview', async ({ page }) => {
  const updateText = `E2E published client update ${Date.now()}`

  await signInAsAdmin(page)
  await page.goto(`/#admin-client-overview?clientId=${SEED_IDS.CLIENT_GREEN_DENTAL}`)
  await expect(page.getByRole('heading', { name: 'Green Dental Clinic' })).toBeVisible()

  await page.getByPlaceholder('This week we launched...').fill(updateText)
  await page.getByRole('button', { name: 'Save Draft' }).click()
  await expect(page.getByText('Saved successfully')).toBeVisible()

  await signInAsClient(page)
  await page.goto(`/#client-overview?clientId=${SEED_IDS.CLIENT_GREEN_DENTAL}`)
  await expect(page.getByText(updateText)).toHaveCount(0)

  await signInAsAdmin(page)
  await page.goto(`/#admin-client-overview?clientId=${SEED_IDS.CLIENT_GREEN_DENTAL}`)
  await page.getByRole('button', { name: /^Publish$/ }).click()
  await expect(page.getByRole('dialog', { name: 'Publish client overview?' })).toBeVisible()
  await page.getByRole('button', { name: 'Publish overview' }).click()
  await expect(page.getByText('Published successfully')).toBeVisible()

  await signInAsClient(page)
  await page.goto(`/#client-overview?clientId=${SEED_IDS.CLIENT_GREEN_DENTAL}`)
  await expect(page.getByText(updateText)).toBeVisible()
})

test('client can answer a needed action and admin can mark it resolved', async ({ page }) => {
  const responseText = `Approved in e2e ${Date.now()}`

  await signInAsClient(page)
  await page.goto(`/#client-overview?clientId=${SEED_IDS.CLIENT_GREEN_DENTAL}`)

  const neededAction = page.locator('article').filter({ hasText: 'Confirm final offer details' }).first()
  await expect(neededAction).toBeVisible()
  await neededAction.getByRole('button', { name: 'Mark as answered' }).click()
  await neededAction.getByPlaceholder('Add a short note for the agency...').fill(responseText)
  await neededAction.getByRole('button', { name: 'Send response' }).click()

  await expect(neededAction.getByText('Your response:')).toBeVisible()
  await expect(neededAction.getByText(responseText)).toBeVisible()

  await signInAsAdmin(page)
  await page.goto(`/#admin-client-overview?clientId=${SEED_IDS.CLIENT_GREEN_DENTAL}`)

  await expect(page.getByText(responseText)).toBeVisible()
  await page.getByRole('button', { name: 'Mark resolved' }).click()
  await expect(page.getByText('resolved').first()).toBeVisible()
  await page.getByRole('button', { name: 'Save Draft' }).click()
  await expect(page.getByText('Saved successfully')).toBeVisible()
})

test('client overview hides internal tasks and internal notes', async ({ page }) => {
  await signInAsClient(page)
  await page.goto(`/#client-overview?clientId=${SEED_IDS.CLIENT_GREEN_DENTAL}`)

  await expect(page.getByText('Review new ad creatives')).toBeVisible()
  await expect(page.getByText('Debug internal tracking mismatch')).toHaveCount(0)
  await expect(page.getByText('Mismatch between form-submit event and CRM lead count')).toHaveCount(0)
  await expect(page.getByText('Internal tracking mismatch is under investigation.')).toHaveCount(0)
})
