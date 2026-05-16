# Design Typography

This product uses an Apple-inspired system typography model: one system UI stack, semantic text levels, readable defaults, and tabular figures for data.

## Font Stack

Use the project `font-sans` token. It maps to:

```txt
-apple-system, BlinkMacSystemFont, SF Pro Text, SF Pro Display, Inter, system sans-serif
```

Do not import custom font constants only to build ordinary class names. Use Tailwind typography tokens in JSX.

## Type Scale

The scale follows Apple Dynamic Type defaults for iOS where practical, adapted to the dashboard's existing semantic names.

| Token | Apple reference | Size | Line height | Weight | Use |
| --- | --- | ---: | ---: | ---: | --- |
| `text-display` | Large Title emphasized | 34px | 41px | 700 | Main page titles and modal titles. |
| `text-heading` | Title 2 emphasized | 22px | 28px | 600 | Section titles and card titles. |
| `text-body` | Body | 17px | 22px | 400 | Main descriptions, paragraphs, table body copy. |
| `text-ui` | Subhead/Callout blend | 15px | 20px | 500 | Buttons, menus, compact controls, table row labels. |
| `text-label` | Footnote emphasized | 13px | 18px | 600 | Field labels, table headers, badges, metadata. |
| `text-indicator` | Caption 2 emphasized | 10px | 12px | 700 | Tiny numeric overlays such as notification count badges. Do not use for normal labels. |
| `text-data` | Title 1 emphasized | 28px | 34px | 700 | Key metrics and prominent numeric values. |

## Rules

- Prefer `text-text-primary`, `text-text-secondary`, and `text-text-muted` for hierarchy.
- Keep letter spacing at `0` in product UI. Do not use negative tracking.
- Do not use all-caps labels as a default style. If existing data tables use uppercase, keep it local and intentional.
- Keep body text at or above 17px for primary reading surfaces.
- Use `tabular-nums` for prices, scores, counts, rates, dates, and aligned numeric columns.
- Avoid ultra-heavy weights for functional UI. Use size, spacing, and semantic color before adding weight.

## Tailwind Examples

Page title:

```tsx
<h1 className="text-display text-text-primary">Dashboard</h1>
```

Section title:

```tsx
<h2 className="text-heading text-text-primary">Market Signals</h2>
```

Body copy:

```tsx
<p className="text-body text-text-secondary">
  Track pricing, demand, and opportunity quality across the market.
</p>
```

Table header:

```tsx
<th className="text-label text-text-muted">Score</th>
```

Metric:

```tsx
<p className="text-data tabular-nums text-text-primary">92</p>
```

## Implementation Map

- Tailwind typography tokens: `src/index.css`.
- Inline typography escape hatch: `src/shared/theme/typography.js`.
- Text color roles: `src/index.css`
