import { Panel, PanelBody, PanelHeader } from './Panel'

export function ChartPanel({ children, footer, title }) {
  return (
    <Panel>
      <PanelHeader title={title} />
      <PanelBody>
        {children}
        {footer ? <div className="mt-1">{footer}</div> : null}
      </PanelBody>
    </Panel>
  )
}
