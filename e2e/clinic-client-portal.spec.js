import { expect, test } from '@playwright/test'

import { PORTAL_STORAGE_KEY } from '../src/app/providers/repositories/createLocalStoragePortalRepository.js'
import { SEED_IDS } from '../src/app/providers/repositories/portalSeedData.js'
import { AUTH_SESSION_STORAGE_KEY, DEMO_AUTH_PASSWORD } from '../src/domain/services/authService.js'
import { CLINIC_RECORD_PUBLISH_STATES } from '../src/entities/clinic/index.js'
import {
  CLINIC_NEEDED_ACTION_TYPES,
  NEEDED_ACTION_STATUSES,
  NEEDED_ACTION_TYPES,
} from '../src/entities/needed-from-client/index.js'

test.setTimeout(120_000)

const CLIENT_EMAIL = 'client@greendental.example'
const CLIENT_FINANCE_EMAIL = 'finance@greendental.example'
const CLIENT_OPS_EMAIL = 'ops@greendental.example'
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

async function signInAsClinicClient(page) {
  await signInWithEmail(page, CLIENT_EMAIL)
}

async function signInWithEmail(page, email, expectedUrl = /\/client\/overview/) {
  await page.evaluate(({ authKey, demoRoleKey }) => {
    window.localStorage.removeItem(authKey)
    window.localStorage.setItem(demoRoleKey, 'client')
  }, {
    authKey: AUTH_SESSION_STORAGE_KEY,
    demoRoleKey: DEMO_ROLE_KEY,
  })
  await page.goto('/login', { waitUntil: 'domcontentloaded' })
  await page.locator('input[name="email"]').fill(email)
  await page.locator('input[name="password"]').fill(DEMO_AUTH_PASSWORD)
  await page.getByRole('button', { name: 'Sign in' }).click()
  await expect(page).toHaveURL(expectedUrl)
}

async function mutatePortalStorage(page, mutatorSource) {
  await page.evaluate(({ mutator, portalKey }) => {
    const portalData = JSON.parse(window.localStorage.getItem(portalKey))
    const applyMutation = new Function('portalData', `return (${mutator})(portalData)`)

    window.localStorage.setItem(portalKey, JSON.stringify(applyMutation(portalData)))
  }, {
    mutator: mutatorSource,
    portalKey: PORTAL_STORAGE_KEY,
  })
}

test.beforeEach(async ({ page }) => {
  await resetLocalDemo(page)
})

test('clinic client navigation prioritizes patient acquisition workflows over generic projects', async ({ page }) => {
  await signInAsClinicClient(page)

  const primaryNav = page.getByRole('list', { name: 'Primary navigation' })

  await expect(primaryNav.getByRole('link', { exact: true, name: 'Overview' })).toHaveAttribute('href', '/client/overview')
  await expect(primaryNav.getByRole('link', { exact: true, name: 'Action Needed' })).toHaveAttribute('href', '/client/action-needed')
  await expect(primaryNav.getByRole('link', { exact: true, name: 'Growth Review' })).toHaveAttribute('href', '/dashboards/dental-growth-review')
  await expect(primaryNav.getByRole('link', { exact: true, name: 'Executive' })).toHaveAttribute('href', '/client/executive-performance')
  await primaryNav.getByRole('button', { exact: true, name: 'Performance' }).click()
  await expect(primaryNav.getByRole('link', { exact: true, name: 'Acquisition' })).toHaveAttribute('href', '/client/patient-acquisition')
  await expect(primaryNav.getByRole('link', { exact: true, name: 'Calls' })).toHaveAttribute('href', '/client/calls-bookings')
  await expect(primaryNav.getByRole('link', { exact: true, name: 'Services' })).toHaveAttribute('href', '/client/service-lines')
  await expect(primaryNav.getByRole('link', { exact: true, name: 'Reputation' })).toHaveAttribute('href', '/client/reputation')
  await primaryNav.getByRole('button', { exact: true, name: 'Resources' }).click()
  await expect(primaryNav.getByRole('link', { exact: true, name: 'Compliance' })).toHaveAttribute('href', '/client/compliance-approvals')
  await expect(primaryNav.getByRole('link', { exact: true, name: 'Projects' })).toHaveCount(0)
  await expect(primaryNav.getByRole('link', { exact: true, name: 'Monthly Strategy' })).toHaveCount(0)
  await expect(primaryNav.getByRole('link', { exact: true, name: 'Daily Operations' })).toHaveCount(0)

  await expect(page.getByRole('heading', { exact: true, name: 'Green Dental Clinic' })).toBeVisible()
  await expect(page.getByRole('region', { name: 'Clinic control center summary' })).toContainText('New inquiries')
  await expect(page.getByRole('region', { name: 'Clinic control center summary' })).toContainText('Booked appointments')
  await expect(page.getByRole('region', { name: 'Clinic control center summary' })).toContainText('Cost / booked')
  await expect(page.getByRole('region', { name: 'Clinic control center summary' })).toContainText('Missed calls')
  await expect(page.getByRole('region', { name: 'Clinic control center summary' })).toContainText('Reviews gained')
  await expect(page.getByRole('region', { name: 'Clinic control center summary' })).toContainText('Compliance issues')
  await expect(page.getByRole('region', { name: 'Clinic control center summary' })).toContainText('Action Needed')
  await expect(page.getByRole('heading', { name: 'Clinic Results' })).toBeVisible()
  await expect(page.getByRole('link', { name: 'View clinic results' })).toBeVisible()
})

