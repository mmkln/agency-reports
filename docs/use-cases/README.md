# Use Case Specifications

This folder contains product-level use case specifications for the Agency Client Portal Aggregator.

Use these documents as the source of truth for product behavior, permissions, screen requirements, acceptance criteria, and scope boundaries.

## MVP Use Cases

| ID | Name | Status | File |
| --- | --- | --- | --- |
| UC-001 | Client Overview / Status Hub | MVP-ready | [UC-001-client-overview-status-hub.md](./UC-001-client-overview-status-hub.md) |
| UC-002 | Embedded Marketing Dashboard | MVP-ready | [UC-002-embedded-marketing-dashboard.md](./UC-002-embedded-marketing-dashboard.md) |
| UC-003 | Monthly Summary / Report Archive | MVP-ready | [UC-003-monthly-summary-report-archive.md](./UC-003-monthly-summary-report-archive.md) |
| UC-004 | Client Performance Dashboard | Frontend/localStorage MVP implemented | [UC-004-client-performance-dashboard.md](./UC-004-client-performance-dashboard.md) |
| UC-005 | Needed From Client / Blockers | MVP-planning-ready | [UC-005-needed-from-client-blockers.md](./UC-005-needed-from-client-blockers.md) |

## Implementation Rule

Before implementing or changing a screen, data model, permission rule, or flow connected to a use case, read the relevant UC document first.

If a product decision conflicts with the UI design system, preserve the product rule and adapt the UI around it.

## Mature Client Control Center Mapping

The use cases define capabilities. The mature client-facing information architecture is documented in [Client Control Center Information Architecture](../research/client-control-center-information-architecture.md).

| Use case / capability | Mature client destination | Product ownership |
| --- | --- | --- |
| UC-001 - Client Overview / Status Hub | Overview | Compact control home with previews and links. |
| UC-002 - Embedded Marketing Dashboard | Reports & Dashboards / Source Dashboard | External dashboard embed/link visibility. |
| UC-003 - Monthly Summary / Report Archive | Reports & Dashboards / Report Archive | Published report archive and report reader. |
| UC-004 - Client Performance Dashboard | Reports & Dashboards / Current Performance | Native interpreted business-value analytics. |
| UC-005 - Needed From Client / Blockers | Action Needed | Client obligations, responses, and blocker visibility. |
| Tasks / progress | Projects | Client-visible workstreams and project detail. |
| Updates / activity | Updates | Curated client communication history. |
| Files / links | Files & Links | Explicitly visible resources and deliverables. |

Do not split client navigation by implementation use case when the mature destination groups several capabilities together. For example, UC-002, UC-003, and UC-004 are separate capabilities, but the client-facing destination is `Reports & Dashboards`.
