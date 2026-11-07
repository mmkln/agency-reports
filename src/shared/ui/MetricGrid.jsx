import { cn } from '@/lib/utils'

import { useInspectorId } from './inspectorId'

const variantClassName = {
  comfortable: 'gap-component md:grid-cols-2 xl:grid-cols-4',
  compact: 'gap-control md:grid-cols-2 xl:grid-cols-4',
  default: 'gap-6 md:grid-cols-2 lg:grid-cols-4',
}

export function MetricGrid({ children, className = '', id, variant = 'default' }) {
  const inspectorId = useInspectorId('MetricGrid', id)

  return (
    <section
      className={cn('grid grid-cols-1', variantClassName[variant] ?? variantClassName.default, className)}
      id={inspectorId}
    >
      {children}
    </section>
  )
}
