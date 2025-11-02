# StoreFront

## Project Documentation

Core docs have moved under `docs/` for clarity:

- [Architecture Overview](docs/ARCHITECTURE.md)
- [Coding Guidelines](docs/CODING_GUIDELINES.md)
- [AI Guide](AI_GUIDE.md) (kept at root for tooling ingestion)
- State Schemas: `SCHEMAS/feature_state/*`
- [Agentic Spec-to-PR Workflow](docs/AGENTIC_WORKFLOW.md)
- [Feature Tickets](FEATURES/)

When adding a feature:
<!-- 1. Update OpenAPI (`API/openapi.yaml`). -->
1. Add/adjust state schema JSON.
2. Follow coding guidelines & architecture patterns.
3. Extend tests (unit + e2e) and update docs if patterns change.

