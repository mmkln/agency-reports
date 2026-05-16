# UC-001 Acceptance Report - Client Overview / Status Hub

Status: MVP-complete

Date: 2026-05-09

## Scope

UC-001 delivers the client-facing status hub plus the minimum admin/team workflows required to keep that hub accurate while the project still uses localStorage as a repository adapter.

The implementation intentionally does not build chat, approvals, native analytics integrations, AI summaries, billing, or a full project-management module.

## Implemented Routes

| Route | Purpose |
| --- | --- |
| `/client/overview` | Client-facing overview/status hub |
| `/admin/clients` | Admin client list and client creation drawer |
| `/admin/client-overview` | Admin overview editor and client-safe preview/publish flow |
| `/team/tasks` | Team assigned task update workflow |
| `/client/dashboard` | Dashboard boundary surface linked from the overview |
| `/client/reports` | Report boundary surface linked from the overview |

## Acceptance Mapping

| UC-001 criterion | Implementation evidence |
| --- | --- |
| `agency_admin` can create a client | `createAdminClient` and `/admin/clients` create drawer persist clients through the repository adapter. |
| `agency_admin` can invite a `client_user` or create invite placeholder | Client setup stores primary contact details and shows an invite placeholder after creation. |
| `client_user` can log in or use current demo session | `demoSession` represents the current temporary authenticated client user. |
| `client_user` can only see their own client overview | `clientOverviewService` calls `canAccessClient` before returning data. Client routes pass the authenticated viewer unchanged. |
| `agency_admin` can set client status | `AdminClientOverviewEditor` writes client status through `saveAdminClientOverview`. |
| `agency_admin` can add current focus | Admin overview editor stores up to three focus items on the client record. |
| `agency_admin` can create projects | Admin overview editor upserts projects with progress and dates. |
| `agency_admin` can create client-visible tasks | Admin overview editor upserts tasks with `visibility` and `client_visible`. |
| `agency_team` can update assigned task status | `updateAssignedTask` enforces `taskPolicy` transitions and persists task changes. |
| Internal tasks are hidden from `client_user` | `clientOverviewService` filters tasks through client-visible active-task rules. |
| Internal notes are hidden from `client_user` | Client-facing services do not map `internal_note`; tests assert internal details are absent. |
| `agency_admin` can add latest update | Admin overview editor upserts updates with visibility controls. |
| `agency_admin` can add needed-from-client items | Admin overview editor upserts needed actions with due date/link/status. |
| `client_user` can see needed-from-client items | Overview service returns visible non-cancelled needed actions. |
| `agency_admin` can add dashboard embed/public link | Admin overview editor upserts dashboard links with provider, status, embed URL, public URL, and overview visibility. |
| `client_user` can see dashboard block if available | Overview renders the primary active/unavailable client-visible dashboard block and links to `/client/dashboard`. |
| `agency_admin` can publish latest monthly summary | Admin overview editor upserts report placeholders and sets `published_at` for published reports. |
| `client_user` can see only published/archived reports | Report visibility policy filters draft/ready reports from overview and reports routes. |
| `agency_admin` can preview overview as client | Admin overview editor opens the client-safe preview based on the same read model used by the client page. |
| `client_user` can understand status, progress, results, and next actions without chat | `/client/overview` contains status, current focus/latest update, progress, active tasks, needed actions, dashboard link, and latest report. |

## Verification

Automated checks:

```text
npm run test
npm run lint
npm run build
```

Manual/browser smoke targets:

```text
http://127.0.0.1:5173/agency-reports/client/overview
http://127.0.0.1:5173/agency-reports/admin/clients
http://127.0.0.1:5173/agency-reports/admin/client-overview?clientId=22222222-2222-4222-8222-222222222222
http://127.0.0.1:5173/agency-reports/team/tasks
```

Security/visibility cases covered by tests:

```text
- foreign client overview returns access denied
- internal tasks are not returned
- internal updates are not returned
- internal notes are not mapped to client view models
- draft/ready reports are hidden
- draft dashboards are hidden
- unavailable dashboards return controlled fallback data
```

## Residual Notes

The current authentication and persistence are demo/local only. The backend migration should replace the repository adapter while preserving the current domain services and policies.