test('clinic analytics pages render aggregate acquisition, booking, service, reputation, and compliance views', async ({ page }) => {
  await signInAsClinicClient(page)

  await page.goto(`/client/patient-acquisition?clientId=${GREEN_DENTAL_CLIENT_ID}`, { waitUntil: 'domcontentloaded' })
  await expect(page.locator('h1').getByText('Patient Acquisition', { exact: true })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Patient Acquisition Funnel' })).toBeVisible()
  await expect(page.getByRole('region', { name: 'Patient acquisition summary' }).getByText('Booked appointments', { exact: true })).toBeVisible()
  await expect(page.getByText('Campaign', { exact: true }).first()).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Data trust' })).toBeVisible()
  await expect(page.getByText('Published aggregate records only', { exact: true })).toBeVisible()
  await expect(page.getByText('Aggregate clinic metrics only; no patient-level data shown', { exact: true })).toBeVisible()
  await expect(page.getByText('Source dashboards', { exact: true })).toBeVisible()

  await page.goto(`/client/calls-bookings?clientId=${GREEN_DENTAL_CLIENT_ID}`, { waitUntil: 'domcontentloaded' })
  await expect(page.locator('h1').getByText('Calls & Bookings', { exact: true })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Booking Leakage' })).toBeVisible()
  await expect(page.getByRole('region', { name: 'Calls and bookings summary' }).getByText('Total calls', { exact: true })).toBeVisible()
  await expect(page.getByRole('region', { name: 'Calls and bookings summary' }).getByText('Missed calls', { exact: true })).toBeVisible()
  await expect(page.getByRole('region', { name: 'Calls and bookings summary' }).getByText('Booked from calls', { exact: true })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Service Line Call Handling' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Data trust' })).toBeVisible()
  await expect(page.getByText('Aggregate clinic metrics only; no patient-level data shown', { exact: true })).toBeVisible()

  await page.goto(`/client/service-lines?clientId=${GREEN_DENTAL_CLIENT_ID}`, { waitUntil: 'domcontentloaded' })
  await expect(page.locator('h1').getByText('Service Lines', { exact: true })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Clinic Focus' })).toBeVisible()
  await expect(page.getByText('Dental Implants')).toBeVisible()
  await expect(page.getByText('Campaign status', { exact: true })).toBeVisible()
  await expect(page.getByText('Compliance status', { exact: true })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Data trust' })).toBeVisible()

  await page.goto(`/client/reputation?clientId=${GREEN_DENTAL_CLIENT_ID}`, { waitUntil: 'domcontentloaded' })
  await expect(page.locator('h1').getByText('Reputation', { exact: true })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Review Response Work' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Local Presence' })).toBeVisible()
  await expect(page.getByRole('region', { name: 'Reputation summary' }).getByText('Google rating', { exact: true })).toBeVisible()
  await expect(page.getByRole('region', { name: 'Reputation summary' }).getByText('Reviews gained', { exact: true })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Data trust' })).toBeVisible()

  await page.goto(`/client/compliance-approvals?clientId=${GREEN_DENTAL_CLIENT_ID}`, { waitUntil: 'domcontentloaded' })
  await expect(page.locator('h1').getByText('Compliance & Approvals', { exact: true })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Compliance Reviews' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Medical Approvals' })).toBeVisible()
  await expect(page.getByRole('region', { name: 'Compliance and approvals' }).getByText('Open issues', { exact: true })).toBeVisible()
  await expect(page.getByRole('region', { name: 'Compliance and approvals' }).getByText('Pending approvals', { exact: true })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Data trust' })).toBeVisible()
})

