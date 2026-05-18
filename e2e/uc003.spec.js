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

async function signIn(page, email) {
  await clearAuthSession(page)
  await page.goto('/login', { waitUntil: 'domcontentloaded' })
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

test('agency admin can publish a monthly report and client can read it in the archive', async ({ page }) => {
  const suffix = Date.now()
  const reportTitle = `E2E May ${suffix} Monthly Summary`
  const summary = `E2E executive summary ${suffix}`
  const work = `E2E work completed ${suffix}`
  const results = `E2E results generated ${suffix}`
  const wins = `E2E wins ${suffix}`
  const problems = `E2E problems ${suffix}`
  const nextActions = `E2E next actions ${suffix}`
  const needed = `E2E needed from client ${suffix}`

  await signInAsAdmin(page)
  await page.goto('/admin/reports', { waitUntil: 'domcontentloaded' })
  await expect(page.getByRole('heading', { name: 'Reports' })).toBeVisible()

  await page.getByRole('link', { name: 'New Report' }).click()
  await expect(page.getByRole('dialog', { name: 'Create monthly report' })).toBeVisible()

  await page.getByLabel('Report title *').fill(reportTitle)
  await page.getByLabel('Period start *').fill('2026-05-01')
  await page.getByLabel('Period end *').fill('2026-05-31')
  await page.getByLabel('Status *').click()
  await page.getByRole('option', { name: 'Published' }).click()
  await page.getByLabel('Executive summary').fill(summary)
  await page.getByLabel('What we did').fill(work)
  await page.getByLabel('Results').fill(results)
  await page.getByLabel('Wins').fill(wins)
  await page.getByLabel('Problems / blockers').fill(problems)
  await page.getByLabel('Next actions').fill(nextActions)
  await page.getByLabel('Needed from client').fill(needed)
  await page.getByLabel('Dashboard URL').fill('https://example.com/report-dashboard')
  await page.getByLabel('PDF / full report URL').fill('https://example.com/report.pdf')
  await page.getByRole('button', { name: 'Create report' }).click()

  const reportRow = page.getByRole('row').filter({ hasText: reportTitle })
  await expect(reportRow).toBeVisible()
  await expect(reportRow).toContainText('Published')

  const reportId = await page.evaluate(({ portalKey, title }) => {
    const portalData = JSON.parse(window.localStorage.getItem(portalKey))

    return portalData.reports.find((report) => report.title === title).id
  }, {
    portalKey: PORTAL_STORAGE_KEY,
    title: reportTitle,
  })

  await page.goto(
    `/admin/client-report-preview?clientId=${SEED_IDS.CLIENT_GREEN_DENTAL}&reportId=${reportId}`,
    { waitUntil: 'domcontentloaded' },
  )
  await expect(page).toHaveURL(/\/admin\/client-report-preview/)
  await expect(page.getByText(reportTitle).first()).toBeVisible()
  await expect(page.getByText(summary).first()).toBeVisible()
  await expect(page.getByText(work).first()).toBeVisible()
  await expect(page.getByText(results).first()).toBeVisible()

  await signInAsClient(page)
  await page.goto(
    `/client/reports-dashboards?clientId=${SEED_IDS.CLIENT_GREEN_DENTAL}&reportId=${reportId}`,
    { waitUntil: 'domcontentloaded' },
  )
  await expect(page.getByText(reportTitle).first()).toBeVisible()
  await expect(page.getByText(wins)).toBeVisible()
  await expect(page.getByText(problems)).toBeVisible()
  await expect(page.getByText(nextActions)).toBeVisible()
  await expect(page.getByText(needed)).toBeVisible()
  await expect(page.getByRole('link', { name: 'Open dashboard' })).toBeVisible()
  await expect(page.getByRole('link', { name: 'Open PDF' })).toBeVisible()

  const archive = page.locator('#report-archive')
  await expect(archive.getByText('Report Archive')).toBeVisible()
  await expect(archive.getByText(reportTitle)).toBeVisible()
  await expect(archive.getByText(summary)).toBeVisible()
  await expect(archive.getByRole('link', { name: 'Read report' }).first()).toBeVisible()
})

test('client report archive hides draft reports', async ({ page }) => {
  const reportTitle = `E2E Hidden Draft ${Date.now()}`

  await signInAsAdmin(page)
  const draftReportId = await page.evaluate(({ clientId, portalKey, title }) => {
    const portalData = JSON.parse(window.localStorage.getItem(portalKey))
    const draftReport = {
      client_decisions_needed: '',
      client_id: clientId,
      created_at: '2026-06-01T09:00:00.000Z',
      dashboard_url: '',
      id: crypto.randomUUID(),
      next_actions: '',
      pdf_url: '',
      period_end: '2026-06-30',
      period_start: '2026-06-01',
      problems: '',
      published_at: null,
      status: 'draft',
      summary: 'Draft only summary',
      title,
      updated_at: '2026-06-01T09:00:00.000Z',
      wins: '',
    }

    portalData.reports.push(draftReport)
    window.localStorage.setItem(portalKey, JSON.stringify(portalData))

    return draftReport.id
  }, {
    clientId: SEED_IDS.CLIENT_GREEN_DENTAL,
    portalKey: PORTAL_STORAGE_KEY,
    title: reportTitle,
  })

  await page.goto(
    `/admin/client-report-preview?clientId=${SEED_IDS.CLIENT_GREEN_DENTAL}&reportId=${draftReportId}`,
    { waitUntil: 'domcontentloaded' },
  )
  await expect(page).toHaveURL(/\/admin\/client-report-preview/)
  await expect(page.getByText(reportTitle).first()).toBeVisible()
  await expect(page.getByText('Preview only. This report is not visible to the client.')).toBeVisible()
  await expect(page.locator('#selected-report').getByText('Draft').first()).toBeVisible()

  await signInAsClient(page)
  await page.goto(`/client/reports-dashboards?clientId=${SEED_IDS.CLIENT_GREEN_DENTAL}`, { waitUntil: 'domcontentloaded' })
  await expect(page.getByText(reportTitle)).toHaveCount(0)

  await page.goto(
    `/client/reports-dashboards?clientId=${SEED_IDS.CLIENT_GREEN_DENTAL}&reportId=${draftReportId}`,
    { waitUntil: 'domcontentloaded' },
  )
  await expect(page.getByText('Report unavailable')).toBeVisible()
  await expect(page.getByText(reportTitle)).toHaveCount(0)
  await expect(page.getByRole('link', { name: 'Go to latest report' })).toBeVisible()
})

test('client report reader shows narrative hierarchy and link fallbacks', async ({ page }) => {
  await signInAsClient(page)
  await page.goto(
    `/client/reports-dashboards?clientId=${SEED_IDS.CLIENT_GREEN_DENTAL}&reportId=${SEED_IDS.REPORT_APRIL_2026}`,
    { waitUntil: 'domcontentloaded' },
  )

  await expect(page.getByRole('heading', { name: 'April 2026 Monthly Summary' }).first()).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Patient Acquisition' }).first()).toBeVisible()
  await expect(page.getByText('Booked appointments', { exact: true }).first()).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Booking Leakage' }).first()).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Reputation' }).first()).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Compliance' }).first()).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Clinic Actions Needed' }).first()).toBeVisible()

  const reportOpenedEvent = await page.evaluate(({ portalKey, reportId }) => {
    const portalData = JSON.parse(window.localStorage.getItem(portalKey))

    return portalData.activity_events.find((event) => (
      event.event_type === 'report_opened'
      && event.metadata?.reportId === reportId
      && event.metadata?.source === 'client_reports_dashboards'
    ))
  }, {
    portalKey: PORTAL_STORAGE_KEY,
    reportId: SEED_IDS.REPORT_APRIL_2026,
  })

  expect(reportOpenedEvent).toBeTruthy()
})

