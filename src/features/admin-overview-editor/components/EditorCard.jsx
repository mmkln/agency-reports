import {
  Panel,
  PanelBody,
  PanelHeader,
} from '@/shared/ui'

export function EditorCard({ action, children, description, iconName, title }) {
  return (
    <Panel>
      <PanelHeader
        action={action}
        divided
        iconName={iconName}
        subtitle={description}
        title={title}
      />
      <PanelBody>{children}</PanelBody>
    </Panel>
  )
}
