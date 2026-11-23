import { WeeklyLeadReportPage } from '../weekly-lead-report'

export const NEW_LEAD_REPORTING_DASHBOARD_KEY = 'new-lead-reporting'

export function NewLeadReportingPage(props) {
  return <WeeklyLeadReportPage {...props} dashboardKey={NEW_LEAD_REPORTING_DASHBOARD_KEY} />
}
