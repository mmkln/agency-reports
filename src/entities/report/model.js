export const REPORT_STATUSES = Object.freeze({
  ARCHIVED: 'archived',
  DRAFT: 'draft',
  PUBLISHED: 'published',
  READY: 'ready',
})

export const REPORT_STATUS_META = Object.freeze({
  [REPORT_STATUSES.DRAFT]: {
    icon: 'fileText',
    label: 'Draft',
    tone: 'neutral',
  },
  [REPORT_STATUSES.READY]: {
    icon: 'checkCircle2',
    label: 'Ready',
    tone: 'blue',
  },
  [REPORT_STATUSES.PUBLISHED]: {
    icon: 'checkCircle2',
    label: 'Published',
    tone: 'green',
  },
  [REPORT_STATUSES.ARCHIVED]: {
    icon: 'archive',
    label: 'Archived',
    tone: 'neutral',
  },
})
