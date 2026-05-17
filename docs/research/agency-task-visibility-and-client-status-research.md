# Agency Task Visibility And Client Status Research

```text
Document type: Research synthesis and product decision memo
Product area: Agency Client Portal Aggregator
Focus: agency tasks, client visibility, admin review/publish, client status portal, and needed-from-client workflow
Status: Product direction reference for task/client-status UX changes
Research date: 2026-05-17
Related docs:
- docs/project-brief.md
- docs/mvp-scope.md
- docs/frontend-architecture.md
- docs/research/client-control-center-information-architecture.md
- docs/research/client-analytics-dashboard-ui-recommendations.md
- docs/use-cases/UC-001-client-overview-status-hub.md
- docs/use-cases/UC-005-needed-from-client-blockers.md
```

## 1. Core Finding

Real small and mid-sized agencies do not need another full project management workspace for clients.

They need a controlled client-facing transparency layer above their internal work systems.

The repeated pattern across the supplied research and spot-checked sources is:

```text
Internal PM system
-> curated account-manager/admin review layer
-> client-facing status portal
```

The client-facing portal should answer:

```text
1. What is the current status?
2. What is the agency working on?
3. What has changed recently?
4. What is blocked?
5. What do you need from me?
6. Where are the reports and dashboards?
7. Who owns the relationship?
```

It should not expose the agency's raw execution workspace.

## 2. Research Sources And Confidence

### 2.1 Strong Signals

The strongest evidence came from real practitioner discussion and product feedback around client access, private comments, and client-facing PM views:

```text
- Reddit agency discussion: raw PM list/kanban views can look messy to clients.
- Reddit agency discussion: agencies commonly keep Jira/Asana internal and give clients PDFs, Basecamp, Notion, or simpler progress summaries.
- Asana Forum: agencies want clients to see selected tasks, dates, and descriptions without seeing internal comments.
- Asana Forum: mirror boards are a painful workaround when a tool lacks safe client visibility.
- Basecamp product docs: client-facing work is private by default, then explicitly shared.
- Teamwork/Productive/Accelo docs: client users, private/internal comments, approvals/signoffs, and preview-as-client patterns are established product capabilities.
```

Use these as high-confidence direction for product behavior.

### 2.2 Medium Signals

The broader market research across reporting tools, client portals, consulting blogs, G2/Capterra-style reviews, and vendor docs is useful for positioning:

```text
- Reporting tools mostly solve dashboards, reports, and scheduled delivery.
- Client portal tools often solve files, billing, forms, requests, and client tasks.
- DIY portals in Notion, Trello, Airtable, Softr, and similar tools often break down around permissions, branding, and client isolation.
- Agencies often need embedded dashboards rather than a new native analytics engine.
- Clients usually need a summary, action items, and interpretation more than raw data.
```

Use these as product positioning and UX hierarchy signals.

### 2.3 Weak Or Cautionary Signals

Some sources are vendor-authored, vendor-adjacent, review aggregations, or promotional threads. Treat these as supporting context, not proof:

```text
- Vendor comparison pages
- Product marketing pages
- Consultant blogs without raw interview data
- G2/Capterra summaries when they are not tied to exact workflow examples
- Reddit threads that heavily promote a named tool
- Claims that no product has a specific feature without exhaustive verification
```

Do not use these alone to add large MVP features.

## 3. Product Positioning Decision

This product should be positioned as:

```text
A client-facing agency status portal that aggregates current work, needed client actions, embedded dashboards, reports, and curated updates.
```

It should not be positioned as:

```text
- a ClickUp / Asana / Teamwork replacement
- a reporting dashboard replacement
- a native analytics platform
- a client chat replacement
- a billing or file storage system
- a full approval/proofing platform in MVP
```

The market gap is not "agencies lack tools."

The gap is:

```text
Clients do not have one clear, safe, branded place to understand status, progress, needed actions, reports, and dashboards without seeing internal agency chaos.
```

## 4. Accepted Product Rules

### 4.1 Client Overview Is The Main Client Product

The client-facing primary screen should be the Client Overview / Client Control Center, not a task workspace.

Recommended client overview hierarchy:

```text
1. Current status
2. Needed from client / Action needed
3. Active work / progress
4. Latest curated update
5. Embedded dashboard preview or link
6. Latest report
7. Recent client-visible activity
8. Agency contact / account owner
```

