# 🧪 TEST_INFRA.md — Testing Infrastructure & Test Suite Specification
**Project:** 20_Сайт_Беслана (Besik Raev Official Hybrid Promo & Booking Hub)  
**Milestone:** M4 (E2E Testing Track & Automated Test Suite)  
**Author:** `teamwork_test_writer`  
**Date:** 2026-11-09  
**Status:** Approved & Implemented  

---

## 1. Test Philosophy & Core Principles

### 1.1. Requirement-Driven Derivation
Every test in this suite is derived directly from authoritative project specifications:
- **`ORIGINAL_REQUEST.md`**: Core requirements R1 (NMT PRD), R2 (Hybrid Promo + Booking), R3 (Media assets & Besrolling integration), R4 (Interactive UX).
- **`NMT PRD` (`teamwork_explorer_survey_1/report.md`)**: User Jobs (Fans & Bookers), Critical Chain of Jobs (CCJ), Functional Requirements FR-01 through FR-06, and Edge Cases EC-01 through EC-10.
- **`PROJECT.md` § Feature Inventory**: Complete 11-feature inventory and interface contracts (`useAudioPlayer` hook, Telegram deep link payload schema).

### 1.2. Opaque-Box & External Contract Verification
Tests evaluate the external behavior of components, utilities, and artifacts without coupling to private implementation details:
- Audio engine state transitions, duration formatting, scrubber math, and synchronized lyrics timing.
- Booking calculator pricing formulas, regional logistics multipliers, deposit math, form validation rules, and URI encoding of Telegram deep links.
- Edge cases EC-01 through EC-10, resilience against malformed inputs, audio lock handling, network degradation fallback, and responsive bounds.
- Distribution integrity, bundle size budgets, OpenGraph metadata, and content anchor preservation.

### 1.3. Progressive Testability & Self-Containment
All test modules are self-contained and execute reliably in any CI/CD environment:
- Zero external network dependencies (no live API or CDN calls during test execution).
- Deterministic expected outputs derived mathematically or from defined specification constants.
- Dual execution compatibility: runs natively with Node.js built-in test runner (`node --experimental-strip-types --test`) AND with Vitest (`npm test`).

---

## 2. Feature Inventory & Test Mapping

| # | Feature Area | Key Contracts & Behaviors Tested | PRD Reference | Test Suite File |
|---|--------------|-----------------------------------|---------------|-----------------|
| 1 | **3D Vinyl Player & Audio Engine** | State machine (`idle` → `playing` → `paused`), scrubber time math, duration bounds, volume/mute toggling, frequency bin averaging | FR-01, EC-01, EC-06 | `tests/player.test.ts` |
| 2 | **Synchronized Lyrics Engine** | Timestamp matching, active line detection, verse/chorus transitions, fallback for boundary times, text export | FR-01 | `tests/player.test.ts` |
| 3 | **Interactive Booking Calculator** | 4 formats (Acoustic, Club, Private, Festival), base fees, guest scaling, logistics multipliers, deposit calculation (50%) | FR-05 | `tests/booking.test.ts` |
| 4 | **Booking Form & Validation** | Required fields (name, phone, date, format), Russian phone mask validation, anti-spam debouncing, error reporting | FR-05, EC-07 | `tests/booking.test.ts` |
| 5 | **Telegram Deep-Link Dispatch** | URL encoding of Cyrillic parameters, message templating (`https://t.me/besik_raev?text=...`), payload structure | FR-05, EC-03 | `tests/booking.test.ts` |
| 6 | **Media Showcase & Video** | Verification of `beslan.mp4`, `beslan.mp3`, poster fallback, byte size integrity, metadata validation | FR-03, EC-02 | `scripts/verify-build.mjs` |
| 7 | **Streaming & Social Hub** | Multi-platform coverage (Yandex, Apple, Spotify, VK, YouTube Music), Instagram `@besikraev`, Qtickets link | FR-02, FR-04, EC-09 | `tests/e2e.test.ts` |
| 8 | **Tech Rider Modal** | Sound, stage, hospitality rider availability, printable export contract, local serving (no cloud redirects) | FR-05, EC-05 | `tests/e2e.test.ts` |
| 9 | **Besrolling 2.0 Viral Studio** | Prank generator, 5 nostalgia presets (VHS 1997, GTA 6, Sega, etc.), prank URL generation, clipboard sharing | FR-06 | `tests/e2e.test.ts` |
| 10 | **Distribution & Build Verification** | HTML structure, OpenGraph/Twitter tags, viewport, bundle size budget (<1MB), content anchors | Acceptance Criteria | `scripts/verify-build.mjs` |

