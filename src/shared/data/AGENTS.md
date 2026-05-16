# Shared Data Instructions

This directory owns generic fixture/data helpers only.

Rules:

- Do not hide domain repositories or business policies here.
- If data behavior belongs to a product object, move it to the relevant entity/domain/feature.
- Keep shared data helpers deterministic and testable.
