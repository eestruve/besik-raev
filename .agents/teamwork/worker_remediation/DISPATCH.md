## 2026-11-09T12:20:25Z
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

You are teamwork_worker for Iteration 2 (Remediation of Reviewer 1 Findings).
Your identity: teamwork_worker
Your working directory: c:\Users\evgen\Desktop\Antigravity\NEWprodject\20_Сайт_Беслана\.agents\teamwork\worker_remediation

MANDATORY INPUTS (Read before starting):
1. c:\Users\evgen\Desktop\Antigravity\NEWprodject\20_Сайт_Беслана\.agents\teamwork\reviewer_1\handoff.md (Reviewer findings)
2. c:\Users\evgen\Desktop\Antigravity\NEWprodject\20_Сайт_Беслана\.agents\teamwork\explorer_iter2_1\report.md (Domain utils blueprint)
3. c:\Users\evgen\Desktop\Antigravity\NEWprodject\20_Сайт_Беслана\.agents\teamwork\explorer_iter2_2\report.md (Test runner blueprint)
4. c:\Users\evgen\Desktop\Antigravity\NEWprodject\20_Сайт_Беслана\.agents\teamwork\explorer_iter2_3\report.md (Audio collision blueprint)

TASKS:
1. Extract Shared Domain Utilities:
   - Create `src/utils/bookingCalculations.ts` defining and exporting:
     * Constants: `BASE_FEES`, `LOGISTICS_FEES`, `ADDON_PRICES`
     * Functions: `getGuestMultiplier(count)`, `calculateBookingCost(options)`, `validateBookingForm(data)`, `generateTelegramDeepLink(data, calc)`
     * Support dual aliases where needed (`depositRequired` / `prepayment50`, `baseFee` / `baseCost`, `near_regions` / `regions_near`) so both test suite and UI components work seamlessly.
   - Create `src/utils/playerUtils.ts` defining and exporting:
     * `formatTime(seconds)`
     * `calculateProgress(currentTime, duration)`
     * `clampSeekTime(targetTime, duration)`
     * `clampVolume(volume)`
     * `getActiveLyricIndex(currentTime, lyrics)`
     * `MockAudioEngine`
2. Component Refactoring:
   - Refactor `src/components/BookingCalculator.tsx` and `src/components/BookingForm.tsx` to import calculation and validation functions from `src/utils/bookingCalculations.ts`.
   - Refactor `src/components/VinylPlayer.tsx`, `src/components/MiniPlayerBar.tsx`, `src/components/LyricsDrawer.tsx`, and `src/hooks/useAudioPlayer.ts` to import time and player utilities from `src/utils/playerUtils.ts`.
   - In `src/App.tsx`: On opening video modal (`onOpenVideo`), pause vinyl audio playback if active (`player.pause()`).
   - In `src/components/StreamingLinks.tsx`: Add subtle preview badges («Превью-фрагмент») to catalog tracks to indicate demo playback.
3. Test Suite Decoupling & Import:
   - In `tests/booking.test.ts`: Remove duplicated local definitions and import directly from `../src/utils/bookingCalculations.ts`.
   - In `tests/player.test.ts`: Remove duplicated local definitions and import directly from `../src/utils/playerUtils.ts`.
   - In `tests/e2e.test.ts`: Ensure imports are consistent with `src/utils/`.
4. Vitest & Test Runner Dual Execution:
   - Create `vitest.config.ts` merging with `vite.config.ts` and adding resolve alias:
     ```ts
     alias: {
       'node:test': 'vitest'
     }
     ```
   - In `package.json`, update scripts:
     ```json
     "test": "vitest run",
     "test:node": "node --experimental-strip-types --test tests/booking.test.ts tests/player.test.ts tests/e2e.test.ts"
     ```
   - Update `TEST_READY.md` and `TEST_INFRA.md` to reflect the dual runner support.
5. Verification:
   - Run `npm test` (verify Vitest executes and passes 100% with exit code 0).
   - Run `npm run test:node` (verify Node native test runner passes 100% with exit code 0).
   - Run `node scripts/verify-build.mjs` (verify all checks pass, exit code 0).
   - Run `npm run build` (verify production build passes cleanly, exit code 0).
6. Handoff:
   - Write comprehensive handoff.md to `c:\Users\evgen\Desktop\Antigravity\NEWprodject\20_Сайт_Беслана\.agents\teamwork\worker_remediation\handoff.md`.
   - Send completion message to orchestrator via send_message.
