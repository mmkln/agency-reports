import { Panel, PanelBody } from '@/shared/ui'
import { ChartExplanationPopover } from '@/features/growth-review-chart-explanation'

import { reactivationChartLayout } from './reactivationChartTheme'
import { reactivationText } from './reactivationTypography'

export function ReactivationChartPanel({
  children,
  chartKey,
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
              {chartKey && explanation ? (
                <ChartExplanationPopover
                  {...explanationEditor}
                  chartKey={chartKey}
                  explanation={explanation}
                  key={`${explanationEditor?.campaignId ?? ''}:${chartKey}`}
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