---

## 3. Test Runner Architecture

The project features a **Dual-Track Testing Architecture**:

```
+---------------------------------------------------------------------------------+
|                                 TEST HARNESS                                    |
+----------------------------------------+----------------------------------------+
|   TRACK 1: Functional & Unit Suite     |   TRACK 2: Distribution Verification   |
|   (TypeScript / Node.js & Vitest)      |   (Standalone Node.js ESM Runner)      |
+----------------------------------------+----------------------------------------+
| - tests/booking.test.ts                | - scripts/verify-build.mjs             |
| - tests/player.test.ts                 |                                        |
| - tests/e2e.test.ts                    | - Phase 1: Core Media Assets Audit     |
| - tests/adversarial_stress.test.ts     | - Phase 2: Distribution HTML Structure |
|                                        | - Phase 3: Metadata & OG Tags Check    |
| Single Source of Truth:                | - Phase 4: Bundle Budget & Asset Sizes |
| - src/utils/bookingCalculations.ts     | - Phase 5: Crucial Content Anchors     |
| - src/utils/playerUtils.ts             |                                        |
|                                        | Command:                               |
| Commands:                              |   npm run test:verify                  |
|   npm test (Vitest via vitest.config)  |   (node scripts/verify-build.mjs)      |
|   npm run test:node (Node Native ESM)  |                                        |
+----------------------------------------+----------------------------------------+
```

### 3.1. Track 1: Automated Unit & Integration Tests (Dual Execution Architecture)
- **Language**: TypeScript (`.ts`)
- **Domain Utility Modules**:
  - `src/utils/bookingCalculations.ts`: Pure booking pricing formulas, tier scaling multipliers, validation rules, and Telegram deep link generator.
  - `src/utils/playerUtils.ts`: Pure audio scrubber progress math, time formatting, boundary clamping, synchronized lyrics index tracker, and headless audio engine.
- **Execution Engines**:
  - **Vitest (`npm test`)**: Uses dedicated `vitest.config.ts` with module alias:
    ```ts
    resolve: {
      alias: {
        'node:test': 'vitest',
      },
    }
    ```
    This enables Vitest to execute tests written with standard `import { describe, it } from 'node:test'` natively, providing fast watch mode, Vite module transformations, and 100% test collection.
  - **Node.js Native Runner (`npm run test:node`)**:
    ```bash
    node --experimental-strip-types --test tests/booking.test.ts tests/player.test.ts tests/e2e.test.ts tests/adversarial_stress.test.ts
    ```
    Executes in ~300ms with zero compilation step, utilizing Node.js v25+ native type stripping.
- **Scope**:
  - `tests/booking.test.ts`: Calculator math, logistics tiers, deep link formatting, form validation (23 tests).
  - `tests/player.test.ts`: Audio state machine, time scrubber formatting, volume clamping, lyrics synchronizer (21 tests).
  - `tests/e2e.test.ts`: Edge cases EC-01 through EC-10, audio focus conflict prevention, fan listening journey, promoter booking journey, viral prank journey (22 tests).
  - `tests/adversarial_stress.test.ts`: Boundary values, fuzzing, injection defenses, and state machine stress testing (26 tests).

### 3.2. Track 2: Standalone Distribution & Asset Verification
- **Language**: Node.js ES Modules (`.mjs`)
- **Execution Command**:
  ```bash
  node scripts/verify-build.mjs
  ```
