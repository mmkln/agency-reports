# Design Spacing Guidelines

Spacing is the primary way this interface creates hierarchy. Use semantic spacing tokens before adding extra borders, nested backgrounds, or one-off arbitrary values.

The system keeps the existing 4/8px rhythm and adds an Apple-aligned interaction target token.

## Token Scale

| Token | Value | Tailwind examples | Use |
| --- | ---: | --- | --- |
| `micro` | 4px | `gap-micro`, `p-micro` | Tiny offsets, icon nudges, dense inline groups. |
| `tag` | 6px | `gap-tag`, `py-tag` | Badge/tag internals and compact chips. |
| `item` | 8px | `gap-item`, `mt-item` | Icon/text gaps, list item internals. |
| `control` | 12px | `gap-control`, `px-control` | Control groups and compact padding. |
| `component` | 16px | `gap-component`, `p-component` | Standard component spacing. |
| `card` | 24px | `gap-card`, `p-card` | Card content padding and medium layout gaps. |
| `panel` | 32px | `gap-panel`, `p-panel` | Large panels, dialog interiors, form groups. |
| `page` | 40px | `p-page`, `px-page` | Desktop page padding. |
| `section` | 40px | `gap-section`, `space-y-section` | Major vertical page sections. |
| `control-mini` | 28px | `h-control-mini`, `w-control-mini` | Apple mini control size; dense desktop-only controls. |
| `control-small` | 32px | `h-control-small`, `w-control-small` | Apple small control size; compact icon buttons and chips. |
| `target` | 44px | `h-target`, `w-target`, `min-h-target` | Apple regular control size and recommended iOS/iPadOS tappable target. |
| `control-large` | 52px | `h-control-large`, `w-control-large` | Apple large control size; prominent controls. |
| `layout` | 48px | `gap-layout` | Major layout columns or large empty space. |
| `control-xl` | 64px | `h-control-xl`, `w-control-xl` | Apple extra-large control size; rare hero controls. |
| `spacious` | 64px | `gap-spacious` | Rare wide separation between major regions. |
| `island` | 14px | `p-island`, `gap-island` | Compact internal padding for floating functional islands. |
| `block` | 24px | `p-block`, `gap-block` | Content block padding aligned with current cards. |
| `sidebar-inset` | 16px | `left-sidebar-inset`, `top-sidebar-inset` | Legacy floating-sidebar offset. Do not use for the primary app sidebar. |
| `app-gutter` | 24px | `p-app-gutter`, `px-app-gutter` | Outer app viewport gutter around page content. |
| `content-gutter` | 24px | `pt-content-gutter` | Standard gap below app header when a custom shell needs it. |
| `app-rail` | 72px | `ml-app-rail` | Content offset for the collapsed standard sidebar. |
| `sidebar-collapsed` | 72px | `w-sidebar-collapsed` | Collapsed standard sidebar width. |
| `sidebar-expanded` | 288px | `hover:w-sidebar-expanded` | Expanded sidebar width. |
| `search` | 240px | `min-w-search` | Standard toolbar search field width. |
| `search-compact` | 220px | `max-w-search-compact` | Compact toolbar search field width. |
| `number-field` | 80px | `w-number-field` | Compact numeric field width. |
| `inspector` | 420px | `max-w-inspector` | Standard detail/inspector column width. |
| `menu` | 160px | `min-w-menu` | Minimum popover/menu surface width. |
| `popover` | 320px | `w-popover` | Standard compact popover content width. |

## Interaction Targets

Apple's recommended tappable control target is 44x44pt on iOS and iPadOS. In this web app, use `h-target` and `w-target` for default buttons and icon buttons when the control is a primary interaction.

Apple button size references are available as semantic spacing tokens:

- Mini: `control-mini`, 28px
- Small: `control-small`, 32px
- Regular: `target`, 44px
- Large: `control-large`, 52px
- Extra large: `control-xl`, 64px

Compact controls can go smaller only when all of these are true:

- The control appears in a dense desktop-only surface.
- There is enough spacing around neighboring controls.
- The visible element remains easy to identify.
- The wrapper or hit area still avoids accidental taps.

## Layout Rules

- The space between groups should be larger than the space inside a group.
- Use whitespace, alignment, and text hierarchy before adding another bordered container.
- Keep cards and panels visually light; avoid card-in-card structures.
- Keep content cards borderless by default; use `shadow-block` only when a block needs real elevation.
- Use `bg-block` for content surfaces, `bg-sidebar` for the primary sidebar, and `bg-island` for temporary floating functional groups.
- Use `bg-surface-chrome` only for quiet internal block zones that are not floating controls.
- Use `border-border-subtle` or `border-block-border` only when separation cannot be communicated by spacing, grouped backgrounds, or separators.
- Keep island/block/control shapes concentric: `rounded-island` outside, `rounded-block` for content blocks, `rounded-control` for controls.
- Use `rounded-item` for compact rows, chips, avatars, and tooltip shells nested inside larger controls.
- Use `PageShell` with `max-w-content` for dense application pages instead of page-local `max-w-[...]` values.
- Use `ContentToolbar` for repeated search/filter/pagination rows instead of bordered local toolbar blocks.

## Practical Patterns

Badge:

```tsx
<Badge tone="info">Active</Badge>
```

Badge-like inline chip:

```tsx
<span className="inline-flex min-h-control-mini items-center justify-center rounded-full px-control py-0 text-label leading-none">
  Active
</span>
```

Page shell:

```tsx
<PageContainer>
  <PageShell>
    <PageHeader title="Jobs" />
    <ContentToolbar>...</ContentToolbar>
    ...
  </PageShell>
</PageContainer>
```

Card:

```tsx
<Card className="p-card">
  <div className="space-y-component">...</div>
</Card>
```

Default button target:

```tsx
<button className="h-target px-card text-ui">Save</button>
```

Icon button target:

```tsx
<button className="h-target w-target rounded-[10px]">...</button>
```

Compact icon button:

```tsx
<button className="h-control-small w-control-small rounded-full">...</button>
```
