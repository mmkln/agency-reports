# Growth Review Dashboard Backend Wiring Plan

## Goal

Finish wiring the current Growth Review dashboard to the single backend read model while keeping calculations in Django and keeping React as a thin rendering layer.

## Architecture Rules

- Use one read endpoint: `GET /api/workspaces/:workspace_id/growth-review/?start=&end=`.
- Backend owns metric values, chart series, funnel calculations, availability, confidence, and freshness.
- Frontend owns only query params, normalization, and rendering existing widgets.
- Do not add fake chart data or frontend metric calculations.
- Do not create new chart components unless an existing widget cannot represent the backend data.

## Implementation Checklist

- [x] Normalize backend `charts.funnel` when the endpoint provides it.
- [x] Keep a temporary compatibility path to the current top-level `funnel` payload.
- [x] Pass normalized funnel stages into the existing `FunnelView`.
- [x] Keep `HeroMetrics` wired to `charts.hero_metric_series`.
- [x] Preserve existing unavailable/empty rendering without adding user-facing setup error cards.
- [x] Run frontend lint.
- [x] Run frontend build.

## Acceptance Criteria

- Existing hero metric cards render backend series only.
- Existing patient funnel can render backend-provided chart funnel stages.
- Current backend response still works while `charts.funnel` is not yet present.
- No Growth Review chart calculation is added to frontend code.
