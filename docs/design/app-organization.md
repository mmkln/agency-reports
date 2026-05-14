# App Organization And UX Structure

This document maps current Apple Human Interface Guidelines and WWDC25 design guidance to the product-level structure of this app: shell, navigation, pages, toolbars, content regions, detail panels, and temporary presentations.

Official references:

- [Apple HIG: Layout](https://developer.apple.com/design/Human-Interface-Guidelines/layout)
- [Apple HIG: Sidebars](https://developer.apple.com/design/human-interface-guidelines/sidebars)
- [Apple HIG: Split views](https://developer.apple.com/design/Human-Interface-Guidelines/split-views)
- [Apple HIG: Toolbars](https://developer.apple.com/design/human-interface-guidelines/toolbars)
- [Apple HIG: Search fields](https://developer.apple.com/design/human-interface-guidelines/search-fields)
- [Apple HIG: Lists and tables](https://developer.apple.com/design/human-interface-guidelines/lists-and-tables)
- [Apple HIG: Popovers](https://developer.apple.com/design/human-interface-guidelines/popovers)
- [WWDC25: Get to know the new design system](https://developer.apple.com/videos/play/wwdc2025/356/)
- [WWDC25: Meet Liquid Glass](https://developer.apple.com/videos/play/wwdc2025/219/)
- [WWDC25: Build a SwiftUI app with the new design](https://developer.apple.com/videos/play/wwdc2025/323/)

## Product Structure

Use a stable app anatomy:

```text
AppShell
  Sidebar
  AppContent
    Header
    PageContainer
      PageShell
        PageHeader
        ContentToolbar
        ContentRegion
        DetailPanel | Inspector | Sheet | Dialog | Popover
```

- The sidebar and header are persistent app shell regions. Keep them anchored to the viewport/content edge by default; use material/island treatment only for temporary overlays, popovers, menus, and explicitly requested floating controls.
- Pages, tables, charts, forms, metrics, and cards are content. They should use block/surface/background tokens and stay visually calmer than navigation.
- Keep the same page anatomy across dashboard, lists, boards, and workflow screens so users do not have to relearn structure.
- Avoid page-specific shells when shared wrappers can express the same anatomy.
- For client-scoped admin work, the client is the workspace container. Overview, Tasks, Requests, Dashboards, Reports, Access, and Activity should appear as sibling surfaces under the same client context, not as unrelated pages that happen to share a `clientId`.
- Separate publishing surfaces from operational workflow surfaces. A client overview editor publishes authored communication and may show compact links to live workflows; it should not become the full task manager, request manager, report manager, dashboard manager, access panel, or activity feed.
- Do not solve information-architecture problems with visual wrappers. If a screen needs labels like "what the client sees" or "agency workspace" to explain itself, reassess ownership and navigation before tuning cards, borders, spacing, or color.

## Space And Layout

- Use a clear outer app gutter before adding extra panels.
- Keep the main content constrained with `max-w-content` on dense app pages.
- Use `max-w-readable` for page title actions, compact metadata, and long text outside the page header.
- Use `max-w-form` for single-purpose forms like login.
- Use `grid-cols-inspector` or `max-w-inspector` for list/detail and board/detail layouts.
- Prefer spacing, alignment, and typography over hard section borders.
- Do not make full pages look like a stack of bordered cards. Cards are for repeated content items, contained tools, and metrics.

## Navigation

- Sidebars expose stable top-level destinations and should remain shallow.
- Top navigation is appropriate for a small, flat set of primary destinations. Move to a sidebar only when the app has enough stable destinations, nested workspace areas, or high-frequency switching to justify persistent vertical navigation.
- Do not split the app shell by role just because roles exist. Split shell structure only when the roles have materially different navigation models; otherwise keep one stable shell and vary allowed destinations/actions.
- Keep navigation visually quieter than page content. Selected states should be clear but restrained, using neutral fills, contrast, and spacing before saturated color or decorative markers.
- Keep navigation, page commands, search, notifications, and account controls as separate groups. A destination is not a command, and a command should not look like a destination.
- Sidebar selection uses neutral rounded fills, stronger text/icon contrast, and focus state. Do not add active bars, rails, colored strips, dots, or decorative markers.
- If a content hierarchy becomes deeper than two levels, introduce a content list or detail panel instead of adding more sidebar depth.
- Keep account/workspace/settings actions visually separated from primary destinations.
- Use object names for navigation and section labels. Prefer Overview, Tasks, Requests, Dashboards, Reports, Access, and Activity over abstract audience labels such as client-facing, internal, connected workflow, or agency workspace.

## Toolbars And Search

- A toolbar acts on the content in the current view. It is not a general dumping ground for page actions.
- Group toolbar items by task: search, filters, view mode, pagination, export, and primary actions should be visually legible groups.
- Put search close to the collection it searches. For split/list views, search belongs in the toolbar for that list.
- Keep default toolbars short. If context, counters, filters, search, and settings all appear together, split them by priority and hide secondary information behind progressive disclosure.
- Do not put passive source summaries, explanatory copy, or setup status into the default toolbar just because they can fit there. Toolbars should expose controls that change or act on the visible content.
- Do not mix dense filters into a page title area. Page titles orient; toolbars manipulate content.
- Do not add descriptive subtitles under page titles. If explanatory copy is needed, place it inside the affected content region, empty state, onboarding state, or help surface.
- Use `ContentToolbar` for repeated page control rows instead of local bordered rows.

## Content, Lists, And Detail

- Use tables for comparison and scanning.
- Use lists or grids for selecting an item that opens detail.
- Use a detail panel or inspector when the user needs to inspect or edit an item without losing list context.
- Preserve selection while the user works in the detail panel.
- Avoid making detail panels look like nested pages. They should be lighter than the primary content region.
- Put passive source/filter/result counters near the content they explain, not as a large standalone dashboard section.
- Reserve large stat-card grids for overview pages where the metrics are the main content or directly drive a user decision.

## Presentations

- Use popovers for small contextual choices and previews.
- Use dialogs for short blocking decisions.
- Use sheets or drawers for focused temporary work.
- Move long, persistent, or reference-heavy workflows into a page or detail panel.
- Presentations should originate from a clear action and return the user to the same context.

## UX Rules

- Keep controls predictable: familiar placement is more important than novelty.
- Make the current location obvious with page titles, selected navigation, and consistent content anatomy.
- Use progressive disclosure for advanced filters and settings.
- Use short, specific labels. Remove redundant words that repeat the page title or app name.
- Do not create "choice theater". A menu, dropdown, segmented control, or mode switch must expose options that change data, permissions, destination, or rendering in a way the user can understand.
- When previewing another audience's experience, label the preview by visibility and source of truth. For example, distinguish "published client version" from "saved draft preview" only when both versions actually exist.
- Preserve content visibility when controls appear; floating controls should not dominate the page.
- Default page chrome should reveal the primary content quickly. Avoid stacked setup cards, counter strips, and toolbar blocks before the table/list unless each visible block supports the immediate task.
- When improving a messy page, audit the sequence of neighboring regions, not only the requested component. Header, toolbar, filters, counters, alerts, and content must read as one workflow.
- Do not restyle clutter. First remove duplicated regions, demote passive context, and collapse secondary setup/details. Only then tune spacing, radius, color, or shadow.
- Before shortening a long page with sticky navigation, tabs, accordions, or grouped zones, ask whether the page owns too many jobs. Moving a workflow to its owning surface is usually better than making a mixed-purpose page easier to scroll.
- Keep navigation transitions stable. Users should not see intermediate states where a sidebar row is wide but only shows a centered icon, or where labels affect icon alignment.
- Empty, loading, and error states replace the content region they describe.

## Implementation Rules

- Use `PageShell`, `PageHeader`, and `ContentToolbar` from `src/shared/ui` for page-level structure.
- Use `PageContainer` only as the app-level page gutter, not as a feature-specific layout component.
- Use semantic layout tokens: `p-app-gutter`, `pt-content-gutter`, `ml-app-rail`, `max-w-content`, `max-w-readable`, `max-w-form`, `max-w-inspector`, `max-w-sheet-sm`, `max-w-sheet-md`, `max-w-modal-lg`, `max-w-modal-xl`, `max-w-viewport-safe`, `max-h-overlay`, `max-h-overlay-body`, `max-h-overlay-detail-body`, `max-w-detail-value`, `max-w-title`, `max-w-chip`, `min-w-table-sm`, `min-w-table-lg`, `min-w-status-trigger`, `min-w-status-menu`, `grid-cols-overview`, `grid-cols-inspector`, `grid-cols-job-detail`, `grid-cols-settings`, `grid-cols-signal-filters`, `w-sidebar-collapsed`, `hover:w-sidebar-expanded`, `min-w-search`, `max-w-search-compact`, `w-number-field`, and `w-popover`.
- Do not introduce hardcoded widths for repeated layout roles when a semantic token exists.
