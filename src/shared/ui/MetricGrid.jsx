import { useInspectorId } from './inspectorId'

export function MetricGrid({ children, className = '', id }) {
  const inspectorId = useInspectorId('MetricGrid', id)

  return (
    <section id={inspectorId} className={`grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4 ${className}`.trim()}>
      {children}
    </section>
  )
}
