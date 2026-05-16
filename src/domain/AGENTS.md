# Domain Instructions

Domain code owns business rules and product policies.

Rules:

- Keep status transitions, permissions, visibility, validation, and lifecycle rules here or in the owning entity/domain service.
- Do not put React components or Tailwind classes in domain code.
- Do not read or write browser storage directly from domain logic unless it is an explicit adapter boundary.
- UI should ask domain services/policies what is allowed instead of rebuilding business rules locally.
