# Project: 20_Сайт_Беслана

## Architecture
- Modern React 19 + Vite 6 + Tailwind CSS v4 + TypeScript + Lucide React.
- Media Engine: HTML5 Audio/Video + Web Audio API AnalyserNode + Canvas Waveform + 3D Vinyl Player with synchronized lyrics.
- Commercial Booking Hub: Reactive 4-format calculator + Form with Telegram (@besik_raev) deep-linking + Printable/downloadable Tech Rider modal.
- Viral Integration: "Забесроллить друга" (Besrolling Studio 2.0) with nostalgia presets.
- Domain Utilities: Shared decoupled modules `src/utils/bookingCalculations.ts` and `src/utils/playerUtils.ts`.
- Testing: Dual execution engine — Vitest (`npm test`, 92 tests) + Node native runner (`npm run test:node`, 114 tests) + Build verification harness (`scripts/verify-build.mjs`, 26 checks).

## Feature Inventory
| # | Feature | Description | Milestone | Source | Status |
|---|---------|-------------|-----------|--------|--------|
| 1 | NMT PRD Documentation | Full 3-layer PRD (Fans & Bookers, Jobs, CCJ, FR-01..FR-06, EC-01..EC-10) | M1 | R1, Survey 1 | DONE |
| 2 | Media Assets Pipeline | Copy and extract beslan.mp4, beslan.mp3, beslan_avatar.jpg, beslan_poster.jpg, favicons, kolobok GIFs | M1 | R3, Survey 2 | DONE |
| 3 | Design System & Shell | Theme, typography, responsive layout shell, navbar, footer, docs/DESIGN.md | M1 | R4, Survey 3 | DONE |
| 4 | 3D Vinyl Player & Audio Engine | Interactive vinyl player, tonearm, canvas waveform, audio controls, lyrics drawer | M2 | R2, Survey 3 | DONE |
| 5 | Video & Streaming Links Hub | beslan.mp4 video showcase, Yandex/Apple/Spotify/VK/YT links, Instagram/Telegram/Qtickets | M2 | R2, Survey 2 | DONE |
| 6 | Interactive Booking Calculator | 4 formats (Club, Festival, Private, Acoustic), real-time cost & logistics calculator | M3 | R2, Survey 1, 3 | DONE |
| 7 | Booking Form & Direct Telegram | Validated form with direct dispatch payload to Telegram @besik_raev | M3 | R2, Survey 1, 3 | DONE |
| 8 | Tech Rider Modal | Sound, Stage, Hospitality rider with print & copy support | M3 | R2, Survey 1, 3 | DONE |
| 9 | Viral "Забесроллить друга" 2.0 | Prank link generator with kolobok presets and link to 17_Бесроллинг | M3 | R4, Survey 2, 3 | DONE |
| 10 | E2E Test Suite (Tiers 1-4) | Automated tests covering features, boundary cases, combinations, user flows | M4 | Dual Track, Survey 3 | DONE |
| 11 | Final E2E Pass & Hardening | 100% pass of E2E suite, zero console errors, responsive audit, build audit | M5 | Dual Track, Acceptance Criteria | DONE |

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| 1 | M1: Foundation, Media & Design | Project setup (Vite, React, Tailwind v4), assets migration, DESIGN.md, layout shell | none | DONE |
| 2 | M2: Player & Media Hub | 3D Vinyl player, canvas waveform, lyrics, video modal, streaming & social links | M1 | DONE |
| 3 | M3: Booking Hub & Viral Studio | 4-format calculator, booking form, Telegram integration, tech rider, Besrolling 2.0 | M1 | DONE |
| 4 | M4: E2E Test Track | Comprehensive test suite (Tiers 1-4, Vitest, scripts/verify-build.mjs) | none (parallel) | DONE |
| 5 | M5: Acceptance & Hardening | Run 100% E2E tests, adversarial review, local browser verification | M2, M3, M4 | DONE |

## Interface Contracts
### Media Engine ↔ UI Components
- `useAudioPlayer()` hook providing:
  - `isPlaying: boolean`
  - `currentTime: number`
  - `duration: number`
  - `progress: number` (0 to 100)
  - `volume: number` (0 to 1)
  - `analyserNode: AnalyserNode | null`
  - `togglePlay: () => void`
  - `pause: () => void`
  - `play: () => void`
  - `seek: (time: number) => void`
  - `setVolume: (vol: number) => void`

### Booking Engine ↔ Telegram Deep Link
- Format:
  `https://t.me/besik_raev?text={encoded_message}`
- Payload contains: Event type, Date, City/Venue, Guest count, Rider selections, Contact name and phone.

## Code Layout
```
20_Сайт_Беслана/
├── docs/
│   ├── NMT_PRD.md
│   └── DESIGN.md
├── public/
│   ├── assets/
│   │   ├── beslan.mp4
│   │   ├── beslan.mp3
│   │   ├── beslan_avatar.jpg
│   │   ├── beslan_poster.jpg
│   │   └── easter_egg/ (130+ kolobok_*.gif)
│   ├── favicon.ico
│   └── favicon.png
├── src/
│   ├── components/
│   │   ├── Header.tsx
│   │   ├── Hero.tsx
│   │   ├── VinylPlayer.tsx
│   │   ├── WaveformCanvas.tsx
│   │   ├── LyricsDrawer.tsx
│   │   ├── VideoModal.tsx
│   │   ├── StreamingLinks.tsx
│   │   ├── ConcertsSection.tsx
│   │   ├── BookingCalculator.tsx
│   │   ├── BookingForm.tsx
│   │   ├── TechRiderModal.tsx
│   │   ├── BesrollingStudio.tsx
│   │   ├── MiniPlayerBar.tsx
│   │   └── Footer.tsx
│   ├── hooks/
│   │   └── useAudioPlayer.ts
│   ├── utils/
│   │   ├── bookingCalculations.ts
│   │   └── playerUtils.ts
│   ├── types/
│   │   └── index.ts
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── scripts/
│   ├── setup-assets.ps1
│   └── verify-build.mjs
├── tests/
│   ├── booking.test.ts
│   ├── player.test.ts
│   ├── e2e.test.ts
│   └── adversarial_stress.test.ts
├── package.json
├── vite.config.ts
├── vitest.config.ts
└── tsconfig.json
```
