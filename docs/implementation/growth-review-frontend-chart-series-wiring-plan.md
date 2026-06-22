# Growth Review Frontend Chart Series Wiring Plan

## Goal

Wire the existing Growth Review hero metric cards to the backend-provided chart series without changing the visual chart components, dashboard layout, or frontend metric calculations.

## Scope

- Use the existing `/api/workspaces/:workspace_id/growth-review/` read model.
- Read chart points from `page.charts.hero_metric_series`.
- Keep backend as the owner of metric calculation and period bucketing.
- Keep frontend as a rendering adapter only.

## Implementation Checklist

- [x] Pass `page.charts.hero_metric_series` from `DentalGrowthReviewDashboard` into `HeroMetrics`.
- [x] Pass each metric's matching backend series into its existing `MetricCard`.
- [x] Render sparkline paths from `series.points[].value` only when the backend marks the series available.
- [x] Remove the synthetic sparkline data fallback derived from current/prior metric values.
- [x] Preserve existing card layout when no backend series is available.
- [x] Run frontend lint.
- [x] Run frontend build.
