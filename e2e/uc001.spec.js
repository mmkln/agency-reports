import { expect, test } from '@playwright/test'

import { PORTAL_STORAGE_KEY } from '../src/app/providers/repositories/createLocalStoragePortalRepository.js'
import { SEED_IDS } from '../src/app/providers/repositories/portalSeedData.js'
import { AUTH_SESSION_STORAGE_KEY, DEMO_AUTH_PASSWORD } from '../src/domain/services/authService.js'

const ADMIN_EMAIL = 'admin@growthlab.example'
const CLIENT_EMAIL = 'client@greendental.example'
const DEMO_ROLE_KEY = 'agency-reports.demo-role'

test.setTimeout(120_000)

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

async function clearAuthSession(page) {
  await page.evaluate((authKey) => {
    window.localStorage.removeItem(authKey)
  }, AUTH_SESSION_STORAGE_KEY)
}

async function signIn(page, email, password = DEMO_AUTH_PASSWORD) {
  await clearAuthSession(page)
  await page.goto('/login', { waitUntil: 'domcontentloaded' })
  await expect(page.getByRole('heading', { name: 'Sign in to your account' })).toBeVisible()
  await page.locator('input[name="email"]').fill(email)
  await page.locator('input[name="password"]').fill(password)
  await page.getByRole('button', { name: 'Sign in' }).click()
}

async function signInAsAdmin(page) {
  await signIn(page, ADMIN_EMAIL)
  await expect(page).toHaveURL(/\/admin\/clients/)
  await expect(page.getByRole('heading', { name: 'Clients' })).toBeVisible()
}

async function signInAsClient(page) {
  await signIn(page, CLIENT_EMAIL)
  await expect(page).toHaveURL(/\/client\/overview/)
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
  const contactPassword = `secure-${suffix}`

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
  await clientRow.getByRole('button', { name: `${clientName} actions` }).click()
  await page.getByRole('menuitem', { name: 'Open pending invitation' }).click()

  await expect(page.getByRole('heading', { name: 'Accept your invitation' })).toBeVisible()
  await expect(page.getByText(`You were invited to ${clientName}.`)).toBeVisible()
  await expect(page.locator('input[name="email"]')).toHaveValue(contactEmail)
  await page.locator('input[name="password"]').fill(contactPassword)
  await page.locator('input[name="confirmPassword"]').fill(contactPassword)
  await page.getByRole('button', { name: 'Create account' }).click()

  await expect(page).toHaveURL(/\/client\/overview/)
  await expect(page.getByText(`Welcome, ${clientName}`)).toBeVisible()

  await signIn(page, contactEmail, contactPassword)
  await expect(page).toHaveURL(/\/client\/overview/)
  await expect(page.getByText(`Welcome, ${clientName}`)).toBeVisible()
})

test('client can request a one-time invite link from email recovery', async ({ page }) => {
  const recoveredPassword = `recovered-${Date.now()}`

  await page.goto('/accept-invite', { waitUntil: 'domcontentloaded' })
  await expect(page.getByRole('heading', { name: 'Find your invitation' })).toBeVisible()
  await page.locator('input[name="email"]').fill('new.client@greendental.example')
  await page.getByRole('button', { name: 'Send secure link' }).click()

  await expect(page.getByText('If an invitation exists for that email, we sent a secure link.')).toBeVisible()
  const demoLinkText = page.getByText(/accept-invite\?token=/).last()
  await expect(demoLinkText).toBeVisible()
  const demoLinkTextContent = await demoLinkText.textContent()
  const demoLink = demoLinkTextContent.match(/https?:\/\/\S*accept-invite\?token=\S+/)?.[0]
  expect(demoLink).toBeTruthy()
  const recoveryUrl = new URL(demoLink)

  await page.goto(`${recoveryUrl.pathname}${recoveryUrl.search}`, { waitUntil: 'domcontentloaded' })
  await expect(page.getByRole('heading', { name: 'Accept your invitation' })).toBeVisible()
  await expect(page.locator('input[name="email"]')).toHaveValue('new.client@greendental.example')
  await page.locator('input[name="password"]').fill(recoveredPassword)
  await page.locator('input[name="confirmPassword"]').fill(recoveredPassword)
  await page.getByRole('button', { name: 'Create account' }).click()

  await expect(page).toHaveURL(/\/client\/overview/)
  await expect(page.getByRole('heading', { name: 'Green Dental Clinic' })).toBeVisible()
})