- **Scope**:
  - Verifies presence and non-zero byte size of media assets in `public/assets/` (`beslan.mp4`, `beslan.mp3`, `beslan_avatar.jpg`, `beslan_poster.jpg`, favicons, kolobok GIFs).
  - Validates `dist/index.html` (or project root `index.html` during pre-build) for responsive viewport, Russian language tag, OpenGraph tags, Twitter Card tags.
  - Audits bundle sizes against budget constraints (<1 MB uncompressed JS/CSS).
  - Validates preservation of vital content anchors (Besik Raev, Останься музыка, Telegram `@besik_raev`, Qtickets, 152-ФЗ notice).

---

## 4. 4-Tier Test Design Matrix

The test suite is structured into four distinct tiers ensuring rigorous quality:

### Tier 1: Feature Coverage (≥5 tests per primary feature)
- **Player & Media**:
  1. Default idle state initialization with volume 1.0 and progress 0.
  2. Play/Pause toggle state transition and playback timing.
  3. Time formatting (`MM:SS`) across seconds, minutes, and hour boundaries.
  4. Volume adjustment and boundary clamping between 0.0 and 1.0.
  5. Mute toggling with state preservation and volume restoration.
- **Booking Calculator**:
  1. Base pricing evaluation for all 4 event formats (Acoustic 150k, Club 180k, Private 250k, Festival 350k).
  2. Regional logistics surcharge calculation (Moscow 0, Near regions +45k, Far regions/CIS +120k).
  3. Guest count scaling tiers (1-50: 1.0x, 51-200: 1.1x, 201-500: 1.25x, >500: 1.5x).
  4. Optional add-ons calculation (Backline, Extended set, Custom song).
  5. 50% deposit / prepayment calculation.
- **Booking Form & Telegram**:
  1. Mandatory field presence validation.
  2. Russian telephone number validation (`+7 (XXX) XXX-XX-XX`).
  3. Telegram handle validation (`@username`).
  4. Telegram deep link URL generation with valid encoded parameters.
  5. Error reporting for missing or malformed inputs.
- **Streaming & Content**:
  1. Multi-platform streaming link mapping (Yandex, Apple, Spotify, VK, YouTube).
  2. Instagram profile link `@besikraev`.
  3. Qtickets concert ticket link formatting with target blank and rel security.
  4. Video player source and poster configuration.
  5. Easter egg preset definitions (VHS 1997, GTA 6, Sega, etc.).

### Tier 2: Boundary & Corner Cases (≥5 tests per primary feature)
- Empty or zero values (0 seconds duration, 0 guest count, empty name/phone).
- Negative numbers handling (negative time seek clamped to 0, negative guests clamped to minimum).
- Extreme scale inputs (100,000 guests, long custom comments exceeding 500 characters).
- Special characters, Cyrillic text, emoji, and XSS sanitization in input fields.
- Audio scrubber seek beyond track duration (clamped to track length).
- AudioContext suspended state simulation (iOS Safari autoplay lock).
- Rapid repeated click debouncing on form dispatch.

### Tier 3: Cross-Feature Combinations (Pairwise interactions)
- **Audio + Modal**: Audio continues uninterrupted or pauses cleanly when tech rider modal opens.
- **Calculator + Deep Link**: Adjusting format or guest count dynamically updates the generated Telegram URL.
- **Player + Lyrics**: Seeking to arbitrary timestamp immediately synchronizes the active lyric verse.
- **Form + Calculator**: Selecting a format pre-populates form state and recalculates fee and deposit.
- **Easter Egg + Prank URL**: Changing preset dynamically regenerates the shareable prank link with proper encoding.

### Tier 4: Real-World Scenarios (End-to-End User Journeys)
- **Scenario A (Fan Discovery Journey)**:
  User lands on site → Sees Hero section → Hits play on vinyl player → Audio starts instantly → Lyrics drawer reveals synchronized verses → User scrolls to Tour section → Clicks "Купить билет" to visit Qtickets page.
- **Scenario B (Event Promoter Booking Journey)**:
  Promoter lands on site → Navigates to Booking section → Selects "Festival Live" format for 300 guests in St. Petersburg → Inspects fee (350k * 1.25 + 45k logistics = 482,500 ₽) and 50% deposit → Opens and reviews Tech Rider modal → Fills organizer details → Clicks Telegram dispatch button with auto-formatted message.