test('legacy client reports route redirects to Reports & Dashboards', async ({ page }) => {
  await signInAsClient(page)
  await page.goto(
    `/client/reports?clientId=${SEED_IDS.CLIENT_GREEN_DENTAL}&reportId=${SEED_IDS.REPORT_APRIL_2026}`,
    { waitUntil: 'domcontentloaded' },
  )

  await expect(page).toHaveURL(/\/client\/reports-dashboards/)
  await expect(page).toHaveURL(new RegExp(`reportId=${SEED_IDS.REPORT_APRIL_2026}`))
  await expect(page.locator('h1').getByText('Reports & Dashboards')).toBeVisible()
  await expect(page.getByRole('heading', { name: 'April 2026 Monthly Summary' }).first()).toBeVisible()
})

test('agency admin can duplicate a published report into a hidden draft', async ({ page }) => {
  await signInAsAdmin(page)
  await page.goto('/admin/reports', { waitUntil: 'domcontentloaded' })

  const sourceRow = page.getByRole('row').filter({ hasText: 'April 2026 Monthly Summary' })
  await sourceRow.getByLabel('Report actions').click()
  await page.getByRole('menuitem', { name: 'Duplicate report' }).click()

  await expect(page.getByText('Report duplicated', { exact: true }).first()).toBeVisible()
  await expect(page.getByRole('dialog', { name: 'Edit monthly report' })).toBeVisible()
  await expect(page.getByLabel('Report title *')).toHaveValue('Copy of April 2026 Monthly Summary')
  await expect(page.getByLabel('Status *')).toContainText('Draft')
  await page.getByRole('button', { name: 'Cancel' }).click()

  const duplicatedRow = page.getByRole('row').filter({ hasText: 'Copy of April 2026 Monthly Summary' })
  await expect(duplicatedRow).toBeVisible()
  await expect(duplicatedRow).toContainText('Draft')

  await signInAsClient(page)
  await page.goto(`/client/reports-dashboards?clientId=${SEED_IDS.CLIENT_GREEN_DENTAL}`, { waitUntil: 'domcontentloaded' })
  await expect(page.getByText('Copy of April 2026 Monthly Summary')).toHaveCount(0)
})

