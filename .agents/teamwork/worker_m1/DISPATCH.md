## 2026-11-09T11:42:27Z
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

You are teamwork_worker for Milestone M1 (Foundation, Media Pipeline & Design System Base).
Your identity: teamwork_worker
Your working directory: c:\Users\evgen\Desktop\Antigravity\NEWprodject\20_Сайт_Беслана\.agents\teamwork\worker_m1

EXCLUSIVE WRITE OWNERSHIP (You may only write to these files/paths):
- public/assets/*
- public/favicon.ico, public/favicon.png
- docs/NMT_PRD.md
- docs/DESIGN.md
- package.json, package-lock.json, tsconfig.json, tsconfig.app.json, tsconfig.node.json, vite.config.ts, index.html
- src/main.tsx, src/index.css, src/App.tsx, src/types/index.ts, src/components/Header.tsx, src/components/Footer.tsx
- scripts/setup-assets.ps1

MANDATORY INPUTS (Read before starting):
1. c:\Users\evgen\Desktop\Antigravity\NEWprodject\20_Сайт_Беслана\.agents\teamwork\ORIGINAL_REQUEST.md
2. c:\Users\evgen\Desktop\Antigravity\NEWprodject\20_Сайт_Беслана\.agents\teamwork\orchestrator_1\PROJECT.md
3. c:\Users\evgen\Desktop\Antigravity\NEWprodject\20_Сайт_Беслана\.agents\teamwork\teamwork_explorer_survey_1\report.md (PRD details)
4. c:\Users\evgen\Desktop\Antigravity\NEWprodject\20_Сайт_Беслана\.agents\teamwork\teamwork_explorer_survey_2\report.md (Media copy and ffmpeg commands)
5. c:\Users\evgen\Desktop\Antigravity\NEWprodject\20_Сайт_Беслана\.agents\teamwork\teamwork_explorer_survey_3\report.md (Tech stack & configs)

SKILLS TO REFERENCE:
- c:\Users\evgen\Desktop\Antigravity\.agents\skills\frontend_developer\SKILL.md
- c:\Users\evgen\Desktop\Antigravity\.agents\skills\frontend-design\SKILL.md

TASKS:
1. Media Pipeline Setup:
   - Create public/assets directory in c:\Users\evgen\Desktop\Antigravity\NEWprodject\20_Сайт_Беслана\.
   - Copy beslan.mp4, beslan_avatar.jpg, kolobok_*.gif from c:\Users\evgen\Desktop\Antigravity\NEWprodject\17_Бесроллинг\public\assets\ to public/assets/.
   - Copy favicon.ico, favicon.png to public/.
   - Run ffmpeg commands to extract public/assets/beslan.mp3 and public/assets/beslan_poster.jpg (as documented in Survey 2).
   - Save the PowerShell script as scripts/setup-assets.ps1.
2. Documentation:
   - Create docs/NMT_PRD.md and save the full 3-layer NMT PRD generated in Survey 1.
   - Create docs/DESIGN.md defining the design system tokens (Dark neo-soul / warm vinyl palette: obsidian #0B0B0E, rich black #121217, vinyl gold #F2A900, champagne #F5E6CC, electric amber #FF7700; typography: Syne/Cinzel for display, Plus Jakarta Sans/Inter for body; micro-animations; 375px/768px/1440px responsive tokens).
3. Project Setup & Tooling:
   - Create package.json with dependencies: react 19, react-dom 19, @tailwindcss/vite, tailwindcss v4, lucide-react, clsx, tailwind-merge. Dev dependencies: vite 6, typescript, @types/react, @types/react-dom, vitest.
   - Setup tsconfig.json, tsconfig.app.json, tsconfig.node.json, vite.config.ts (with @tailwindcss/vite plugin).
   - Setup index.html with meta tags (viewport, title: "Besik Raev (Беслан) — Официальный сайт артиста | Останься музыка", OpenGraph, dark theme color).
4. Code Implementation:
   - Setup src/index.css with `@import "tailwindcss";` and custom dark theme utility styles (gold gradients, glassmorphism, vinyl groove textures).
   - Setup src/types/index.ts with contracts for audio player, booking calculation, formats.
   - Setup src/components/Header.tsx with logo, nav links (Плеер, Треки, Букинг, Концерты, Пасхалка), and sound toggle indicator.
   - Setup src/components/Footer.tsx with social links, copyright, and subtle Besrolling trigger.
   - Setup src/App.tsx as responsive layout shell.
   - Run `npm install` and `npm run build` using clean PowerShell mode (-NoLogo -NoProfile -NonInteractive -ExecutionPolicy Bypass).
   - Ensure `npm run build` exits 0 with zero errors.
5. Handoff:
   - Write comprehensive handoff.md to your working directory:
     c:\Users\evgen\Desktop\Antigravity\NEWprodject\20_Сайт_Беслана\.agents\teamwork\worker_m1\handoff.md
     Document exact build commands, terminal outputs, asset sizes, and verification method.
   - Send completion message to orchestrator via send_message.
