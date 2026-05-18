export const PORTAL_REPOSITORY_COLLECTIONS = Object.freeze([
  { key: 'activityEvents', tableName: 'activity_events' },
  { key: 'bookingPipelineSnapshots', tableName: 'booking_pipeline_snapshots' },
  { key: 'clients', tableName: 'clients' },
  { key: 'clientFileLinks', tableName: 'client_file_links' },
  { key: 'clientInvitations', tableName: 'client_invitations' },
  { key: 'clientMemberships', tableName: 'client_memberships' },
  { key: 'clientRequests', tableName: 'client_requests' },
  { key: 'clientWorkItems', tableName: 'client_work_items' },
  { key: 'callBookingMetrics', tableName: 'call_booking_metrics' },
  { key: 'clinicLocations', tableName: 'clinic_locations' },
  { key: 'clinicProfiles', tableName: 'clinic_profiles' },
  { key: 'clinicServiceLines', tableName: 'clinic_service_lines' },
  { key: 'complianceReviews', tableName: 'compliance_reviews' },
  { key: 'dashboardLinks', tableName: 'dashboard_links' },
  { key: 'locationPerformance', tableName: 'location_performance' },
  { key: 'neededFromClient', tableName: 'needed_from_client' },
  { key: 'performanceDashboardPeriods', tableName: 'performance_dashboard_periods' },
  { key: 'patientAcquisitionSnapshots', tableName: 'patient_acquisition_snapshots' },
  { key: 'profiles', tableName: 'profiles' },
  { key: 'projects', tableName: 'projects' },
  { key: 'reputationSnapshots', tableName: 'reputation_snapshots' },
  { key: 'reports', tableName: 'reports' },
  { key: 'serviceLinePerformance', tableName: 'service_line_performance' },
  { key: 'medicalApprovals', tableName: 'medical_approvals' },
  { key: 'tasks', tableName: 'tasks' },
  { key: 'updates', tableName: 'updates' },
])

export const PORTAL_TABLE_NAMES = Object.freeze(
  PORTAL_REPOSITORY_COLLECTIONS.map((collection) => collection.tableName),
)

export const PORTAL_REPOSITORY_KEYS = Object.freeze(
  PORTAL_REPOSITORY_COLLECTIONS.map((collection) => collection.key),
)

export const PORTAL_ENTITY_REPOSITORY_METHODS = Object.freeze([
  'deleteById',
  'findById',
  'list',
  'listByClientId',
  'upsert',
])

export const PORTAL_REPOSITORY_EXTENSION_METHODS = Object.freeze({
  profiles: ['findByUserId'],
  root: ['reset'],
})
