import { useInspectorId } from './inspectorId'

export function DashboardSectionGrid({ children, columns = 2, id }) {
  const inspectorId = useInspectorId('DashboardSectionGrid', id)
  const columnClass = columns === 2 ? 'lg:grid-cols-2' : ''

  return <section id={inspectorId} className={`grid grid-cols-1 gap-6 ${columnClass}`.trim()}>{children}</section>
}
