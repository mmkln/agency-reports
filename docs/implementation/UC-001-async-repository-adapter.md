# UC-001 Async Repository Adapter Notes

## Purpose

UC-001 still persists data through the localStorage repository, but the app now has an async application-layer data client:

```text
src/app/providers/repositories/createAsyncPortalDataClient.js
```

Pages should call domain services through:

```text
runtime.dataClient.read((repositories) => domainReadService({ repositories, ...args }))
runtime.dataClient.write((repositories) => domainWriteService({ repositories, ...args }))
```

Domain services remain synchronous and storage-agnostic. This keeps business logic easy to test while making page flows behave like API calls.

## Current Local Behavior

The async client wraps the existing local repository and supports QA simulation:

```text
latencyMs
failureRate
```

The QA config is stored under:

```text
agency-reports.async-qa
```

Example value:

```json
{
  "latencyMs": 500,
  "failureRate": 0.1
}
```

## Migration Path

When Supabase/API is introduced:

```text
1. Keep page components calling runtime.dataClient.
2. Replace createAsyncPortalDataClient internals with an API/Supabase adapter.
3. Keep domain services as validation/policy/view-model logic where practical.
4. Move server-only enforcement to backend/RLS.
5. Keep local tests for domain behavior and add integration tests for adapter methods.
```

The target is adapter replacement, not page rewrites.

## Stage 8 Coverage

Async-ready loading/error behavior is currently wired into:

```text
- Admin Clients
- Client Overview
- Admin Overview Editor
```

Other pages still use the same runtime repositories directly where the workflow is lower risk. They can be migrated incrementally by wrapping reads/writes with `runtime.dataClient`.
