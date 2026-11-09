# 📋 Задачи проекта: 20_Сайт_Беслана

## 🎯 Текущий фокус / В работе (In Progress)
- [ ] Демонстрация и тестирование пользователем версий **V2 (21st.dev Edition)** и **V1 (Classic Turntable)**

## 📥 Бэклог задач (Backlog / To Do)
- [ ] Деплой на внешний хостинг (Netlify / Vercel / VDSina) по запросу пользователя

## ✅ Выполнено (Done)
- [x] 2026-11-09 — Развернута базовая структура проекта по стандарту `workspace_structure.md`.
- [x] 2026-11-09 — Сохранен API-ключ `TWENTY_FIRST_API_KEY` в `.env` и настроен MCP-сервер `21st-dev-magic` в `mcp_config.json`.
- [x] 2026-11-09 — Сформирован PRD по методологии NMT (`docs/NMT_PRD.md`) и дизайн-система `docs/DESIGN.md`.
- [x] 2026-11-09 — Собрана версия V1 (`VinylPlayer`, `WaveformCanvas`, `BookingCalculator`, `BookingForm`, `BesrollingStudio`).
- [x] 2026-11-09 — Через MCP `21st-dev-magic` выгружены и встроены реальные компоненты `21st.dev` в новую версию **V2 (21st.dev Edition)** с переключателем `21st.dev V2 ↔ V1` в шапке:
  - `MusicReactiveHero21st.tsx` (`21st.dev` #2560 `Music Reactive Hero Section` + #989 `Spotlight`)
  - `VinylAlbumCard21st.tsx` (`21st.dev` #23320 `Great UI Vinyl Album Card` — выезжающий из конверта винил)
  - `VinylScratchStudio21st.tsx` (`21st.dev` #38996 `Vinyl Halftone Scratch Deck` — ручной скретч пластинки мышкой/пальцем и диагональные стадии трека)
  - `BentoShowcase21st.tsx` (`21st.dev` #43172 & #622 `Marketing Feature Bento Grid`)

## 💡 Идеи и Техдолг (Tech Debt / Ideas)
- Интеграция или кросс-ссылка с проектом `17_Бесроллинг` реализована во встроенной студии `BesrollingStudio.tsx`.
