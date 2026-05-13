export const DASHBOARD_LINK_STATUSES = Object.freeze({
  ACTIVE: 'active',
  ARCHIVED: 'archived',
  DRAFT: 'draft',
  UNAVAILABLE: 'unavailable',
})

export const DASHBOARD_LINK_STATUS_META = Object.freeze({
  [DASHBOARD_LINK_STATUSES.ACTIVE]: {
    icon: 'checkCircle2',
    label: 'Active',
    tone: 'green',
  },
  [DASHBOARD_LINK_STATUSES.DRAFT]: {
    icon: 'fileText',
    label: 'Draft',
    tone: 'neutral',
  },
  [DASHBOARD_LINK_STATUSES.UNAVAILABLE]: {
    icon: 'triangleAlert',
    label: 'Unavailable',
    tone: 'amber',
  },
  [DASHBOARD_LINK_STATUSES.ARCHIVED]: {
    icon: 'archive',
    label: 'Archived',
    tone: 'neutral',
  },
})

export const DASHBOARD_PROVIDERS = Object.freeze({
  AGENCY_ANALYTICS: 'agencyanalytics',
  CUSTOM: 'custom',
  DATABOX: 'databox',
  DASH_THIS: 'dashthis',
  LOOKER_STUDIO: 'looker_studio',
  OVIOND: 'oviond',
  REPORT_GARDEN: 'reportgarden',
  SWYDO: 'swydo',
  WHATAGRAPH: 'whatagraph',
})
