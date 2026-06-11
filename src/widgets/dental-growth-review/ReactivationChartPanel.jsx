import { Panel, PanelBody } from '@/shared/ui'

import { reactivationChartLayout } from './reactivationChartTheme'
import { reactivationText } from './reactivationTypography'

export function ReactivationChartPanel({
  children,
  footer,
  rightSlot,
  subtitle,
  title,
}) {
  return (
    <Panel>
      <PanelBody className="p-6">
        <div className={reactivationChartLayout.header}>
          <div>
            <h3 className={reactivationText.sectionTitle}>{title}</h3>
            {subtitle ? (
              <p className={`mt-1 max-w-2xl ${reactivationText.sectionSubtitle}`}>
                {subtitle}
              </p>
            ) : null}
          </div>

          {rightSlot ? (
            <div className={reactivationChartLayout.headerAction}>
              {rightSlot}
            </div>
          ) : null}
        </div>

        <div className={reactivationChartLayout.body}>{children}</div>

        {footer ? (
          <p className={reactivationChartLayout.footer}>{footer}</p>
        ) : null}
      </PanelBody>
    </Panel>
  )
}