test('agency admin can filter monthly reports', async ({ page }) => {
  await signInAsAdmin(page)
  await page.goto('/admin/reports', { waitUntil: 'domcontentloaded' })

  const sourceReport = page.getByRole('row').filter({ hasText: 'April 2026 Monthly Summary' })
  await expect(sourceReport).toBeVisible()

  await page.getByLabel('Search').fill('missing report title')
  await expect(page.getByText('No reports match these filters')).toBeVisible()

  await page.getByRole('button', { name: 'Reset' }).click()
  await expect(sourceReport).toBeVisible()

  await page.getByRole('button', { name: 'Open report filters' }).click()
  await page.getByLabel('Status').click()
  await page.getByRole('option', { name: 'Draft' }).click()
  await expect(page.getByText('No reports match these filters')).toBeVisible()

  await page.getByRole('button', { name: 'Reset' }).click()
  await page.getByRole('button', { name: 'Open report filters' }).click()
  await page.getByLabel('Status').click()
  await page.getByRole('option', { name: 'Published' }).click()
  await expect(sourceReport).toBeVisible()
})

test('agency admin can archive a published report and client still sees it in the archive', async ({ page }) => {
  await signInAsAdmin(page)
  await page.goto('/admin/reports', { waitUntil: 'domcontentloaded' })

  const sourceReport = page.getByRole('row').filter({ hasText: 'April 2026 Monthly Summary' })
  await expect(sourceReport).toBeVisible()
  await sourceReport.getByLabel('Report actions').click()
  await page.getByRole('menuitem', { name: 'Set Archived' }).click()

  await expect(page.getByRole('dialog', { name: 'Archive published report?' })).toBeVisible()
  await expect(page.getByText('will remain visible in the client report archive')).toBeVisible()
  await page.getByRole('button', { name: 'Archive report' }).click()
  await expect(sourceReport).toContainText('Archived')

  await signInAsClient(page)
  await page.goto(
    `/client/reports-dashboards?clientId=${SEED_IDS.CLIENT_GREEN_DENTAL}&reportId=${SEED_IDS.REPORT_APRIL_2026}`,
    { waitUntil: 'domcontentloaded' },
  )
  await expect(page.getByRole('heading', { name: 'April 2026 Monthly Summary' }).first()).toBeVisible()
  await expect(page.getByText('Archived').first()).toBeVisible()
})
