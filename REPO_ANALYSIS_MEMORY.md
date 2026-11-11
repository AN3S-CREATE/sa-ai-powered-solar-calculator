# Repository Analysis State — SA AI-Powered Solar Calculator

## Current Analysis Phase & Progress
Phase S6 in progress: repository integration and cleanup. S4 offline conversion and S5 AN3S adoption are complete and locally verified; the accumulated tree is now on `codex/integrate-offline-an3s` for CI-gated PR integration into `main`.

## Key Architectural Insights Discovered
- The repository is a Taskade production-space export with 3 data projects, 88 flattened rows, 37 schema fields, 1 agent, 5 flows, and 3 media records.
- Active runtime source has zero `/api/taskade`, `/_taskade`, `/_genesis`, or `files.taskade.com` references; unavailable private Taskade packages are absent from dependencies.
- `genesis-data/client.ts` supplies synchronous cache access with IndexedDB primary persistence, bounded localStorage fallback, Tri-Key field mirroring, safe import/export/reset, update events, and isolated automation dispatch.
- `FloatingAgentChat.tsx` loads exported agents, caps untrusted workspace context at 12,000 characters and 50 rows per project, attempts a 15-second local OpenAI-compatible request, and falls back to a deterministic grounded responder.
- The calculator now creates one quote node per mounted calculation workflow and updates it on subsequent auto-saves, avoiding duplicate quote rows.
- Browser QA found and fixed initial document auto-scroll and a 68-pixel mobile horizontal overflow that static build checks did not expose.
- A fresh authenticated fetch on 2026-11-11 advanced the locally verified AN3S source from `ae29573` to `98d3160`; current `main` includes the official brand graphics, Motion v1, fixed-header/Hero guidance, Discipline Ledger, Chaos Gap, Strata, and AskAnswer documentation.
- The AN3S visual contract is Neon Night: `deep-space` `#03041d`, `panel` `#080a24`, pink-to-violet-to-blue neon edges, cyan focus/technology cues, Montserrat, 6/10/18px radii, glow-based elevation, and four bounded motion durations with reduced-motion fallbacks.
- Final browser QA verified the AN3S identity, locally loaded Montserrat, zero legacy UI brands, zero console/page errors, zero horizontal overflow at 1440x1100 and 390x844, working status/admin/settings/calculation/product transitions, and product view scroll position 0.
- PR review identified and remediation now covers newer localStorage fallback recovery, explicit failure when both durable stores reject a write, itemized equipment persistence, and quote-ID invalidation/recreation after workspace replacement.

## Files Deeply Reviewed
- `apps/default/scripts/seed-from-export.ts` (Summary: app/export discovery, resilient JSON parsing, schema/row flattening, Tri-Key collision ownership, deterministic media localization, and migration audit output.)
- `apps/default/src/lib/genesis-data/client.ts` (Summary: validated local CRUD, Tri-Key writes, IndexedDB/localStorage persistence, import/export/reset, and update events.)
- `apps/default/src/lib/local-automations.ts` and `src/lib/genesis-flows/client.ts` (Summary: local triggers/actions, deterministic pricing substitute, task creation, and isolated unsupported cloud actions.)
- `apps/default/src/lib/network-policy.ts`, `local-settings.ts`, and `genesis-client-shim.ts` (Summary: loopback-only default egress, local settings/secrets, placeholder resolution, validation, and bounded zero-retry proxy requests.)
- `apps/default/src/components/blocks/agent-chat/FloatingAgentChat.tsx` (Summary: agent selection, bounded grounding, streaming local inference, offline responder, and contained chat scrolling.)
- `apps/default/src/components/EnhancedSolarCalculator.tsx` and `src/App.tsx` (Summary: local calculation/flow/persistence workflow and responsive application composition.)
- `apps/default/src/config/branding.ts`, `src/index.css`, `src/components/BrandHeader.tsx`, `StatsBar.tsx`, `ProductRecommendations.tsx`, `QuoteRequestManager.tsx`, `SystemStatusChecker.tsx`, and `StandaloneControlPanel.tsx` (Summary: authoritative AN3S identity, offline tokens/assets, active-screen redesign, evidence-based claims, and local-only operational copy.)
- `AN3S-CREATE/an3s-design-system` at `origin/main` `98d3160` (Summary: current tokens, brand assets, motion rules, fixed-header guidance, and approved panel/content patterns inspected from the verified local clone after a fresh fetch.)
- `.index/architecture.md`, `.index/file-inventory.md`, `.index/key-decisions.md`, and `.index/dead-code.md` (Summary: refreshed verified project context and accepted residual debt.)

