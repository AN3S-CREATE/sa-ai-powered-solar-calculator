# SA AI-Powered Solar Calculator

A self-contained South African solar and hybrid-energy calculator migrated from a Genesis workspace export. The Vite + React application runs locally without Taskade APIs, private npm packages, cloud storage, or a network connection.

## Requirements

- Node.js 20.11.0 LTS or newer (Node 24 is recorded in `.nvmrc`)
- npm 10 or newer

## Local setup

From the repository root:

```powershell
npm install
npm run seed
npm run dev
```

The development server prints the local browser address. Other useful checks are:

```powershell
npm run typecheck
npm run build
npm run preview
```

## Project layout

- `apps/default/` — standalone React 18, TypeScript, Vite, and Tailwind application.
- `apps/default/scripts/seed-from-export.ts` — repeatable export-to-local-data migration.
- `apps/default/src/data/` — generated seed, agent, flow, media-map, and audit bundles.
- `apps/default/public/media/` — generated local copies of exported media.
- `agents/`, `automations/`, `projects/`, and `media/` — untouched raw export records.
- `.index/` — maintained project context and architecture index.

## Offline operation

Workspace records are stored in IndexedDB with an in-memory cache and a bounded `localStorage` fallback. The floating agent chat uses the deterministic offline responder by default and can optionally connect to an OpenAI-compatible model on `localhost` (Ollama or LM Studio). External network egress is blocked unless the operator explicitly enables it in the Local Standalone Control Panel.

Run the migration without writing artifacts to inspect an export:

```powershell
npm run seed -- --dry-run
```

The settings button in the lower-right corner opens local AI settings, workspace import/export, two-step factory reset, the local secret vault, and manual automation triggers. Workspace exports can contain personal information; keep them on the local workstation and apply appropriate POPIA data-minimisation and retention controls.

Do not commit API tokens, `.env.local`, runtime quote submissions, or other newly collected personal information. The original export files are retained unchanged for provenance.
