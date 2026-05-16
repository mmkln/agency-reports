import { useInspectorId } from './inspectorId'

export function StatCard({ id, label, value }) {
  const inspectorId = useInspectorId('StatCard', id)

  return (
    <div id={inspectorId} className="min-w-0 rounded-control bg-material-thin px-component py-card">
      <span className="mb-1.5 block text-label font-normal text-text-secondary">{label}</span>
      <strong className="block text-data text-text-primary">{value}</strong>
    </div>
  )
}
