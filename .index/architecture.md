# Architecture

## Overview

This repository is an offline-first **AN3S Solar Intelligence** application produced from a historical Taskade workspace export. It combines an AN3S-branded browser application with local agent, automation, project, and media records while retaining the raw export as provenance.

## Main components

1. **Frontend application** — `apps/default/src/`
   - React 18 and TypeScript component tree.
   - `main.tsx` applies code-level AN3S metadata and mounts `App.tsx` through `GenesisRoot`.
   - `App.tsx` coordinates the main calculator, product recommendations, quote management, administration, system status, and chat views.
   - `config/branding.ts`, `BrandHeader.tsx`, `index.css`, and offline `/public/an3s` plus `/public/fonts` assets implement the AN3S Neon Night visual contract without a runtime network dependency.
   - Vite provides local development and production bundling; PostCSS runs Tailwind and Autoprefixer.
   - The root npm workspace forwards development, build, typecheck, and preview commands to `apps/default`.

2. **Calculation and learning logic** — `apps/default/src/utils/`
   - `smartCalculator.ts` performs standard system sizing, cost, savings, ROI, and learning-adjusted comparisons.
   - `learningEngine.ts` stores learned patterns in browser-local state and returns recommendation multipliers.

3. **Standalone compatibility seam** — `apps/default/src/lib/`
   - `genesis.tsx` retains a local error boundary and an optional injected lifecycle logger without making network calls.
   - `theme-bridge.ts` can consume an optional parent theme message but is not required for standalone operation.
   - Active runtime source contains no `/api/taskade`, `/_taskade`, `/_genesis`, or `files.taskade.com` references.

4. **Exported platform data**
   - `agents/`, `automations/`, and `projects/` contain JSON records.
   - `media/` contains exported documents, an image, and metadata.
   - `manifest.json` identifies the export version, source space, and application.

5. **Offline migration pipeline** — `apps/default/scripts/seed-from-export.ts`
   - Reads raw exports without modifying them.
   - Produces deterministic local project, agent, automation, and media-map bundles.
   - Flattens nested Quill/Delta rows and mirrors attributes under field ID, attribute path, and display-name keys.
   - Quarantines malformed JSON per item, localizes media with hash-aware collision handling, and records audit decisions.

6. **Standalone runtime services** — `apps/default/src/lib/`
   - `genesis-data/client.ts` starts synchronously from the generated seed, hydrates from IndexedDB/localStorage, and exposes validated Tri-Key CRUD plus import/export/reset.
   - `local-automations.ts` and `genesis-flows/client.ts` execute local task actions and deterministic offline substitutes while isolating unsupported cloud actions.
   - `genesis-client-shim.ts` retains the private-package import surface while resolving runtime-only secrets and enforcing a loopback-only-by-default network policy; non-loopback hosts require explicit operator opt-in.
   - `genesis-auth.tsx` supplies a local single-tenant operator context without OIDC or cloud identity.

## Primary browser flow

`main.tsx` -> `GenesisRoot` + `GenesisAuthProvider` -> `App.tsx` -> local agent/calculator -> product, quote, status, and administration views. Data mutations go through the Tri-Key local engine; exported flows run through the isolated local interpreter; optional model calls are loopback-only unless external egress is explicitly enabled.

View transitions reset document scroll to the top so the fixed 64px AN3S header and destination heading remain aligned. The main surface preserves the AN3S pink-asks/cyan-answers order, while compact mobile layouts stack those panels without horizontal overflow.

## Environment constraints (2026-11-08)

- Git `main` tracks `origin/main` at `https://github.com/AN3S-CREATE/sa-ai-powered-solar-calculator.git`.
- The root is an npm workspace with `apps/default` as its application package.
- Root seed/dev/preview wrappers preserve additional CLI arguments through an explicit npm argument separator.
- Local development targets Node.js 20.11+; `.nvmrc` selects the installed Node.js 24 runtime.
- Core build versions are pinned exactly: React 18.3.1, TypeScript 5.4.5, Vite 5.4.8, React plugin 4.3.1, Tailwind 3.4.17, and tsx 4.21.0.
- Vite, TypeScript, Tailwind, and PostCSS configuration is verified by clean install, TypeScript, seed, production-build, and HTTP 200 preview runs.
- Private/unpublished Taskade packages were removed from the standalone dependency graph. `genesis.tsx` retains the same runtime global contract through local structural TypeScript types.
- The exported platform JSON and media are source records and should not be rewritten as build artifacts.

## Security and privacy notes

- Quote and calculator components handle names, email addresses, phone numbers, and property/energy information. Do not commit runtime user submissions or secrets.
- Browser storage and exported project JSON should be reviewed before production use for personal-information handling.
- Keep environment files out of Git except a redacted `.env.example` if configuration variables are introduced.
