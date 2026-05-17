# UC-001 Local Storage Architecture

UC-001 currently uses browser `localStorage` as a temporary persistence layer.

This is an implementation detail. Product/domain code must not know whether records come from `localStorage`, Supabase, a REST API, or another backend.

## Dependency Direction

```text
page
-> domain service
-> repository port
-> localStorage adapter
```

## Current Adapter

```text
src/app/providers/repositories/createLocalStoragePortalRepository.js
src/app/providers/repositories/portalRepository.js
src/app/providers/repositories/portalSeedData.js
```

The adapter exposes entity repositories:

```text
clients
profiles
projects
tasks
updates
clinicProfiles
clinicLocations
clinicServiceLines
patientAcquisitionSnapshots
neededFromClient
dashboardLinks
reports
```

Domain services receive this repository object as a dependency.

## Repository Port Contract

Every entity repository exposed by `portalRepository` should keep this minimum shape:

```text
findById(id: string) -> record | null
list() -> record[]
listByClientId(clientId: string) -> record[]
upsert(record) -> record
```

Repository-level helpers:

```text
reset() -> snapshot
```

Current notes:

```text
- All ids are string UUIDs.
- `upsert` is the write primitive used by current admin/team services.
- Domain services must receive the repository object; they must not import the localStorage adapter directly.
- A future API/Supabase adapter should satisfy the same port first, then pages can be moved to async data loading without changing policy logic.
```

## Storage Version And Validation

The local adapter stores data under:

```text
agency-reports.portal.v2
```

Snapshots include:

```text
__schemaVersion
```

The adapter validates snapshots before returning records:

```text
- missing snapshot -> seed default data
- malformed JSON -> reseed default data
- missing table arrays -> fill missing tables from seed data
- missing schema version -> normalize and save current schema version
- missing seed records -> merge newly introduced seed records by `id` without overwriting existing local edits
```

This keeps corrupted browser storage from leaking undefined table errors into domain services or UI.

## Table Mapping

```text
clients -> repositories.clients
profiles -> repositories.profiles
projects -> repositories.projects
tasks -> repositories.tasks
updates -> repositories.updates
clinic_profiles -> repositories.clinicProfiles
clinic_locations -> repositories.clinicLocations
clinic_service_lines -> repositories.clinicServiceLines
patient_acquisition_snapshots -> repositories.patientAcquisitionSnapshots
needed_from_client -> repositories.neededFromClient
dashboard_links -> repositories.dashboardLinks
reports -> repositories.reports
```

Use these same table names for backend schema planning unless a backend migration document explicitly changes them.

## QA Reset / Reseed

In development, the repository is exposed for manual QA reset:

```text
window.__agencyPortalRepository.reset()
```

This removes the current local snapshot and recreates it from `portalSeedData`.

Use this before browser QA when seeded scenarios need to be predictable.

Do not call this from production UI.

## Rules

```text
- Do not import localStorage inside domain services, policies, widgets, or pages.
- Domain services should receive repositories as arguments.
- Policies should stay pure and synchronous.
- The localStorage adapter may be replaced later by an API/Supabase adapter with the same repository shape.
- Seed/demo data belongs to the adapter layer until real backend data exists.
```

## First Implemented Vertical Slice

```text
src/domain/services/clientOverviewService.js
src/pages/client/overview/ClientOverviewPage.jsx
src/widgets/client-overview/
```

The client overview already reads through the repository abstraction and applies domain policies before rendering client-facing data.
