export function canPublishClinicRecord(record, isDirty) {
  return Boolean(record.id)
    && !isDirty
    && record.publish_state !== 'published'
    && record.publish_readiness?.isReady
}
