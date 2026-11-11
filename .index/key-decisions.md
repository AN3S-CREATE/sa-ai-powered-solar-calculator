# Key Decisions

## 2026-11-08 — Preserve Taskade export records as source material

- **Decision:** Treat `agents/`, `automations/`, `projects/`, `media/`, and `manifest.json` as exported source records, not generated build output.
- **Rationale:** The manifest identifies a production Taskade export, and the application refers to IDs represented in these records.
- **Consequence:** Environment setup may add local build scaffolding but must not silently rewrite export records.

## 2026-11-08 — Use `main` as the initial branch

- **Decision:** Attach the local `main` branch to the existing `origin/main` history rather than creating an unrelated initial commit.
- **Rationale:** The supplied GitHub repository already contained two commits, and all 46 exported remote files matched the local export after enabling Windows long-path support.

## 2026-11-08 — Add a public standalone frontend toolchain

- **Decision:** Use an npm workspace with Vite, TypeScript, Tailwind, and PostCSS, and replace the unavailable Taskade logger type import with equivalent local structural types.
- **Rationale:** The exported package referenced a missing build script and three unpublished `@taskade/*` packages. Only one private package was imported, and that import was type-only; runtime Taskade hooks remain unchanged.
- **Consequence:** The frontend can build and run locally, while `/api/taskade/...` features still require the platform host or a compatible proxy.

## 2026-11-08 — Reduce the exported template manifest to referenced packages

- **Decision:** Retain the six runtime libraries imported by current source (`react`, `react-dom`, `react-error-boundary`, `lucide-react`, `clsx`, and `tailwind-merge`), the three CSS build packages, and the required TypeScript/Vite development packages; remove unreferenced template declarations.
- **Rationale:** Two broad installs stalled while extracting hundreds of packages. The complete static import inventory contained no references to the removed libraries, and no test files or scripts used the removed test toolchain.
- **Consequence:** Future code that introduces another library must add it explicitly to the manifest.

## 2026-11-10 — Preserve the existing interface during offline migration

- **Decision:** Use the exported Higher Green 4 interface as the accepted visual specification and limit visible changes to the required local control panel and agent chat.
- **Rationale:** The requested work is an offline runtime conversion with explicit data, persistence, security, and verification contracts—not a redesign.

## 2026-11-10 — Follow the exact migration toolchain pins

- **Decision:** Pin TypeScript 5.4.5, React/React DOM 18.3.1, Vite 5.4.8, `@vitejs/plugin-react` 4.3.1, Tailwind 3.4.17, and `tsx` 4.21.0.
- **Rationale:** Exact reproducibility and no unpinned runtime installs are explicit acceptance constraints and supersede the earlier floating-version bootstrap.

## 2026-11-11 — Enforce the standalone egress boundary literally

- **Decision:** Permit loopback HTTP requests by default and require explicit local-settings opt-in for every non-loopback host, including a non-loopback same-origin deployment.
- **Rationale:** The standalone security contract defines host-based bounded egress; treating same-origin as implicitly trusted could bypass that contract if the static application were hosted remotely.

## 2026-11-11 — Adopt the verified AN3S design system as the product identity

- **Decision:** Replace the exported supplier/workspace branding with the official AN3S wordmark, Montserrat typography, Neon Night tokens, pink/cyan panel hierarchy, glow-based elevation, and bounded motion patterns from `AN3S-CREATE/an3s-design-system` revision `98d3160fefd9133284d263285bcb6dc1e9d3ac7d`.
- **Rationale:** The user explicitly requested that the market-facing application carry the creator's AN3S brand and look-and-feel. Using the inspected repository revision prevents invention of a substitute design system.
- **Consequence:** Code-level `src/config/branding.ts` is authoritative; assets and fonts are bundled locally; raw export metadata remains unchanged as provenance; unsupported inherited supplier claims and contact details are not shown in runtime UI.

## 2026-11-11 — Gate integration through GitHub Actions and a feature PR

- **Decision:** Integrate the accumulated offline migration and AN3S redesign through `codex/integrate-offline-an3s` and a pull request, with CI running the exact pinned install, dry-run seeding, typecheck, build, and cloud-reference scan.
- **Rationale:** The repository had no workflows, rulesets, prior PRs, or branch protection. A PR plus repeatable CI creates an auditable pre-merge gate instead of pushing a large verified change directly to `main`.