test('client admin can invite a teammate from settings team', async ({ page }) => {
  const suffix = Date.now()
  const teammateName = `Teammate ${suffix}`
  const teammateEmail = `teammate.${suffix}@example.com`
  const teammatePassword = `team-${suffix}`

  await signInAsClient(page)
  await page.goto(`/client/settings?clientId=${SEED_IDS.CLIENT_GREEN_DENTAL}&section=team`, { waitUntil: 'domcontentloaded' })
  await expect(page.getByRole('heading', { name: 'Team Members' })).toBeVisible()

  await page.getByRole('button', { name: 'Invite teammate' }).click()
  await expect(page.getByRole('dialog', { name: 'Invite teammate' })).toBeVisible()
  await page.getByPlaceholder('Sarah Johnson').fill(teammateName)
  await page.getByPlaceholder('sarah@client.com').fill(teammateEmail)
  await page.getByRole('dialog', { name: 'Invite teammate' }).getByRole('button', { name: 'Send invite' }).evaluate((button) => {
    button.closest('form')?.requestSubmit()
  })

  const demoLinkText = page.getByText(/accept-invite\?token=/).last()
  await expect(demoLinkText).toBeVisible()
  const demoLinkTextContent = await demoLinkText.textContent()
  const demoLink = demoLinkTextContent.match(/https?:\/\/\S*accept-invite\?token=\S+/)?.[0]
  expect(demoLink).toBeTruthy()
  const inviteUrl = new URL(demoLink)

  await page.goto(`${inviteUrl.pathname}${inviteUrl.search}`, { waitUntil: 'domcontentloaded' })
  await expect(page.getByRole('heading', { name: 'Accept your invitation' })).toBeVisible()
  await expect(page.locator('input[name="email"]')).toHaveValue(teammateEmail)
  await page.locator('input[name="password"]').fill(teammatePassword)
  await page.locator('input[name="confirmPassword"]').fill(teammatePassword)
  await page.getByRole('button', { name: 'Create account' }).click()

  await expect(page).toHaveURL(/\/client\/overview/)
  await expect(page.getByRole('heading', { name: 'Green Dental Clinic' })).toBeVisible()

  await signIn(page, teammateEmail, teammatePassword)
  await expect(page).toHaveURL(/\/client\/overview/)
  await page.goto(`/client/settings?clientId=${SEED_IDS.CLIENT_GREEN_DENTAL}&section=team`, { waitUntil: 'domcontentloaded' })
  await expect(page.getByRole('heading', { name: 'Team Members' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Invite teammate' })).toHaveCount(0)

  await signInAsClient(page)
  await page.goto(`/client/settings?clientId=${SEED_IDS.CLIENT_GREEN_DENTAL}&section=team`, { waitUntil: 'domcontentloaded' })
  await expect(page.getByText(teammateEmail)).toBeVisible()
  await expect(page.getByTestId('client-team-pending-invitations')).not.toContainText(teammateEmail)
})

test('client users cannot access another client overview', async ({ page }) => {
  await signInAsClient(page)

  await page.goto(`/client/overview?clientId=${SEED_IDS.CLIENT_NORTHSTAR_DENTAL}`, { waitUntil: 'domcontentloaded' })

  await expect(page.getByRole('heading', { name: 'Access denied' }).nth(1)).toBeVisible()
  await expect(page.getByText('You do not have permission to view this client portal.')).toBeVisible()
})

test('admin draft changes stay private until publish, then appear on the client overview', async ({ page }) => {
  test.setTimeout(180_000)

  const updateText = `E2E published client update ${Date.now()}`

  await signInAsAdmin(page)
  await page.goto(`/admin/client-overview?clientId=${SEED_IDS.CLIENT_GREEN_DENTAL}`, { waitUntil: 'domcontentloaded' })
  await expect(page.getByRole('heading', { name: 'Green Dental Clinic' })).toBeVisible()

  await page
    .getByPlaceholder('This week we launched the first campaign structure, connected tracking, and started testing new ad angles.')
    .fill(updateText)
  await expect(page.getByText(/Saved.*just now/).first()).toBeVisible()

  await signInAsClient(page)
  await page.goto(`/client/overview?clientId=${SEED_IDS.CLIENT_GREEN_DENTAL}`, { waitUntil: 'domcontentloaded' })
  await expect(page.getByText(updateText)).toHaveCount(0)

  await signInAsAdmin(page)
  await page.goto(`/admin/client-overview?clientId=${SEED_IDS.CLIENT_GREEN_DENTAL}`, { waitUntil: 'domcontentloaded' })
  await page.getByRole('button', { name: /^Publish$/ }).click()
  await expect(page.getByRole('dialog', { name: 'Publish client overview?' })).toBeVisible()
  await page.getByRole('button', { name: 'Publish overview' }).click()
  await expect(page.getByRole('link', { name: 'View client version' })).toBeVisible()

  await signInAsClient(page)
  await page.goto(`/client/updates?clientId=${SEED_IDS.CLIENT_GREEN_DENTAL}`, { waitUntil: 'domcontentloaded' })
  await expect(page.getByText(updateText)).toBeVisible()
})

test('client can answer a needed action and admin can mark it resolved', async ({ page }) => {
  const responseText = `Approved in e2e ${Date.now()}`

  await signInAsClient(page)
  await page.goto(`/client/action-needed?clientId=${SEED_IDS.CLIENT_GREEN_DENTAL}`, { waitUntil: 'domcontentloaded' })

  const neededAction = page.locator('article').filter({ hasText: 'Confirm final offer details' }).first()
  await expect(neededAction).toBeVisible()
  await neededAction.getByRole('button', { name: 'View details' }).click()
  const actionDialog = page.getByRole('dialog', { name: 'Confirm final offer details' })
  await actionDialog.getByPlaceholder('Write a short response for the agency...').fill(responseText)
  await actionDialog.getByRole('button', { name: 'Send response' }).click()

  await page.getByRole('button', { name: /Answered/ }).click()
  await expect(neededAction.getByText('Your response')).toBeVisible()
  await expect(neededAction.getByText(responseText)).toBeVisible()

  await signInAsAdmin(page)
  await page.goto(`/admin/client-requests?clientId=${SEED_IDS.CLIENT_GREEN_DENTAL}`, { waitUntil: 'domcontentloaded' })

  await expect(page.getByText(responseText)).toBeVisible()
  await page
    .getByTestId(`request-card-${SEED_IDS.NEEDED_OFFER_DETAILS}`)
    .getByRole('button', { name: 'Resolve' })
    .click()
  await page.getByRole('button', { name: 'Resolved' }).click()
  await expect(page.getByText(responseText)).toBeVisible()
})

test('client overview hides internal tasks and internal notes', async ({ page }) => {
  await signInAsClient(page)
  await page.goto(`/client/overview?clientId=${SEED_IDS.CLIENT_GREEN_DENTAL}`, { waitUntil: 'domcontentloaded' })

  await expect(page.getByText('Approve creative batch #2')).toBeVisible()
  await expect(page.getByRole('link', { name: 'Ask a question' })).toHaveAttribute(
    'href',
    `/client/requests?clientId=${SEED_IDS.CLIENT_GREEN_DENTAL}`,
  )
  await expect(page.getByRole('link', { name: 'sarah@greendental.example' })).toHaveAttribute(
    'href',
    'mailto:sarah@greendental.example',
  )
  await expect(page.getByText('Debug internal tracking mismatch')).toHaveCount(0)
  await expect(page.getByText('Mismatch between form-submit event and CRM lead count')).toHaveCount(0)
  await expect(page.getByText('Internal tracking mismatch is under investigation.')).toHaveCount(0)
})
