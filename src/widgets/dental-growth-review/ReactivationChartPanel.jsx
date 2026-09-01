import { Panel, PanelBody } from '@/shared/ui'
import { DashboardExplanationPopover } from '@/features/growth-review-dashboard-explanation'

import { reactivationChartLayout } from './reactivationChartTheme'
import { reactivationText } from './reactivationTypography'

export function ReactivationChartPanel({
  children,
  explanationKey,
  explanation,
  explanationEditor,
  footer,
  rightSlot,
  subtitle,
  title,
}) {
  return (
    <Panel>
      <PanelBody className="p-6">
        <div className={reactivationChartLayout.header}>
          <div className="min-w-0">
            <div className="flex items-center gap-tag">
              <h3 className={reactivationText.sectionTitle}>{title}</h3>
              {explanationKey && explanation ? (
                <DashboardExplanationPopover
                  {...explanationEditor}
                  explanationKey={explanationKey}
                  explanation={explanation}
                  key={`${explanationEditor?.campaignId ?? ''}:${explanationKey}`}
                />
              ) : null}
            </div>
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
