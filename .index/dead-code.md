# Dead Code and Technical Debt Register

No code is confirmed dead at initialization.

| Path / area | Evidence | Risk / impact | Recommended action | Priority | Status |
| --- | --- | --- | --- | --- | --- |
| `apps/default/package.json` build scripts | Baseline scripts referenced absent `scripts/build.mjs`. Pinned Vite scripts now pass install, seed, typecheck, and production build. | Resolved configuration gap. | No further action. | High | Resolved |
| `apps/default/src/assets/react.svg` | Present from the apparent React base template; usage not yet found during initial entry-point review. | Low-value repository clutter if truly unused. | Confirm with a full reference search before removal. | Low | Investigate |
| Frontend component set | `App.tsx` directly imports only a subset of the component files; indirect usage has not been fully traced. | Unused components may mask divergent implementations. | Run TypeScript/build checks and a reference audit before classifying anything as dead. | Medium | Investigate |
| Legacy alternate UI components | `AIAssistant.tsx`, `ChatInterface.tsx`, `Header.tsx`, `UserGuide.tsx`, and `ProposalGenerator.tsx` have no import path from the current `main.tsx` -> `App.tsx` composition; their copy was made AN3S-neutral during S5. | Reuse could introduce duplicate interaction patterns even though inherited branding was removed. | Retain until a separate source-cleanup scope approves deletion; the files belong to the exported application tree. | Low | Confirmed unreferenced |
| `local-automations.ts` mixed import mode | Vite reports that the module is dynamically imported by the data engine and statically imported by the settings/flow modules, so it remains in the main chunk. | Non-fatal build warning; no runtime correctness impact. | Revisit only if bundle splitting becomes a performance goal. | Low | Accepted debt |
