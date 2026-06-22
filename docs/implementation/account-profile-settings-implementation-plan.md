# Account Profile Settings Implementation Plan

- [x] Add role-neutral account profile domain service.
- [x] Move profile mutation tests from client settings to account profile tests.
- [x] Replace the client-scoped profile editor with an account-scoped feature.
- [x] Keep client settings scoped to workspace/company/team/access settings.
- [x] Add a global `/account/settings` route for every authenticated role.
- [x] Add an Account settings action to the account menu.
- [x] Verify focused domain tests.
- [x] Verify lint, build, and relevant e2e coverage.

Verification note: full `npx eslint src`, `npm test`, `npm run build`, and `npm run e2e` pass. The full E2E suite currently reports 62 passing tests.
