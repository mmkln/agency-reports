import { cn } from '@/lib/utils'

import { useInspectorId } from './inspectorId'

const variants = {
  comfortable: {
    gap: 'gap-component',
    columns: 'md:grid-cols-2 xl:grid-cols-4',
  },
  compact: {
    gap: 'gap-control',
    columns: 'md:grid-cols-2 xl:grid-cols-4',
  },
  default: {
    gap: 'gap-6',
    columns: 'md:grid-cols-2 lg:grid-cols-4',
  },
}

const columnClasses = {
  1: '',
  2: 'md:grid-cols-2',
  3: 'md:grid-cols-2 xl:grid-cols-3',
  4: 'md:grid-cols-2 xl:grid-cols-4',
}

export function MetricGrid({ children, className = '', columns, id, variant = 'default' }) {
  const inspectorId = useInspectorId('MetricGrid', id)
  const styles = variants[variant] ?? variants.default
  const layout = columnClasses[columns] ?? styles.columns

  return (
    <section
      className={cn('grid grid-cols-1', styles.gap, layout, className)}
      id={inspectorId}
    >
      {children}
    </section>
  )
}
