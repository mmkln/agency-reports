import { Badge } from '@/shared/ui'

export function ClinicPublishReadinessBadge({ readiness }) {
  if (!readiness) {
    return null
  }

  return (
    <Badge tone={readiness.tone}>
      {readiness.label}
    </Badge>
  )
}

export function ClinicPublishReadinessNote({ readiness }) {
  if (!readiness || readiness.isReady) {
    return null
  }

  return (
    <p className="max-w-xl text-label text-warning-foreground">
      {readiness.blockingReasons[0]}
    </p>
  )
}