Client users should not land in a kanban board, table, or raw task list by default.

### 4.2 Needed From Client Is First-Class

Needed From Client should be treated as a first-class workflow, not as a secondary note inside tasks.

The strongest client-facing action surface is:

```text
Needed From Client / Action Needed
```

It should cover:

```text
- approvals needed
- files/assets needed
- access needed
- feedback needed
- decisions needed
- budget/scope confirmations
- report or launch sign-off
```

An internal task with `waiting_client` should create, reference, or clearly connect to a client-facing needed-from-client item. The client should not need to inspect the internal task to understand what they must do.

### 4.3 Tasks Are Internal Operations First

Tasks should remain an agency execution surface.

The team task workspace should prioritize:

```text
- assigned work
- due work
- blocked work
- waiting-on-client work
- client-safe summary drafting
- internal note keeping
```

Do not expand the team task surface into a full PM clone unless a future use case explicitly requires it.

### 4.4 Admin / Account Manager Is The Publishing Gate

The default client-facing publishing flow should be:

```text
Team updates task internally
-> team optionally writes client-safe summary
-> item is marked ready for review
-> agency_admin / account manager reviews and edits
-> agency_admin / account manager publishes client-facing state
```

This protects the product from the main risk found in the research:

```text
internal comments, internal notes, or raw operational detail leaking into the client view.
```

Future permissions may allow trusted team members to publish directly, but that should not be the default MVP rule.

### 4.5 Privacy By Default

All operational records should be internal by default.

Client visibility must be explicit:

```text
visibility = internal | client_visible
```

Rules:

```text
- internal_note is never visible to client_user
- internal task comments are never visible to client_user
- client_safe_summary is the client-facing text
- draft reports are never visible to client_user
- unfinished dashboard links are never visible to client_user
- cancelled or internal-only needed-from-client records are hidden unless a use case says otherwise
```

### 4.6 Embedded Reports And Dashboards Beat Native Analytics In MVP

The product should use external dashboard embeds and links first:

```text
- Looker Studio
- AgencyAnalytics
- Databox
- Whatagraph
- DashThis
- Swydo
- ReportGarden
- Oviond
- custom URL
```

Every embed should have:

```text
- fallback open-in-new-tab link
- unavailable state
- last-updated or source metadata where available
```

Do not build a native chart/reporting engine before the client status workflow is proven.

## 5. Current Project Implications

### 5.1 Current Architecture Direction Is Mostly Correct

The current project already matches the research in several important ways:

```text
- Client Overview is a central product surface.
- Tasks are separate from client overview.
- Needed From Client has a dedicated use case.
- Dashboard links are external/embed oriented.
- Reports are human-written summaries and links.
- Domain services and policies own visibility behavior.
- Internal notes and draft records are hidden from client-facing services.
```

Do not undo these boundaries.

### 5.2 Strengthen The Review/Publish Layer

The main gap to address before expanding UI complexity is the admin/account-manager review layer.

For task-derived client visibility, the product should support a small publish state rather than direct exposure:

```text
publish_state = draft | ready_for_review | published
```

Useful metadata:

```text
last_published_at
last_published_by
client_safe_summary_updated_at
```

Useful admin filters:

```text
- ready for client review
- client-visible but stale
- missing client-safe summary
- waiting on client
- blocked
- recently published
```

### 5.3 Keep Client Tasks As Cards Or Work Summaries

If client-visible tasks appear in the client portal, render them as simplified cards or active-work summaries.

Client-visible task card fields:

```text
title
client_safe_summary
status label
target date
related project or campaign
needed action, if any
last updated
```

Do not show by default:

```text
- internal note
- raw internal comments
- time tracking
- profitability
- internal priority
- internal blocker diagnostics
- all subtasks
- raw assignee discussion
```

### 5.4 Keep UC-005 Lightweight

The research validates `Needed From Client`, but it does not require a full approval/proofing system in MVP.

Recommended MVP interpretation:

```text
Needed From Client = universal client action/request workflow.
```

Approval Lite can grow later from repeated request types.

Do not immediately build:

```text
- full proofing
- document signing
- multi-step approval routing
- creative annotation
- version history
- legal approval audit workflows
```

### 5.5 Avoid Expanding Scope Into Analytics Or Billing

