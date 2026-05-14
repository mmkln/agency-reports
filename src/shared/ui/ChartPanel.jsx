import { Panel, PanelBody, PanelHeader } from './Panel'
import { useInspectorId } from './inspectorId'

export function ChartPanel({ children, footer, id, title }) {
  const inspectorId = useInspectorId('ChartPanel', id)

  return (
    <Panel id={inspectorId}>
      <PanelHeader title={title} />
      <PanelBody>
        {children}
        {footer ? <div className="mt-1">{footer}</div> : null}
      </PanelBody>
    </Panel>
  )
}
