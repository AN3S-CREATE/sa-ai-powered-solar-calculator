# File Inventory

Last refreshed: 2026-11-11

| Path | Purpose / key symbols | Status |
| --- | --- | --- |
| `.gitattributes` | Git text-file normalization policy. | Active |
| `.gitignore` | Excludes dependencies (including recoverable partial-install quarantines), build/test output, local environment files, logs, and editor/OS artifacts. | Active |
| `.nvmrc` | Records Node.js 24 as the preferred local runtime. | Active |
| `.github/workflows/ci.yml` | GitHub Actions gate for pinned install, dry-run export discovery, TypeScript, production build, and active Taskade-cloud reference rejection on PRs and `main`. | Active |
| `.index/README.md` | Context-index purpose and maintenance rules. | Active |
| `.index/file-inventory.md` | Structured repository inventory. | Active |
| `.index/architecture.md` | High-level components, offline data flows, AN3S presentation layer, and constraints. | Active; S5 refreshed |
| `.index/key-decisions.md` | Lightweight technical and process decision log, including AN3S provenance and CI-gated PR integration. | Active; S6 refreshed |
| `.index/dead-code.md` | Evidence-backed dead-code and technical-debt register. | Active |
| `.index/context-refresh-log.md` | Index refresh history through verified S5 AN3S completion. | Active |
| `REPO_ANALYSIS_MEMORY.md` | Persistent state for multi-message repository analysis; S6 tracks CI-gated integration and cleanup. | Active |
| `README.md` | Repository overview, local setup commands, layout, and Taskade integration boundary. | Active |
| `package.json` | Root npm workspace and shared development/build/typecheck/preview commands; forwards seed, dev, and preview CLI arguments to the app workspace. | Active |
| `manifest.json` | Taskade export metadata for the Geologix IO Energy space. | Active |
| `agents/01K50T1A1F12Z63DDM6SE1HZV9.json` | Exported Solar Knowledge Test Agent definition. | Active export data |
| `automations/*.json` | Five exported Taskade automation definitions. | Active export data |
| `projects/*.json` | Three exported Taskade project/data definitions. | Active export data |
| `media/*/metadata.json` | Metadata for three exported media records. | Active export data |
| `media/*/*.pdf` | Two copies of the exported AI training-data PDF. | Binary source material |
| `media/*/*.jpg` | Exported Higher Green 4 visual reference. | Binary source material |
| `apps/default/package.json` | Frontend manifest with exact React 18.3.1, TypeScript 5.4.5, Vite 5.4.8, React plugin 4.3.1, Tailwind 3.4.17, and tsx 4.21.0 pins; includes seed/dev/build/typecheck/preview scripts. | Active; clean install verified |
| `apps/default/index.html` | Vite HTML entry, AN3S favicon/touch icon, offline-solar metadata, and root mount element. | Active |
| `apps/default/postcss.config.js` | ESM PostCSS pipeline enabling Tailwind and Autoprefixer. | Active |
| `apps/default/public/an3s/*` | Offline AN3S wordmark, compact wordmark, loader, mark, app-icon exports, and source-revision manifest copied from verified design-system `98d3160`. | Active brand assets |
| `apps/default/public/fonts/*` | Self-hosted Montserrat variable font and SIL Open Font License for fully offline typography. | Active brand assets |
| `apps/default/tailwind.config.js` | Tailwind source scanning plus semantic HSL, chart, and sidebar token mappings. | Active |
| `apps/default/tsconfig.json` | Strict TypeScript configuration with `@/*` and local Genesis-client paths. | Active |
| `apps/default/vite.config.ts` | Vite React configuration with source and private-package shim aliases. | Active |
| `apps/default/scripts/seed-from-export.ts` | Idempotent export discovery/seeding CLI with `apps/*` inventory, dry-run, Tri-Key extraction, collision logging, malformed-file isolation, missing-project initialization, and deterministic media localization by both export-folder and canonical `space-files` IDs. | Active; dry-run and generation verified |
| `apps/default/.taskade/branding.json` | AN3S product publication metadata retained for export-host compatibility; code-level branding remains authoritative. | Active export configuration |
| `apps/default/src/main.tsx` | Browser entry point; applies code-level AN3S title/description metadata, mounts `App` inside `GenesisRoot`, and installs the standalone control panel. | Active |
| `apps/default/src/App.tsx` | Top-level view/state coordinator for calculator, products, local records, status, chat, and quote UI; composes the shared AN3S header and resets scroll position on view transitions. | Active; AN3S redesign verified |
| `apps/default/src/config/branding.ts` | Code-level AN3S creator/product names, metadata copy, and offline asset paths; authoritative over exported Taskade branding. | Active |
| `apps/default/src/index.css` | Tailwind entry plus AN3S Neon Night tokens, local Montserrat face, panel/action patterns, starfield, motion, focus, and reduced-motion rules. | Active |
| `apps/default/src/vite-env.d.ts` | Vite client type declaration; malformed literal newline from the export was corrected. | Active |
| `apps/default/src/assets/react.svg` | React logo asset from the base template. | Likely unused; review before removal |
| `apps/default/src/components/*.tsx` | Calculator, results, AI/chat, quote, product, status, guide, administration, and supporting UI components. | Active / some exports may be unreferenced |
| `apps/default/src/components/BrandHeader.tsx` | Shared fixed AN3S wordmark/product header with optional local status and records actions. | Active |
| `apps/default/src/components/StandaloneControlPanel.tsx` | AN3S-styled local LLM/egress settings, JSON export/import, two-step reset, POPIA notice, and manual automation triggers. | Active; browser verified |
| `apps/default/src/components/Header.tsx` | Legacy alternate header now rebranded to AN3S/local-only copy; not mounted by the current app shell. | Unreferenced; retained |
| `apps/default/src/components/AIAssistant.tsx` | Legacy deterministic assistant copy rebranded to AN3S and stripped of inherited company claims; current shell uses `FloatingAgentChat`. | Unreferenced; retained |
| `apps/default/src/components/ChatInterface.tsx` | Legacy compact chat copy rebranded to AN3S/local planning; current shell uses `FloatingAgentChat`. | Unreferenced; retained |
| `apps/default/src/components/UserGuide.tsx` | Legacy guide copy rebranded to AN3S with local-settings support guidance. | Unreferenced; retained |
| `apps/default/src/components/ProposalGenerator.tsx` | Legacy proposal output rebranded to AN3S and labelled as locally generated planning material. | Unreferenced; retained |
| `apps/default/src/components/blocks/agent-chat/FloatingAgentChat.tsx` | Exported-agent selector, bounded workspace grounding, local OpenAI-compatible streaming, deterministic offline fallback, and chat-pane-contained auto-scroll. | Active; browser verified |
| `apps/default/src/components/EnhancedSolarCalculator.tsx` | AN3S-styled local calculator/form with deterministic pricing-flow validation and create-once/update-thereafter quote persistence. | Active; calculation and navigation verified |
| `apps/default/src/components/StatsBar.tsx` | Evidence-based offline capability strip using migration counts instead of inherited supplier/impact claims. | Active |
| `apps/default/src/components/ProductRecommendations.tsx` | AN3S panel/ledger product selection, quantities, ZAR pricing, financing comparison, and local quote/configuration persistence; inherited supplier contact claims removed. | Active; browser verified |
| `apps/default/src/components/QuoteRequestManager.tsx` | AN3S-styled local quote recovery, autosave, retry, and persistence status surface with local-only copy. | Active; browser verified |
| `apps/default/src/components/SystemStatusChecker.tsx` | AN3S ledger-style diagnostics for local data, pricing flows, agents, knowledge, and browser update events. | Active; browser verified |
| `apps/default/src/components/Loading.css` | Loading animation styles. | Active if `Loading.tsx` is used |
| `apps/default/src/lib/genesis.tsx` | Taskade lifecycle logging, error boundary, and root provider. Uses local structural types so the public standalone build does not require a private Taskade package. | Active, platform-aware |
| `apps/default/src/lib/genesis-data/client.ts` | Synchronous-cache local data engine with factory seed, IndexedDB primary persistence, bounded localStorage fallback, Tri-Key CRUD mirroring, import/export/reset, validation, events, and automation dispatch. | Active; browser persistence/reset verified |
| `apps/default/src/lib/genesis-flows/client.ts` | Validated local form submission, manual flow, and attribute-update facade. | Active; build and calculator-flow verified |
| `apps/default/src/lib/local-automations.ts` | Exported-flow interpreter supporting local task creation, deterministic pricing actions, and isolated offline skips for cloud-only actions. | Active; manual controls and pricing flow verified |
| `apps/default/src/lib/genesis-client-shim.ts` | Local `@taskade/genesis-client` proxy shim with secret resolution, bounded egress, and 15-second zero-retry requests. | Active; type/build verified |
| `apps/default/src/lib/genesis-auth.tsx` | Single-tenant offline auth provider and `useAuth()` hook backed by local settings. | Active; type/build verified |
| `apps/default/src/lib/local-settings.ts` | Validated local operator, LLM, egress, multi-profile, and secret-alias settings store. | Active |
| `apps/default/src/lib/network-policy.ts` | Loopback-only-by-default outbound request guard and 15-second bounded fetch helper; external hosts require explicit operator opt-in. | Active |
| `apps/default/src/lib/theme-bridge.ts` | Taskade editor theme messaging and CSS-variable bridge. | Active, platform integration |
| `apps/default/src/lib/utils.ts` | `cn()` utility combining `clsx` with `tailwind-merge`. | Active utility |
| `apps/default/src/utils/learningEngine.ts` | Browser-local pattern learning and recommendation adjustment engine. | Active |
| `apps/default/src/utils/smartCalculator.ts` | Standard plus learning-adjusted solar sizing and comparison logic. | Active |

## Inventory notes

- The remote baseline contains 46 tracked files. The original local export also included an untracked root README and Git attributes file.
- 2026-11-11: mechanically normalized staged source/configuration whitespace, including AN3S-touched components and the bundled font licence; no runtime behaviour changed.
- Generated dependency folders and build outputs were absent at baseline and must remain ignored by Git.
- A symbol-level component usage audit has not yet been completed; uncertain files are not classified as dead.
- `node_modules.partial-20261110/` directories are ignored, recoverable quarantines from interrupted pre-lockfile installs and are not project source.