test('dental growth review opens from client navigation and stays executive-focused by default', async ({ page }) => {
  await signInAsClinicClient(page)

  await expect(page.getByRole('heading', { name: 'Dental Growth Review' })).toBeVisible()
  await expect(page.getByRole('link', { name: 'Dental growth operating review' })).toHaveAttribute(
    'href',
    `/dashboards/dental-growth-review?clientId=${GREEN_DENTAL_CLIENT_ID}`,
  )
  await page.getByRole('list', { name: 'Primary navigation' }).getByRole('link', { exact: true, name: 'Growth Review' }).click()
  await expect(page).toHaveURL('/dashboards/dental-growth-review')
  await expect(page.locator('h1').getByText('Weekly Dental Growth Operating Review', { exact: true })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Executive Hero Metrics' })).toBeVisible()
  await expect(page.getByText('Projected 90-Day Revenue Range')).toBeVisible()
  await expect(page.getByText('LTV:CAC')).toHaveCount(0)
  await expect(page.getByRole('heading', { name: 'Funnel Conversion' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Exact Funnel Numbers' })).toHaveCount(0)
  await expect(page.getByRole('heading', { name: 'Data Freshness' })).toBeVisible()
  await expect(page.getByText('Meta agency PDF / export')).toBeVisible()
  await page.getByLabel('Review period').selectOption('current_biweekly')
  await expect(page).toHaveURL(/periodType=biweekly/)
  await expect(page.locator('h1').getByText('Bi-Weekly Dental Growth Operating Review', { exact: true })).toBeVisible()
  await expect(page.getByText('Green Dental Clinic | Bi-weekly review: May 4-17, 2026', { exact: true })).toBeVisible()
})

test('clinic executive reporting is aggregate-only and monthly strategy is finance gated', async ({ page }) => {
  await signInAsClinicClient(page)

  await expect(page.getByRole('link', { name: 'Executive performance' })).toHaveAttribute(
    'href',
    `/client/executive-performance?clientId=${GREEN_DENTAL_CLIENT_ID}`,
  )
  await expect(page.getByRole('link', { name: 'Monthly finance strategy' })).toHaveCount(0)

  await page.goto(`/client/executive-performance?clientId=${GREEN_DENTAL_CLIENT_ID}`, { waitUntil: 'domcontentloaded' })
  await expect(page.locator('h1').getByText('Clinic Executive Dashboard', { exact: true })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Executive Narrative' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Executive Focus' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Business Outcome Scoreboard' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Channel ROI' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Decisions Needed' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Source Trust' })).toBeVisible()
  await expect(page.locator('section').filter({ hasText: 'Source Trust' }).getByText('Current').first()).toBeVisible()
  await expect(page.getByText('Reply Queue')).toHaveCount(0)
  await expect(page.getByText('Call Queue')).toHaveCount(0)

  await page.goto(`/client/monthly-strategy?clientId=${GREEN_DENTAL_CLIENT_ID}`, { waitUntil: 'domcontentloaded' })
  await expect(page.locator('h1').getByText('Access denied', { exact: true })).toBeVisible()
})

test('finance-capable client can open monthly strategy and clinic team daily ops stays row-redacted', async ({ page }) => {
  await signInWithEmail(page, CLIENT_FINANCE_EMAIL)

  await expect(page.getByRole('link', { name: 'Monthly finance strategy' })).toHaveAttribute(
    'href',
    `/client/monthly-strategy?clientId=${GREEN_DENTAL_CLIENT_ID}`,
  )
  await expect(page.getByRole('list', { name: 'Primary navigation' }).getByRole('link', { name: 'Monthly Strategy' })).toHaveAttribute(
    'href',
    '/client/monthly-strategy',
  )
  await page.goto(`/client/monthly-strategy?clientId=${GREEN_DENTAL_CLIENT_ID}`, { waitUntil: 'domcontentloaded' })
  await expect(page.locator('h1').getByText('Finance And Strategy Dashboard', { exact: true })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Strategic Decisions Needed' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Monthly Financials' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Unit Economics' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Source Trust' })).toBeVisible()
  await expect(page.locator('section').filter({ hasText: 'Source Trust' }).getByText('Current').first()).toBeVisible()

  await resetLocalDemo(page)
  await signInWithEmail(page, CLIENT_OPS_EMAIL, /\/clinic\/daily-ops/)
  await expect(page.getByRole('list', { name: 'Primary navigation' }).getByRole('link', { name: 'Daily Operations' })).toHaveAttribute(
    'href',
    '/clinic/daily-ops',
  )
  await expect(page.getByRole('list', { name: 'Primary navigation' }).getByRole('link', { name: 'Growth Review' })).toHaveCount(0)

  await page.goto(`/clinic/daily-ops?clientId=${GREEN_DENTAL_CLIENT_ID}`, { waitUntil: 'domcontentloaded' })
  await expect(page.locator('h1').getByText('Daily Operational Command Center', { exact: true })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Queue Workload' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Reply Queue' })).toBeVisible()
  await expect(page.getByText('Operational queue rows are hidden for this viewer.').first()).toBeVisible()
  await expect(page.getByText('Implant pricing question')).toHaveCount(0)
  await expect(page.getByText('Implant consult follow-up calls')).toHaveCount(0)
})

