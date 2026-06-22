import {
  EmptyState as SharedEmptyState,
  Panel,
  PanelBody,
  PanelHeader,
} from '@/shared/ui'

import { cn } from '@/lib/utils'

export function SectionCard({ action, children, className, contentClassName, description, iconName, title }) {
  return (
    <Panel className={className}>
      <PanelHeader
        action={action}
        divided
        iconName={iconName}
        subtitle={description}
        title={title}
      />
      <PanelBody className={cn(contentClassName)}>{children}</PanelBody>
    </Panel>
  )
}

export function EmptyState({ children, iconName = 'helpCircle' }) {
  return <SharedEmptyState iconName={iconName} title={children} />
}
