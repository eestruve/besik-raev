# 5-Component Handoff Report — explorer_iter2_1

**Instance:** `teamwork_explorer` (Iteration 2)  
**Parent Conversation ID:** `c84380df-f876-4040-918e-b1212ff9cb00`  
**Milestone:** Domain Utilities & Test Decoupling Remediation Strategy  
**Date:** 2026-11-09T12:18:00Z  

---

## 1. Observation

1. **Test Duplication Observed Directly**:
   - In `tests/booking.test.ts` (lines 42–196): Local definitions of `BASE_FEES`, `LOGISTICS_FEES`, `ADDON_PRICES`, `getGuestMultiplier(count)`, `calculateBookingCost(options)`, `validateBookingForm(data, currentDate)`, and `generateTelegramDeepLink(data, calc)` exist entirely inside the test file.
   - In `tests/player.test.ts` (lines 95–246): Local definitions of `formatTime(seconds)`, `calculateProgress(currentTime, duration)`, `clampSeekTime(targetTime, duration)`, `clampVolume(volume)`, `getActiveLyricIndex(currentTime, lyrics)`, and `MockAudioEngine` exist entirely inside the test file.
   - In `tests/adversarial_stress.test.ts` (lines 19–43): Functions are imported from `./booking.test.ts`, `./player.test.ts`, and `./e2e.test.ts` rather than `src/`.
2. **Production Component Duplication Observed Directly**:
   - In `src/components/BookingCalculator.tsx` (lines 110–147): Pricing formulas are duplicated in `useMemo`.
   - In `src/components/BookingForm.tsx` (lines 37–72 & 74–103): Validation regex and Telegram link builder are duplicated in component methods.
   - In `src/components/VinylPlayer.tsx` (lines 20–26) and `src/components/MiniPlayerBar.tsx` (lines 33–39): Local `formatSeconds` is duplicated.
   - In `src/components/LyricsDrawer.tsx` (lines 28–35 & 124–131): Active lyric index search and timestamp formatting are duplicated.
   - In `src/hooks/useAudioPlayer.ts` (lines 71–72, 193–197, 202): Inline seek/volume/progress clamping is duplicated.
3. **Execution Commands Observed**:
   - `node --experimental-strip-types --test tests/booking.test.ts tests/player.test.ts tests/e2e.test.ts`: Exit code 0, 64 passed.
   - `npm test` (`vitest run`): Exit code 1 with `FAIL ... Error: No test suite found in file` across all suites because Vitest does not collect `node:test` without Vitest APIs.
4. **Audio Collision (EC-06) Observed**:
   - In `src/App.tsx` (line 125): `onOpenVideo={() => setShowVideoModal(true)}` opens `<video autoPlay>` in `VideoModal.tsx` without pausing vinyl `player`.

---

## 2. Logic Chain

1. From Observation 1, unit tests in `tests/` currently test their own local functions, meaning test passes do not verify the runtime behavior in `src/`. This confirms Reviewer 1's Finding 1.
2. From Observation 2, multiple production components re-implement the same domain formulas in separate ad-hoc blocks, creating divergence risk and maintenance overhead.
3. By extracting these pure functions into `src/utils/bookingCalculations.ts` and `src/utils/playerUtils.ts`, we establish a single authoritative source of truth for calculations, validation, formatting, and playback constraints.
4. By updating `BookingCalculator.tsx`, `BookingForm.tsx`, `VinylPlayer.tsx`, `MiniPlayerBar.tsx`, `LyricsDrawer.tsx`, `useAudioPlayer.ts`, and `App.tsx` to import from these utilities, production code becomes cleaner, DRY, and strictly aligned with domain contracts.
5. By updating `tests/booking.test.ts`, `tests/player.test.ts`, and `tests/adversarial_stress.test.ts` to import directly from `../src/utils/`, tests transition from self-certifying mock tests to authentic verification of production code.
6. By aligning the `"test"` script in `package.json` to the zero-dependency test runner `node --experimental-strip-types --test ...`, `npm test` will run consistently in any environment without Vitest suite collection failures, resolving Finding 2.
7. By invoking `player.togglePlay()` when `player.isPlaying` on `onOpenVideo` in `src/App.tsx`, audio collision (Finding 3 / EC-06) is fully resolved.

---

## 3. Caveats

1. **`--experimental-strip-types` Limitation**: Node.js built-in type stripper cannot transpile JSX/TSX syntax. Therefore, utility files in `src/utils/` must remain pure TypeScript (`.ts`) and must NOT import or include React JSX elements.
2. **Naming Harmonization**: In `BookingCalculator.tsx`, region keys are `'moscow'`, `'near_regions'`, `'far_regions'`. In `tests/booking.test.ts`, region keys were `'moscow'`, `'regions_near'`, `'regions_far'`. The utility module must provide backward-compatible aliases for both key formats to prevent breaking either the UI or existing tests.
3. **No Implementation during Investigation**: As an explorer, no production files were modified. The complete remediation plan is documented in `report.md` for immediate execution by the worker agent.

---

## 4. Conclusion

The technical remediation strategy is fully defined and documented in:
`c:\Users\evgen\Desktop\Antigravity\NEWprodject\20_Сайт_Беслана\.agents\teamwork\explorer_iter2_1\report.md`

- **Extraction Architecture**:
  * `src/utils/bookingCalculations.ts`: `BASE_FEES`, `LOGISTICS_FEES`, `ADDON_PRICES`, `FORMAT_NAMES`, `getGuestMultiplier`, `calculateBookingCost`, `validateBookingForm`, `generateTelegramDeepLink`.
  * `src/utils/playerUtils.ts`: `formatTime`, `calculateProgress`, `clampSeekTime`, `clampVolume`, `getActiveLyricIndex`, `MockAudioEngine`, `TRACK_OSTANSYA_MUZYKA`, `TRACK_MAQ`, `TRACK_TENDZHYZ`, `DISCOGRAPHY_TRACKS`.
- **Decoupled Tests**: `tests/booking.test.ts`, `tests/player.test.ts`, and `tests/adversarial_stress.test.ts` will directly import from `../src/utils/`.
- **Integrity Compliance**: Eliminates all self-certifying duplicate test code, satisfies Reviewer 1's requirements, and resolves the audio focus collision (EC-06).

---

## 5. Verification Method

To verify the strategy once implemented by the worker:

1. **Build Verification**:
   ```powershell
   npm run build
   ```
   Must exit with code 0 and 0 TypeScript compilation errors.
2. **Test Suite Verification**:
   ```powershell
   npm test
   ```
   Must exit with code 0, executing all 4 test files (`booking.test.ts`, `player.test.ts`, `e2e.test.ts`, `adversarial_stress.test.ts`) with 89 passed tests and 0 failures.
3. **Decoupling Audit**:
   Verify that `grep_search` in `tests/` for `export function calculateBookingCost` returns 0 results in `tests/booking.test.ts`, and only references the import from `../src/utils/bookingCalculations`.
