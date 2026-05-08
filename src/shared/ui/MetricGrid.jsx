export function MetricGrid({ children, className = '' }) {
  return (
    <section className={`grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4 ${className}`.trim()}>
      {children}
    </section>
  )
}