test('clinic compliance page links open action-needed records', async ({ page }) => {
  await signInAsClinicClient(page)
  await mutatePortalStorage(page, `function addComplianceReviewAction(portalData) {
    portalData.needed_from_client.push({
      client_id: '${GREEN_DENTAL_CLIENT_ID}',
      clinic_action_type: '${CLINIC_NEEDED_ACTION_TYPES.APPROVE_AD_COPY}',
      compliance_risk: 'Ad policy review is blocked until the clinic confirms claim wording.',
      created_at: '2026-05-18T09:00:00.000Z',
      description: 'Review the revised whitening compliance copy before launch.',
      due_date: '2026-05-22',
      id: 'e2e-compliance-review-action',
      impact_if_delayed: 'Healthcare ads stay limited until the claim is approved.',
      patient_impact: 'Patients need accurate treatment expectations before booking.',
      priority: 'high',
      related_compliance_review_id: '${SEED_IDS.COMPLIANCE_REVIEW_AD_CLAIMS}',
      related_service_line_id: '${SEED_IDS.CLINIC_SERVICE_WHITENING}',
      status: '${NEEDED_ACTION_STATUSES.PENDING}',
      title: 'Approve revised whitening claim',
      type: '${NEEDED_ACTION_TYPES.APPROVAL}',
      updated_at: '2026-05-18T09:00:00.000Z'
    })

    return portalData
  }`)

  await page.goto(`/client/compliance-approvals?clientId=${GREEN_DENTAL_CLIENT_ID}`, { waitUntil: 'domcontentloaded' })

  const reviewCard = page.locator('article').filter({ hasText: 'Ad claims and offer wording review' })
  await expect(reviewCard).toContainText('Approve revised whitening claim')
  await expect(reviewCard.getByRole('link', { name: 'Open action' })).toHaveAttribute(
    'href',
    `/client/action-needed?clientId=${GREEN_DENTAL_CLIENT_ID}`,
  )

  const approvalCard = page.locator('article').filter({ hasText: 'Whitening offer ad copy' })
  await expect(approvalCard).toContainText('Confirm final offer details')
  await expect(approvalCard.getByRole('link', { name: 'Open action' })).toHaveAttribute(
    'href',
    `/client/action-needed?clientId=${GREEN_DENTAL_CLIENT_ID}`,
  )
})