- **Scenario C (Viral Besrolling Prank Journey)**:
  Visitor discovers easter egg → Opens Besrolling Studio 2.0 → Selects "VHS Архив 1997" preset → Copies custom prank link → Link contains valid base target and query parameters.

---

## 5. PRD Edge Cases (EC-01..EC-10) Verification Mapping

| PRD Edge Case | Scenario | Verification Method in `tests/e2e.test.ts` |
|---|---|---|
| **EC-01** | iOS Safari autoplay policy audio lock | Tests that audio engine requires explicit user interaction gesture before starting playback; verifies unlock mechanism. |
| **EC-02** | Slow mobile network (EDGE/3G) | Verifies existence of lightweight poster (`beslan_poster.jpg` < 50KB) and audio preview (`beslan.mp3`), ensuring instant visual render before video buffers. |
| **EC-03** | Missing native Telegram app on desktop | Verifies universal web gateway `https://t.me/besik_raev` is used instead of broken `tg://` protocol, plus fallback copy mechanism. |
| **EC-04** | Instagram in-app browser sandbox | Verifies external links (`qtickets`, streaming platforms) specify `target="_blank"` and `rel="noopener noreferrer"`. |
| **EC-05** | Corporate proxy blocking external cloud drives | Verifies Tech Rider is served locally from same-origin path / inline modal without external redirects to Google Drive. |
| **EC-06** | Audio focus conflict with background podcasts | Verifies HTML5 audio playback contract prevents simultaneous competing audio streams within the application. |
| **EC-07** | Incomplete or empty booking form submission | Tests client-side validation rejecting empty or malformed inputs with descriptive error messages. |
| **EC-08** | Viewport boundary stress (320px to 2560px) | Verifies layout constraints (`max-w-6xl`) and fluid scaling parameters preventing horizontal page overflow. |
| **EC-09** | International visitor streaming access | Verifies availability of global streaming platforms (Spotify, Apple Music, YouTube Music) alongside Russian platforms. |
| **EC-10** | Forced dark mode / system high contrast | Verifies explicit color token definitions (`--color-brand-bg: #090a0f`, `--color-brand-amber: #f59e0b`) preventing unreadable auto-inversion. |

---

## 6. Coverage Thresholds & Quality Gates

| Metric | Target Threshold | Minimum Required |
|---|---|---|
| **Feature Coverage (Tier 1)** | 100% of defined features | ≥ 5 tests per feature |
| **Boundary / Corner Cases (Tier 2)** | 100% of defined edge cases | ≥ 5 tests per feature |
| **Cross-Feature Tests (Tier 3)** | Pairwise key workflows | ≥ 5 combinations |
| **Real-World Scenarios (Tier 4)** | 3 full end-to-end user journeys | 3 scenarios |
| **Total Test Count** | ≥ 60 automated assertions | ≥ 45 assertions |
| **Media Asset Verification** | 100% pass on all media files | Zero missing files |
| **Bundle Size Budget** | JS < 1 MB uncompressed, CSS < 200 KB | Hard fail if exceeded |

---

## 7. Execution Commands

### Run All Unit & Integration Tests:
```powershell
node --experimental-strip-types --test tests/booking.test.ts tests/player.test.ts tests/e2e.test.ts
```

### Run Build & Asset Verification Harness:
```powershell
node scripts/verify-build.mjs
```

### Run Vitest (When dependencies installed):
```powershell
npm test
```

---

## 8. Defect Escalation Protocol

If any test in the suite fails:
1. **Identify Failure Classification**:
   - *Test Code Defect*: Test logic misinterprets PRD or contract → Test Writer fixes the test.
   - *Implementation Defect*: Application logic violates PRD or interface contract → Escalate immediately to orchestrator / implementation worker with reproducible command and expected vs actual values.
   - *Asset Defect*: Required media file missing or zero bytes → Escalate to asset setup pipeline.
2. **Never Commit Facade Fixes**: Do not soften test assertions to accommodate bugs.
