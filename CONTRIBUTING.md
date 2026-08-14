# Contributing to SYNTHX-7

Thanks for your interest in contributing! This document covers how to set up
the project, the workflow we follow, and the standards we hold code to.

## Code of conduct

All participants are expected to follow our
[Code of Conduct](CODE_OF_CONDUCT.md). Please report unacceptable behaviour as
described there.

## Getting started

1. Fork the repository and clone your fork.
2. Install dependencies: `npm install`.
3. Confirm everything works: `npm run check`.

The project targets **Node.js ≥ 20** (see `.nvmrc`).

## Development workflow

1. Create a branch from `main` with a short, descriptive name.
2. Make focused, atomic commits.
3. Run the full verification suite before pushing:

   ```bash
   npm run format
   npm run lint
   npm run typecheck
   npm run test
   npm run build
   ```

   …or just `npm run check`.

4. Push your branch and open a pull request.

## Pull request checklist

- [ ] Code follows the existing structure (engine logic in `src/audio`,
      state in `src/state`, UI in `src/components`).
- [ ] No new `any`, non-null assertions, or dead code; type-check passes.
- [ ] New behaviour is covered by tests.
- [ ] UI changes are keyboard-operable and screen-reader friendly.
- [ ] `npm run check` passes locally.

## Style guide

- Formatting is enforced by [Prettier](.prettierrc.json) — run `npm run format`.
- Linting is enforced by [ESLint](eslint.config.js) with type-aware rules and
  [jsx-a11y](https://github.com/jsx-eslint/eslint-plugin-jsx-a11y).
- Types live in `src/types`; prefer `import type` for type-only imports.
- Keep audio code free of React so it stays testable in isolation.

## Testing guidelines

- Pure DSP/math helpers get unit tests (`*.test.ts`).
- Components get tests via React Testing Library (`*.test.tsx`).
- End-to-end smoke coverage lives in `e2e/` (Playwright).
- Run the whole suite with `npm run test` and `npm run e2e`.

## Reporting issues

Search existing issues first. When opening a new issue, use the provided
templates and include browser/OS versions and steps to reproduce.
