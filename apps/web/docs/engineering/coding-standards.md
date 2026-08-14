# SmartPulse Coding Standards

## Architecture

- Pages should orchestrate nothing.
- Application services coordinate use cases.
- Builders orchestrate multiple engines.
- Engines contain business reasoning.
- Services expose a simple public API.
- UI components should not contain business logic.

## TypeScript

- Avoid `any`.
- Prefer explicit types.
- Keep interfaces focused on a single responsibility.
- Model the real lifecycle of data.

## Quality

- Run `npx tsc --noEmit` after every meaningful change.
- Refactor instead of duplicating logic.
- Keep one source of truth for business rules.

## Project Structure

Every new domain should include:

- Types
- Engine
- Service
- Builder or Analyzer (where appropriate)
- `index.ts`
- At least one consumer

## Naming

- Builders assemble.
- Engines reason.
- Services expose.
- Repositories persist.