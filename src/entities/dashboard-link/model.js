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

export const DASHBOARD_PROVIDER_META = Object.freeze({
  [DASHBOARD_PROVIDERS.LOOKER_STUDIO]: {
    label: 'Looker Studio',
  },
  [DASHBOARD_PROVIDERS.AGENCY_ANALYTICS]: {
    label: 'AgencyAnalytics',
  },
  [DASHBOARD_PROVIDERS.DATABOX]: {
    label: 'Databox',
  },
  [DASHBOARD_PROVIDERS.WHATAGRAPH]: {
    label: 'Whatagraph',
  },
  [DASHBOARD_PROVIDERS.DASH_THIS]: {
    label: 'DashThis',
  },
  [DASHBOARD_PROVIDERS.SWYDO]: {
    label: 'Swydo',
  },
  [DASHBOARD_PROVIDERS.REPORT_GARDEN]: {
    label: 'ReportGarden',
  },
  [DASHBOARD_PROVIDERS.OVIOND]: {
    label: 'Oviond',
  },
  [DASHBOARD_PROVIDERS.CUSTOM]: {
    label: 'Custom',
  },
})