test('clinic action needed supports medical approval and missed-call operational responses', async ({ page }) => {
  await signInAsClinicClient(page)
  await page.goto(`/client/action-needed?clientId=${GREEN_DENTAL_CLIENT_ID}`, { waitUntil: 'domcontentloaded' })

  const approvalCard = page.locator('article').filter({ hasText: 'Approve creative batch #2' })

  await expect(approvalCard).toBeVisible()
  await expect(approvalCard).toContainText('Approve ad copy')
  await expect(approvalCard).toContainText('Ad copy cannot launch until medical review is approved.')
  await approvalCard.getByRole('button', { name: 'View details' }).click()

  let dialog = page.getByRole('dialog')

  await expect(dialog.getByRole('heading', { name: 'Approve creative batch #2' })).toBeVisible()
  await expect(dialog.getByText('Clinic action')).toBeVisible()
  await expect(dialog.getByText('Service line')).toBeVisible()
  await expect(dialog.getByText('Compliance risk')).toBeVisible()
  await dialog.getByLabel('Response').fill('Approved by the clinic owner for the next ad test.')
  await dialog.getByRole('button', { name: 'Approve' }).click()
  await page.getByRole('button', { name: /^Approved \d+$/ }).click()
  await expect(page.locator('article').filter({ hasText: 'Approve creative batch #2' })).toContainText('Approved by the clinic owner for the next ad test.')

  await page.getByRole('button', { name: /^Open \d+$/ }).click()

  const missedCallCard = page.locator('article').filter({ hasText: 'Fix emergency missed-call follow-up' })

  await expect(missedCallCard).toBeVisible()
  await expect(missedCallCard).toContainText('Fix missed-call follow-up')
  await expect(missedCallCard).toContainText('Missed calls can become lost same-day new-patient appointments.')
  await missedCallCard.getByRole('button', { name: 'View details' }).click()

  dialog = page.getByRole('dialog')

  await expect(dialog.getByRole('heading', { name: 'Fix emergency missed-call follow-up' })).toBeVisible()
  await expect(dialog.getByText('Patient impact')).toBeVisible()
  await expect(dialog.getByText('Do not send patient names, phone numbers, or call transcripts through the portal.')).toBeVisible()
  await dialog.getByLabel('Response').fill('Front desk will call missed emergency inquiries back within 15 minutes.')
  await dialog.getByRole('button', { name: 'Send response' }).click()
  await page.getByRole('button', { name: /^Answered \d+$/ }).click()
  await expect(page.locator('article').filter({ hasText: 'Fix emergency missed-call follow-up' })).toContainText('Front desk will call missed emergency inquiries back within 15 minutes.')

  const persistedState = await page.evaluate(({ approvalActionId, missedCallActionId, portalKey }) => {
    const portalData = JSON.parse(window.localStorage.getItem(portalKey))
    const approvalAction = portalData.needed_from_client.find((item) => item.id === approvalActionId)
    const missedCallAction = portalData.needed_from_client.find((item) => item.id === missedCallActionId)

    return {
      approvalStatus: approvalAction?.status,
      missedCallStatus: missedCallAction?.status,
    }
  }, {
    approvalActionId: SEED_IDS.NEEDED_CREATIVE_APPROVAL,
    missedCallActionId: SEED_IDS.NEEDED_MISSED_CALL_FOLLOW_UP,
    portalKey: PORTAL_STORAGE_KEY,
  })

  expect(persistedState).toEqual({
    approvalStatus: NEEDED_ACTION_STATUSES.APPROVED,
    missedCallStatus: NEEDED_ACTION_STATUSES.ANSWERED,
  })
})

test('clinic client surfaces hide draft and cross-client aggregate records', async ({ page }) => {
  await signInAsClinicClient(page)

  await mutatePortalStorage(page, `function addHiddenClinicRecords(portalData) {
    const cloneRecord = (record, overrides) => ({
      ...record,
      ...overrides,
      created_at: '2026-05-18T09:00:00.000Z',
      last_updated_at: '2026-05-18T09:00:00.000Z',
      updated_at: '2026-05-18T09:00:00.000Z',
    })

    portalData.patient_acquisition_snapshots.push(cloneRecord(portalData.patient_acquisition_snapshots[0], {
      id: 'e2e-hidden-patient-acquisition-draft',
      insight: 'E2E hidden patient acquisition draft with Patient John Smith.',
      publish_state: '${CLINIC_RECORD_PUBLISH_STATES.DRAFT}',
      summary: 'E2E hidden patient acquisition draft',
    }))
    portalData.call_booking_metrics.push(cloneRecord(portalData.call_booking_metrics[0], {
      id: 'e2e-hidden-call-booking-cross-client',
      client_id: '${SEED_IDS.CLIENT_NORTHSTAR_DENTAL}',
      insight: 'E2E other clinic call metric',
      summary: 'E2E other clinic call metric',
    }))
    portalData.reputation_snapshots.push(cloneRecord(portalData.reputation_snapshots[0], {
      id: 'e2e-hidden-reputation-draft',
      insight: 'E2E hidden reputation draft',
      publish_state: '${CLINIC_RECORD_PUBLISH_STATES.DRAFT}',
    }))
    portalData.compliance_reviews.push(cloneRecord(portalData.compliance_reviews[0], {
      id: 'e2e-hidden-compliance-draft',
      publish_state: '${CLINIC_RECORD_PUBLISH_STATES.DRAFT}',
      summary: 'E2E hidden compliance draft',
      title: 'E2E hidden compliance draft',
    }))

    return portalData
  }`)

  for (const path of [
    '/client/patient-acquisition',
    '/client/calls-bookings',
    '/client/reputation',
    '/client/compliance-approvals',
  ]) {
    await page.goto(`${path}?clientId=${GREEN_DENTAL_CLIENT_ID}`, { waitUntil: 'domcontentloaded' })
    await expect(page.getByText('E2E hidden patient acquisition draft')).toHaveCount(0)
    await expect(page.getByText('Patient John Smith')).toHaveCount(0)
    await expect(page.getByText('E2E other clinic call metric')).toHaveCount(0)
    await expect(page.getByText('E2E hidden reputation draft')).toHaveCount(0)
    await expect(page.getByText('E2E hidden compliance draft')).toHaveCount(0)
  }
})
