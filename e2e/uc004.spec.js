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

test('agency admin creates a draft performance dashboard and enters structured detail data', async ({ page }) => {
  const suffix = Date.now()
  const title = `E2E Structured Dashboard ${suffix}`

  await signInAsAdmin(page)
  await page.goto('/admin/performance-dashboards')
  await expect(page.getByRole('heading', { name: 'Performance Dashboards' })).toBeVisible()

  await page.getByRole('link', { name: 'New Dashboard' }).click()
  await expect(page.getByRole('dialog', { name: 'Create performance dashboard' })).toBeVisible()
  await expect(page.getByLabel('Content JSON')).toHaveCount(0)

  await page.getByLabel('Dashboard title *').fill(title)
  await page.getByLabel('Period start *').fill('2026-05-01')
  await page.getByLabel('Period end *').fill('2026-05-31')
  await page.getByLabel('Source summary').fill('Manual e2e data entry')
  await page.getByLabel('Attribution note').fill('Manual test attribution note.')
  await page.getByRole('button', { name: 'Create dashboard' }).click()

  await expect(page).toHaveURL(/\/admin\/performance-dashboard-editor/)
  await expect(page.getByRole('heading', { name: title })).toBeVisible()

  await page.getByRole('button', { name: 'Add Trend' }).click()
  await page.getByLabel('Trend metric key').fill('qualified_leads')
  await page.getByLabel('Trend goal value').fill('30')
  await page.getByRole('button', { name: 'Add Point' }).click()
  await page.getByLabel('Primary series date').fill('2026-05-01')
  await page.getByLabel('Primary series value').fill('24')
  await page.getByRole('button', { name: 'Add Comparison Point' }).click()
  await page.getByLabel('Comparison series date').fill('2026-04-01')
  await page.getByLabel('Comparison series value').fill('19')
  await page.getByRole('button', { name: 'Add Annotation' }).click()
  await page.getByLabel('Annotation date').fill('2026-05-15')
  await page.getByLabel('Annotation label').fill('Landing page update')

  await page.getByRole('button', { name: 'Add Service' }).click()
  await page.getByLabel('Service summary').fill('Paid ads produced more qualified leads this period.')
  await page.getByRole('button', { name: 'Add Metric' }).click()
  await page.getByLabel('Metric key', { exact: true }).fill('qualified_leads')
  await page.getByLabel('Metric value', { exact: true }).fill('24')
  await page.getByRole('button', { name: 'Add Insight' }).first().click()
  await page.getByLabel('Service insights').fill('Google Ads lead quality improved.')
  await page.getByRole('button', { name: 'Add Action' }).first().click()
  await page.getByLabel('Service next actions').fill('Scale exact-match campaigns gradually.')

  await page.getByRole('button', { name: 'Add Table' }).click()
  await page.getByLabel('Appendix table title').fill('Top Campaigns')
  await page.getByRole('button', { name: 'Add Column' }).click()
  await page.getByLabel('Column label').fill('Campaign')
  await page.getByRole('button', { name: 'Add Row' }).click()
  await page.getByLabel('Campaign cell').fill('Implants Search')

  await page.getByRole('button', { name: 'Save Draft' }).click()
  await expect(page.getByText('Performance dashboard saved', { exact: true }).first()).toBeVisible()

  const savedPeriod = await page.evaluate(({ portalKey, periodTitle }) => {
    const portalData = JSON.parse(window.localStorage.getItem(portalKey))

    return portalData.performance_dashboard_periods.find((period) => period.title === periodTitle)
  }, {
    periodTitle: title,
    portalKey: PORTAL_STORAGE_KEY,
  })

  expect(savedPeriod.content.trends[0].series).toEqual([{ date: '2026-05-01', value: 24 }])
  expect(savedPeriod.content.trends[0].comparison_series).toEqual([{ date: '2026-04-01', value: 19 }])
  expect(savedPeriod.content.trends[0].annotations).toEqual([{ date: '2026-05-15', label: 'Landing page update' }])
  expect(savedPeriod.content.service_sections[0].metrics).toEqual({ qualified_leads: 24 })
  expect(savedPeriod.content.service_sections[0].insights).toEqual(['Google Ads lead quality improved.'])
  expect(savedPeriod.content.service_sections[0].next_actions).toEqual(['Scale exact-match campaigns gradually.'])
  expect(savedPeriod.content.appendix_tables[0].columns).toEqual(['Campaign'])
  expect(savedPeriod.content.appendix_tables[0].rows).toEqual([['Implants Search']])
  expect(savedPeriod.status).toBe('draft')
})

test('client can view published performance dashboard but cannot view draft or another client dashboard', async ({ page }) => {
  await signInAsClient(page)

  await page.goto(`/client/performance?clientId=${SEED_IDS.CLIENT_GREEN_DENTAL}&performancePeriodId=${SEED_IDS.PERFORMANCE_GREEN_APRIL}`)
  await expect(page.getByRole('heading', { name: 'April 2026 Performance Dashboard' }).first()).toBeVisible()
  await expect(page.getByText('Qualified Leads').first()).toBeVisible()
  await expect(page.getByText('Last updated').first()).toBeVisible()
  await expect(page.getByRole('heading', { name: 'What Changed' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Next Actions' })).toBeVisible()

  await page.goto(`/client/performance?clientId=${SEED_IDS.CLIENT_GREEN_DENTAL}&performancePeriodId=${SEED_IDS.PERFORMANCE_GREEN_DRAFT_MAY}`)
  await expect(page.getByText('Performance dashboard is being prepared')).toBeVisible()
  await expect(page.getByText('May 2026 Draft Performance')).toHaveCount(0)

  await page.goto(`/client/performance?clientId=${SEED_IDS.CLIENT_NORTHSTAR_DENTAL}&performancePeriodId=${SEED_IDS.PERFORMANCE_GREEN_APRIL}`)
  await expect(page.getByRole('heading', { name: 'Access denied' }).nth(1)).toBeVisible()
  await expect(page.getByText('You do not have permission to view this client portal.')).toBeVisible()
})
