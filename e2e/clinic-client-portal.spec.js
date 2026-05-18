import { expect, test } from '@playwright/test'

import { PORTAL_STORAGE_KEY } from '../src/app/providers/repositories/createLocalStoragePortalRepository.js'
import { SEED_IDS } from '../src/app/providers/repositories/portalSeedData.js'
import { AUTH_SESSION_STORAGE_KEY, DEMO_AUTH_PASSWORD } from '../src/domain/services/authService.js'
import { CLINIC_RECORD_PUBLISH_STATES } from '../src/entities/clinic/index.js'
import { NEEDED_ACTION_STATUSES } from '../src/entities/needed-from-client/index.js'

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

async function signInAsClinicClient(page) {
  await page.evaluate(({ authKey, demoRoleKey }) => {
    window.localStorage.removeItem(authKey)
    window.localStorage.setItem(demoRoleKey, 'client')
  }, {
    authKey: AUTH_SESSION_STORAGE_KEY,
    demoRoleKey: DEMO_ROLE_KEY,
  })
  await page.goto('/login', { waitUntil: 'domcontentloaded' })
  await page.locator('input[name="email"]').fill(CLIENT_EMAIL)
  await page.locator('input[name="password"]').fill(DEMO_AUTH_PASSWORD)
  await page.getByRole('button', { name: 'Sign in' }).click()
  await expect(page).toHaveURL(/\/client\/overview/)
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
  await primaryNav.getByRole('button', { exact: true, name: 'Performance' }).click()
  await expect(primaryNav.getByRole('link', { exact: true, name: 'Acquisition' })).toHaveAttribute('href', '/client/patient-acquisition')
  await expect(primaryNav.getByRole('link', { exact: true, name: 'Calls' })).toHaveAttribute('href', '/client/calls-bookings')
  await expect(primaryNav.getByRole('link', { exact: true, name: 'Services' })).toHaveAttribute('href', '/client/service-lines')
  await expect(primaryNav.getByRole('link', { exact: true, name: 'Reputation' })).toHaveAttribute('href', '/client/reputation')
  await primaryNav.getByRole('button', { exact: true, name: 'Resources' }).click()
  await expect(primaryNav.getByRole('link', { exact: true, name: 'Compliance' })).toHaveAttribute('href', '/client/compliance-approvals')
  await expect(primaryNav.getByRole('link', { exact: true, name: 'Projects' })).toHaveCount(0)

  await expect(page.getByRole('heading', { exact: true, name: 'Green Dental Clinic' })).toBeVisible()
  await expect(page.getByRole('region', { name: 'Clinic control center summary' })).toContainText('Booked appointments')
  await expect(page.getByRole('region', { name: 'Clinic control center summary' })).toContainText('Missed calls')
  await expect(page.getByRole('region', { name: 'Clinic control center summary' })).toContainText('Reviews gained')
  await expect(page.getByRole('region', { name: 'Clinic control center summary' })).toContainText('Compliance issues')
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
