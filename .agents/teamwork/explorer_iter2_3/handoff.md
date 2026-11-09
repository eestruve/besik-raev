# Handoff Report — Audio Collision (EC-06) & UI Discography Remediation

**Author:** `teamwork_explorer` (Iteration 2: Audio Collision & UI Polish Remediation)  
**Parent / Recipient:** `c84380df-f876-4040-918e-b1212ff9cb00` (Orchestrator) & Implementer  
**Date:** 2026-11-09T12:18:00Z  
**Reference Report:** `.agents/teamwork/explorer_iter2_3/report.md`  

---

## 1. Observation

Direct code observations from investigation:

### 1.1. Audio Collision (Finding 3 / EC-06)
1. **`src/App.tsx` (lines 28, 30, 123–126, 221–226)**:
   - Line 28: `const player = useAudioPlayer(DEFAULT_TRACK);`
   - Line 30: `const [showVideoModal, setShowVideoModal] = useState(false);`
   - Lines 123–126:
     ```tsx
     <VinylPlayer
       player={player}
       onOpenVideo={() => setShowVideoModal(true)}
     />
     ```
   - Lines 221–226:
     ```tsx
     <VideoModal
       isOpen={showVideoModal}
       onClose={() => setShowVideoModal(false)}
       videoSrc="/assets/beslan.mp4"
       posterSrc="/assets/beslan_poster.jpg"
     />
     ```
2. **`src/components/VideoModal.tsx` (lines 71–83)**:
   - Contains `<video ref={videoRef} src={videoSrc} poster={posterSrc} controls autoPlay playsInline loop ...>`
   - When `showVideoModal` is true, video auto-plays with audio.
   - `App.tsx` never halts `player` during `onOpenVideo`, resulting in simultaneous playback of `/assets/beslan.mp3` and `/assets/beslan.mp4`.
3. **`src/hooks/useAudioPlayer.ts` (lines 249–267) & `src/types/index.ts` (lines 44–62)**:
   - `AudioPlayerHook` only provides `togglePlay()`, lacking dedicated idempotent `pause()` and `play()` methods.

### 1.2. Catalog Track Transparency (Finding 4 / FR-02)
4. **`src/components/StreamingLinks.tsx` (lines 11–84)**:
   - Tracks `maq` (line 49) and `tendzhyz` (line 70) share `audioSrc: '/assets/beslan.mp3'` with comments `// graceful fallback to local audio`.
   - Only `beslan.mp3` exists in `public/assets/` (confirmed by `node scripts/verify-build.mjs`).
   - Cards in `StreamingLinks.tsx` (lines 154–229) lack visual badges or text explaining that the web player plays a demo preview, causing user disorientation when differing titles/lyrics play the lead track's audio.

---

## 2. Logic Chain

1. From Observation 1.1 (items 1 & 2), when a user clicks «Видеоклип» in `VinylPlayer`, `App.tsx` sets `showVideoModal(true)` without calling any pause operation on `player`. The `<video>` element starts playing `/assets/beslan.mp4` while the `<audio>` element continues playing `/assets/beslan.mp3`. This violates PRD Edge Case EC-06 ("Audio focus conflict & single active stream") and FR-02.
2. From Observation 1.1 (item 3), relying solely on `player.togglePlay()` can accidentally restart playback if called when paused; adding idempotent `pause()` and `play()` methods to `useAudioPlayer` and `AudioPlayerHook` eliminates state desynchronization.
3. In `App.tsx`, replacing the inline callback `onOpenVideo={() => setShowVideoModal(true)}` with a dedicated handler `handleOpenVideo`:
   ```tsx
   const handleOpenVideo = () => {
     if (player.isPlaying) {
       player.pause(); // or player.togglePlay()
     }
     setShowVideoModal(true);
   };
   ```
   guarantees that audio playback stops before the video begins.
4. Analyzing close behavior: keeping audio paused upon closing `VideoModal` adheres to UX standards and browser autoplay restrictions (preventing startling resumption).
5. From Observation 1.2 (item 4), adding `isPreview?: boolean` and `badgeText?: string` to `Track`, alongside UI badges («Превью-фрагмент» vs «Главный релиз 2026»), explicit button text («Слушать демо-фрагмент»), an informational callout banner under the grid, and a `Демо-превью` pill in `VinylPlayer.tsx`, completely eliminates listener confusion and actively drives conversion to streaming platforms (NMT PRD metric CTR ≥ 18%).

---

## 3. Caveats

1. **Audio Master Availability**: The project repository intentionally contains only one studio master audio file (`/assets/beslan.mp3`, «Останься музыка»). Producing or downloading additional full masters is out of scope; UI transparency is the correct product solution.
2. **Autoplay Restrictions**: Closing the video modal should not auto-resume audio by default, as browsers (Safari/Chrome) may flag programmatic resumption without a direct audio play gesture.

---

## 4. Conclusion

The remediation plan is fully formulated and documented in:  
`c:\Users\evgen\Desktop\Antigravity\NEWprodject\20_Сайт_Беслана\.agents\teamwork\explorer_iter2_3\report.md`

**Core Changes to Implement:**
1. In `src/types/index.ts`: Add `pause: () => void; play: () => void;` to `AudioPlayerHook`, and `isPreview?: boolean; badgeText?: string;` to `Track`.
2. In `src/hooks/useAudioPlayer.ts`: Implement and export `pause` and `play`.
3. In `src/App.tsx`: Implement `handleOpenVideo` which pauses `player` when `showVideoModal` opens.
4. In `src/components/StreamingLinks.tsx`: Designate catalog tracks with `isPreview: true`, display preview badges, dynamic button labels, and an explanatory callout banner.
5. In `src/components/VinylPlayer.tsx`: Add `Демо-превью` pill badge when an archival preview track is active.
6. In `tests/e2e.test.ts`: Add test assertions for EC-06 video modal pause and track preview designation.

---

## 5. Verification Method

To independently verify the proposed remediation once applied:
1. **Compilation Check**:
   ```powershell
   npm run build
   ```
   Must compile cleanly with exit code 0.
2. **Build Harness Verification**:
   ```powershell
   node scripts/verify-build.mjs
   ```
   Must pass 26/26 checks.
3. **Automated Unit & E2E Test Suite**:
   ```powershell
   node --experimental-strip-types --test tests/booking.test.ts tests/player.test.ts tests/e2e.test.ts
   ```
   Must execute with 0 failures.
4. **Interactive Browser Verification**:
   - Start vinyl playback: click "Слушать трек".
   - Open video: click "Видеоклип" — vinyl audio must pause immediately with zero overlap.
   - Close modal: vinyl audio remains paused.
   - Discography check: «Макъ» and «Тенджыз» clearly show «Превью-фрагмент», button says «Слушать демо-фрагмент», and banner under grid explains streaming availability.