## Open Questions & Areas Needing Investigation
- Vite emits one non-fatal warning because `local-automations.ts` is both dynamically and statically imported; change only if future chunk splitting matters.
- `npm install` reports 3 audit findings (1 moderate, 2 high) under the user-mandated exact dependency pins; a pin-change security review would require explicit approval to relax those versions.
- Optional Electron or Tauri packaging was not requested and remains outside the core definition of done.
- GitHub Actions for PR #1 cannot start because the GitHub account is locked by a billing issue. The check has zero executed steps; merge and feature-branch deletion must wait for account remediation and a successful rerun.

## Decisions Made & Rationale
- Decision: Preserve all raw `manifest.json`, `projects/`, `agents/`, `automations/`, and `media/` export records unchanged. Rationale: They are provenance-bearing source records.
- Superseded decision: The 2026-11-10 choice to preserve Higher Green 4 applied to the offline-migration objective. The user explicitly requested an AN3S redesign on 2026-11-11, so the presentation layer may now change while data, workflow, security, and offline contracts remain fixed.
- Decision: Treat AN3S `origin/main` at `98d3160` as the visual source of truth and adapt its system to the solar product rather than replacing product copy with AN3S marketing content. Rationale: The user requested the design system's look and feel, not a change of product purpose.
- Decision: Remove inherited supplier metrics, contact details, and cloud-synchronisation implications from market-facing copy. Rationale: Those claims were not supported by the local export and conflicted with the standalone product boundary.
- Decision: Enforce loopback-only network access by default, including when the static app is hosted on a non-loopback origin. Rationale: This follows the explicit bounded-egress trust boundary.
- Decision: Deduplicate identical localized media by content/name while retaining both metadata mappings. Rationale: Equal SHA-256 content does not require duplicate public files, but each exported record remains addressable.
- Decision: Preserve extra root seed/dev/preview CLI arguments with explicit npm separators. Rationale: Workspace forwarding otherwise consumes flags such as `--dry-run`, `--host`, and `--port`.
- Decision: Use monotonic workspace revisions to reconcile IndexedDB and localStorage, and require at least one durable backend to acknowledge every mutation. Rationale: silent dual-backend failure and stale-primary hydration can otherwise lose records while reporting success.

## Next Immediate Steps
1. Commit and push the four verified PR review remediations on `codex/integrate-offline-an3s`, then reply to and resolve each review thread.
2. After the GitHub billing lock is cleared, rerun PR #1 CI and confirm it passes before merging.
3. Confirm the merged PR commit is contained in `origin/main` before deleting the remote and local feature branch.

## Patterns & Recurring Issues Noticed
- Exported UI components originally mixed local state with Taskade-relative network calls; the final runtime centralizes data and flow behavior in local modules.
- Browser verification is necessary for this project: scroll propagation and min-content mobile overflow were invisible to TypeScript and Vite builds.
- Windows filesystem and antivirus scanning make Vite/TypeScript operations unusually slow, but successful runs are reproducible.

## Session Log
- [2026-11-08] Protocol initialized; repository, Git history, and initial toolchain inspected.
- [2026-11-10] S1/S2 discovery and migration scaffold completed; S3 local runtime foundation added.
- [2026-11-11] S3/S4 completed. Verified 3 projects, 88 rows, 1,060 Tri-Key attributes, 3 media records, 1 agent, 5 flows, zero quarantined JSON, zero active cloud references, clean TypeScript/build, offline agent fallback, local persistence/reset, and responsive browser behavior.
- [2026-11-11] S5 started. Refetched the named AN3S repository, corrected the source revision to current `origin/main` `98d3160`, and recorded the redesign token/pattern contract before implementation.
- [2026-11-11] S5 completed. Applied AN3S branding/tokens/assets to all active surfaces, removed unsupported inherited brand claims, fixed view-transition scroll, and passed TypeScript, production build, desktop/mobile visual QA, workflow navigation, static cloud/brand scans, and project-index refresh.
- [2026-11-11] S6 started. Confirmed the remote has only `main`, zero open or merged PRs, zero review comments, zero CI workflows, no protection/rulesets, and no secret-like files in the proposed tree; created `codex/integrate-offline-an3s` and added a CI integration gate.
- [2026-11-12] PR #1 opened from `codex/integrate-offline-an3s`. Addressed all four Codex review findings and verified TypeScript, production build, newer-fallback hydration, and dual-backend failure propagation. GitHub Actions remains externally blocked before step execution by an account billing lock, so no merge or branch deletion is permitted.
