# Component Structure

This document translates Apple Human Interface Guidelines structure patterns into project rules for composing pages and reusable UI.

Official references:

- [Apple HIG: Layout](https://developer.apple.com/design/Human-Interface-Guidelines/layout)
- [Apple HIG: Sidebars](https://developer.apple.com/design/human-interface-guidelines/sidebars)
- [Apple HIG: Split views](https://developer.apple.com/design/Human-Interface-Guidelines/split-views)
- [Apple HIG: Toolbars](https://developer.apple.com/design/human-interface-guidelines/toolbars)
- [Apple HIG: Lists and tables](https://developer.apple.com/design/human-interface-guidelines/lists-and-tables)
- [Apple HIG: Search fields](https://developer.apple.com/design/human-interface-guidelines/search-fields)
- [Apple HIG: Buttons](https://developer.apple.com/design/human-interface-guidelines/buttons)
- [Apple HIG: Controls](https://developer.apple.com/design/human-interface-guidelines/controls/)
- [Apple HIG: Popovers](https://developer.apple.com/design/human-interface-guidelines/popovers)
- [Apple HIG: Materials](https://developer.apple.com/design/human-interface-guidelines/materials)
- [Apple HIG: Layout and organization](https://developer.apple.com/design/human-interface-guidelines/layout-and-organization)
- [WWDC25: Build a SwiftUI app with the new design](https://developer.apple.com/videos/play/wwdc2025/323/)

## Structural Principles

- Start with hierarchy, not decoration. The page should communicate importance through position, spacing, typography, and alignment before adding borders, fills, or cards.
- Group related controls by task. Filters, search, view controls, and destructive actions should not be mixed into one undifferentiated row.
- Keep the visible structure shallow. Avoid card-inside-card layouts, repeated bordered panels, and nested background blocks unless the nesting represents a real interaction boundary.
- Put navigation, content, and detail in distinct regions. A complex screen should read as sidebar, content list/table, and detail/inspector rather than a stack of unrelated boxes.
- Keep app structure stable across pages. Use the same shell, title, toolbar, content, and optional detail/presentation regions so navigation feels predictable.
- Keep primary actions contextual. The most important action for the current region belongs in that region's header or toolbar, not in a distant global location.
- Use overlays for temporary focused tasks. Dialogs, popovers, and sheets should handle short contextual decisions; long or persistent work belongs in a page or detail panel.
- Use materials only to separate layers. Material tokens are for overlays, floating bars, translucent panels, and depth; ordinary content regions should use standard surface/background tokens.
- Use motion to clarify continuity and feedback. Keep repeated interactions brief and avoid animating layout properties that make controls jump.

## Page Anatomy

Use this structure for product screens unless the feature has a strong reason to differ:

```text
AppShell
  SidebarNavigation
  Page
    PageHeader
      TitleBlock
      PageActions
    ContentToolbar
      SearchField
      FilterControls
      ViewControls
      ContextActions
    ContentRegion
      List | Table | Grid | Board
      EmptyState | LoadingState | ErrorState
    DetailPanel | Inspector | Dialog | Popover
```

Project implementation:

- `PageContainer` owns the outer app gutter and should not contain feature-specific layout decisions.
- `PageShell` constrains and spaces a page's main content.
- `PageHeader` from `src/shared/ui` orients the user with a title, compact metadata, and page-level actions. Use its shell variant for route headers and inline variant inside workspace wrappers.
- `ContentToolbar` groups controls that affect the content region.
- Detail panels, inspectors, sheets, dialogs, and popovers handle focused secondary work.

### Page Header

- Contains the screen title, optional compact metadata, and page-level actions.
- Do not render descriptive subtitle text under page titles. Put explanatory copy in the content region, toolbar-adjacent help, empty state, onboarding state, or a contextual help surface.
- Keep title hierarchy intact when tightening a header. A thinner page header should come from less container chrome, smaller vertical padding, fewer rows, and fewer redundant controls, not from making the title weaker.
- Do not place dense filters in the header. Filters belong in `ContentToolbar`.
- Use `text-heading` for normal product page titles. Reserve `text-display` for dashboard-level overview pages or hero metrics.

### Content Toolbar

- Contains controls that change the content region: search, filters, sort, view mode, bulk actions, and refresh.
- Keep search visually close to the list, table, or collection it searches.
- Use the shared `SearchField` for toolbar search instead of recreating icon/input markup locally. Search should behave as one compound control with consistent height, icon alignment, accessible label, focus ring, and placeholder treatment.
- Keep toolbar controls in logical groups. Search/filter controls, pagination, export, and primary actions should not collapse into one undifferentiated row.
- Labels, active-filter counts, and empty-state copy must use the same vocabulary as the underlying filter logic.
- Do not overload a toolbar with board descriptions, passive counters, and unrelated settings. Keep the default toolbar focused on the controls needed to act on the visible content.
- Move board setup, source configuration, and passive summaries into a settings dialog, inspector, popover, or collapsed detail area unless they are needed for the primary task.
- Use icon buttons with tooltips for compact repeated actions.
- Use `h-target` for default interactive controls and `h-control-small` only in dense secondary contexts.

### Top-Of-Page Triage

Before adding, keeping, or restyling any persistent region above the main table, list, board, grid, or form:

1. Identify the primary content and the next likely user action.
2. Keep at most one persistent control region before that content unless the extra region is required to complete the immediate task.
3. Ask what action each visible block enables. Search, filters, view mode, refresh, and primary actions belong in the toolbar; passive counts, setup state, source descriptions, and explanatory copy do not.
4. Move passive context into progressive disclosure: settings dialog, inspector, popover, collapsed details, empty state, onboarding state, or content-adjacent metadata.
5. If the page still feels busy, remove visible regions before changing radius, borders, shadows, colors, or density.
6. Review the combined flow of header, toolbar, counters, filters, and content together. A component that is acceptable alone can still make the page fail when placed next to adjacent chrome.

Do not solve top-of-page clutter by adding another compact row, card strip, bordered block, or decorative separator. The Apple-aligned answer is usually less persistent chrome, clearer task grouping, and faster access to primary content.

### Content Region

- Prefer tables for comparison and scanning.
- Prefer lists for item selection and navigation to a detail panel.
- Prefer grids only when visual recognition is more important than row-by-row comparison.
- Keep row text short. Put long descriptions, notes, and secondary workflows in a detail panel or inspector.
- If a selected row drives a detail panel, preserve selection until the user changes context.

### Metrics And Context Counters

- Use large metric cards only when the metric is a primary decision point for the current page or a gateway into a workflow.
- Keep passive counters close to the content they describe: beside filters, inside a toolbar-adjacent summary row, or directly above the table/list.
- Prefer compact `dl` summary rows for contextual counts such as source size, filtered count, relevant count, pattern count, or average score.
- Do not add decorative badges, subtitles, or repeated cards to counters that do not offer a user action.
- If passive counters make the toolbar or top-of-page region feel crowded, hide them behind progressive disclosure instead of creating another visible row.
- A metric block should earn its visual weight. If it does not help the user decide what to do next, reduce it to metadata.
- Use alignment, compact labels, and whitespace before card grids for supporting data.

### Detail Panel And Inspector

- Use a detail panel when the user needs to inspect or edit the selected item without losing list context.
- Use an inspector for secondary properties and metadata.
- Avoid making detail panels look like another page nested inside the current page. They should be visually lighter than the primary content region.
- Use `grid-cols-inspector` for standard content/detail layouts and `max-w-inspector` for drawer-like inspector widths.

## Navigation

- Use the sidebar for stable top-level destinations and high-frequency navigation.
- Use top navigation only for a small flat set of destinations where labels remain readable and the page content still starts quickly.
- Choose sidebar, top navigation, or split view from the product hierarchy before styling active states. Do not switch navigation patterns to solve a visual dissatisfaction with individual buttons.
- Keep role changes and demo role switchers independent from shell decisions. Role can filter destinations and permissions without requiring a different navigation component.
- Treat persistent sidebars and headers as anchored app shell, and reserve floating navigation treatment for temporary controls or explicitly requested floating chrome.
- For selected sidebar items, use rounded neutral selection fills, label/icon contrast, and focus states before adding any color.
- For collapsed/expanded sidebar items, keep the icon anchor stable and reveal labels independently. Do not animate icon alignment, padding, or justification.
- Do not use decorative active bars, colored rails, side strips, dot markers, or timeline-like ornaments for navigation selection.
- Keep sidebar hierarchy shallow. One expanded level is usually enough; two levels should be rare.
- Use clear labels and consistent ordering. Do not use color as the only way to distinguish destinations.
- Do not force fixed colors across all sidebar icons. Let icons inherit the semantic current color unless they communicate status.
- Keep account, workspace, and settings actions visually separate from primary navigation.

## Lists And Tables

- Use consistent row height and aligned columns so repeated data is easy to scan.
- Put the most identifying text first, then status, metadata, metrics, and actions.
- Keep inline row actions secondary. Primary workflows should happen through selection, toolbar actions, or a detail panel.
- Parent table actions should open the management surface for a related workflow, not jump directly into another actor's flow. Use explicit labels such as preview when a cross-role route is intentionally exposed for review.
- Use separators and whitespace before adding filled row backgrounds.
- Empty, loading, and error states belong inside the content region they replace.

## Forms And Controls

- Structure forms as label, control, help/error text, and optional trailing action.
- Keep labels close to their controls. Use `text-label` for labels and `text-text-secondary` or `text-text-muted` for supporting text.
- Badges and badge-like chips must vertically center their text with `inline-flex`, `items-center`, `justify-center`, `min-h-control-mini`, and `leading-none`. Do not override shared `Badge` padding with local `py-*` classes unless the component is no longer visually a badge.
- Use the control that matches the decision: checkbox/toggle for binary values, segmented control for small exclusive choices, select/menu for larger option sets, slider/stepper/input for numeric values.
- Filter labels must name the exact domain field or interpretation being filtered. For example, use reporting month, published date, created date, assignee, or client rather than vague labels such as period or date when more than one meaning is possible.
- Before adding a date or period filter, decide whether it targets a point date or a range relation. If it filters records whose range contains a month, use a label and option set that makes that containment behavior clear.
- Prefer a select built from real available values when filtering an existing collection by month, status, owner, or another finite domain value. Use raw date/month inputs primarily when the user is entering a new value or intentionally searching an arbitrary range.
- Use `bg-control`, `hover:bg-control-hover`, `bg-control-selected`, and `border-control-border` for standard interactive primitives. Do not reuse content block tokens such as `bg-block` for inputs or buttons.
- Use shared primitives and semantic control sizes before local control styling. Avoid arbitrary heights and custom backgrounds when `h-target`, `h-control-small`, `h-control-large`, or an existing variant fits.
- Use a compound input with an attached trailing action when one value can be typed, pasted, generated, uploaded, or selected by another short action. Keep the text field and action visually unified through shared height, border, radius, and background.
- Hide native file inputs behind styled controls and render file state separately. Browser-provided file input chrome should not be treated as final product UI.
- Do not use a generic button when a specific control communicates the state more clearly.
- Destructive actions need a destructive role and should be visually separated from routine actions.

## Buttons And Actions

- Use one primary action per meaningful region.
- Page-level creation commands must use the semantic create-action API: `PageHeader.primaryAction`, `AdminClientWorkspaceHeader.primaryAction`, or `PagePrimaryAction`.
- Feature pages must not locally choose color, radius, shadow, height, or icon size for create actions such as New Client, New Task, New Dashboard, or New Report.
- If a create action needs a different appearance because it appears in a compact workspace header, encode that through the action component context instead of page-local classes.
- Do not present multiple actions when they route to the same destination or produce the same state. Combine them into one clearly labeled action until the product has separate behavior to expose.
- Preview actions must say what is being previewed and from which source. Avoid generic labels when draft, published, client-visible, and admin-only states matter.
- Use system blue roles (`primary`/`action`) for actions, focus, selection, and links.
- Use secondary or ghost actions for routine commands.
- Use destructive styling only for destructive or irreversible operations.
- Prefer icon-only buttons for familiar tools when space is constrained, and provide a tooltip.
- Use `duration-motion-fast` and `ease-motion-standard` for routine hover/focus feedback.

## Popovers, Dialogs, And Materials

- Use popovers for short contextual controls, previews, or pickers.
- Use dialogs for decisions that block the current workflow.
- Use a detail panel or page for long forms, multi-step flows, or content that users need to reference while working.
- Apply material tokens only where the component floats above, blurs, or visually separates from underlying content.
- Do not apply Liquid Glass or material effects to ordinary content cards, list rows, tables, dashboards, or static metric panels.
- Remove custom backgrounds from navigation and controls before adding new custom effects.
- Compose dialogs and drawers with the shared overlay structure: primitive `DialogContent` or `SheetContent` owns the material surface, border, radius, shadow, and blur; `OverlayHeader`, `OverlayBody`, and `OverlayFooter` own internal chrome and separators.
- Do not build drawers as `fixed` page divs. Use the controlled `Sheet` primitive through `src/shared/ui` so focus management, escape handling, overlay layering, close affordances, and material styling remain consistent.
- Use semantic overlay sizing tokens such as `max-w-modal-lg`, `max-w-modal-xl`, `max-h-overlay`, `max-h-overlay-body`, `max-h-overlay-detail-body`, `max-w-sheet-sm`, and `max-w-sheet-md`; do not put repeated modal viewport math in page or feature components.
- Avoid local overrides such as `bg-surface`, `bg-white`, `border-0`, `shadow-xl`, or hardcoded hex values on modal and drawer shells unless the shared primitive cannot express the required behavior.

## Shared UI Ownership

Project-level composition should be expressed through `src/shared/ui` wrappers instead of repeating structure in pages.

Recommended wrapper categories:

```text
Primitive wrappers
  Button, IconButton, Input, Select, Badge, Card

Structure wrappers
  PageShell, PageHeader, ContentToolbar, DetailPanel, DataTableShell
  OverlayHeader, OverlayBody, OverlayFooter

Feedback wrappers
  EmptyState, LoadingState, ErrorBlock
```

- Add or update a `shared/ui` wrapper when the same structural pattern appears in more than one feature.
- Keep page components focused on feature data and behavior.
- Keep shadcn/Radix primitives in `src/components/ui` as the low-level layer.
- Do not import directly from shadcn in a page when a project wrapper already exists.

## Component Ownership Gate

Before adding or moving a component, choose the lowest correct ownership layer:

```text
pages
  Route shell only: route params, runtime wiring, top-level composition.

widgets
  Reusable screen sections that combine entities/features for presentation.

features
  User workflows, forms, modals, imports, exports, editors, mutations, and workflow hooks.

entities/*/ui
  Domain-object presentation such as status badges, meta rows, labels, icons, and read-only object summaries.

shared/ui
  Product-agnostic primitives and generic structural wrappers only.
```

Root feature components should stay small. Prefer this structure for complex editors and workflow-heavy screens:

```text
FeatureRoot.jsx
  uses useFeatureWorkflow()
  renders header/actions/dialogs
  renders FeatureSections

useFeatureWorkflow.js
  load, autosave, save, publish, restore, delete confirmation state

FeatureSections.jsx
  layout and callback wiring for the visible sections

SectionName.jsx
  one editor/list/detail area

LocalPrimitive.jsx
  feature-specific card/row/header used only inside this feature
```

Pages and app code should import feature roots through `features/<feature-name>`. Do not import `features/<feature-name>/components/*` from pages; those files are internal unless the feature root explicitly exports them as public API.

Use `docs/design/component-implementation-audit.md` as the standing audit checklist before large UI refactors.

## Review Checklist

Before finishing a structural UI change, verify:

- The screen has clear navigation, header, toolbar, content, and detail/overlay regions where applicable.
- Related controls are grouped by task and positioned near the content they affect.
- The hierarchy works without extra nested borders or filled containers.
- Primary, secondary, destructive, and contextual actions are visually distinct.
- Lists/tables remain scannable and do not hide important information inside cramped row actions.
- Repeated structure belongs in `src/shared/ui` rather than being copied across pages.