The broader market research mentions KPI tiles, budget bars, retainer hours, invoices, custom domains, white-label email, and billing integrations.

For this project's MVP, treat these as later considerations unless a use case explicitly requires them.

Do not add these as task/client-status requirements:

```text
- native KPI dashboard engine
- retainer budget bar
- time tracking
- billing/invoice management
- custom dashboard builder
- full white-label theming system
- complex notification preferences
```

## 6. UI Direction

### 6.1 Team Task Workspace

The team task workspace should be list/inbox-first.

Good sections:

```text
- Needs attention
- Waiting on client
- Today
- Upcoming
- Done
```

Good filters:

```text
- client
- project
- status
- visibility
- scope: mine / all
- publish state when added
```

Task detail should keep:

```text
- status selection
- blocker reason
- waiting-on-client context
- client-safe summary
- internal notes
```

### 6.2 Admin Task / Client Workspace

The admin view should focus on review, publishing, and client-facing quality control.

Recommended admin surfaces:

```text
- all tasks by client
- client-visible tasks
- ready for review
- stale client-visible items
- waiting-on-client items
- blocked items
- needed-from-client queue
- preview as client
```

### 6.3 Client View

The client view should be a status portal, not a task application.

Recommended client modules:

```text
- Current Status
- Needed From You
- Active Work
- Latest Update
- Dashboard
- Latest Report
- Recent Activity
- Contact
```

Avoid default client modules:

```text
- kanban board
- dense table
- full task database
- raw activity log
- internal comments
- analytics-only dashboard as the landing page
```

## 7. Status Language

Internal task statuses may remain:

```text
todo
in_progress
waiting_client
blocked
done
```

Client-facing labels should be softer and action-oriented:

| Internal status | Client-facing label |
| --- | --- |
| `todo` | Up next / Planned |
| `in_progress` | In progress / We are working on it |
| `waiting_client` | Waiting on you |
| `blocked` | Needs attention / Pending external |
| `done` | Delivered / Completed |

Only use `Waiting on you` when the blocker is truly a client-side action.

Internal or vendor/platform blockers should be translated into client-safe language.

## 8. What Not To Build From This Research

Do not use this research as permission to build:

```text
- a full ClickUp/Asana/Teamwork clone
- client-facing kanban as the default UI
- mirror client boards
- client editing of internal agency tasks
- full approval/proofing workflow in MVP
- native BI or charting engine
- retainer hours/budget tracking in MVP
- invoice, contract, or billing workflows
- notifications for every task update
- raw activity feeds
- highly customizable task workflows/statuses
```

These ideas may be useful later, but they are not the current product wedge.

## 9. Product Wedge

The defensible product wedge is:

```text
controlled client visibility
```

That means:

```text
- internal agency work stays operational
- clients get a clean status layer
- needed client actions are obvious
- dashboards and reports are embedded or linked
- admin/account manager controls the client-facing narrative
- visibility rules prevent internal leaks
```

## 10. Open Questions For Future Validation

Before expanding beyond the current MVP, validate with real agency owners/account managers:

```text
1. Do clients prefer active-work cards, project milestones, or weekly summaries?
2. Who owns client-facing publishing in small agencies: founder, account manager, strategist, or delivery lead?
3. How often do clients log into portals without email reminders?
4. Which client actions are most common: approval, file upload, access sharing, feedback, budget confirmation, or content review?
5. Should waiting-client reminders be automatic or controlled by the account manager?
6. Should client-facing due dates be exact dates or softer labels such as this week / next week?
7. Do agencies want later imports from ClickUp/Asana/Teamwork, or a lightweight standalone workspace?
8. What amount of task detail reduces status questions without creating client micromanagement?
9. Should client replies create comments, needed-from-client responses, or internal tasks?
10. Does a visible retainer/budget bar build trust or create unnecessary budget disputes?
```

## 11. Decision Summary

Use this research to guide current product work as follows:

```text
Build:
- Internal Task Workspace
- Admin Review/Publish Layer
- Client Status Portal
- Needed From Client Queue
- Embedded Reports/Dashboards

Do not build now:
- Full PM replacement
- Full approval/proofing platform
- Native analytics engine
- Billing/time-tracking platform
- Client-facing raw task board
```

The next product work should therefore improve the connection between internal task updates, admin-reviewed client-safe summaries, client overview status, and needed-from-client actions.
