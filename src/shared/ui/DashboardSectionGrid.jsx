export function DashboardSectionGrid({ children, columns = 2 }) {
  const columnClass = columns === 2 ? 'lg:grid-cols-2' : ''

  return <section className={`grid grid-cols-1 gap-6 ${columnClass}`.trim()}>{children}</section>
}
