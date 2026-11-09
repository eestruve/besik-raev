# 🎸 Проект: 20_Сайт_Беслана

## 📌 Обзор проекта
Официальный гибридный сайт (промо + коммерческий букинг) для артиста Беслана ([@besikraev](https://www.instagram.com/besikraev), ключевой трек «Останься музыка»).
Связанный вирусный проект: [`17_Бесроллинг`](file:///c:/Users/evgen/Desktop/Antigravity/NEWprodject/17_Бесроллинг/PROJECT.md) ([GitHub: eestruve/besroll](https://github.com/eestruve/besroll)).

---

## 🏗 Архитектура и стек
* **Статус:** Выполнено (Победный независимый аудит подтвержден: **VICTORY CONFIRMED**).
* **Фронтенд:** React 19 + TypeScript + Vite 6 + Tailwind CSS v4 + Web Audio API (`AudioContext`, `AnalyserNode`) + Canvas Visualizer + Lucide React.
* **Продуктовая методология:** Next Move Theory (AJTBD Ивана Замесина) — [`docs/NMT_PRD.md`](file:///c:/Users/evgen/Desktop/Antigravity/NEWprodject/20_Сайт_Беслана/docs/NMT_PRD.md) (53.8 КБ, сегменты «Слушатели/Фанаты» и «Организаторы концертов»).
* **Дизайн-система:** [`docs/DESIGN.md`](file:///c:/Users/evgen/Desktop/Antigravity/NEWprodject/20_Сайт_Беслана/docs/DESIGN.md) (эстетика Dark Neo-Soul & Warm Vinyl, теплый аналоговый свет, виниловый диск 33 1/3 RPM, поворотный тонарм, золотой градиент волны `#FF7700` → `#F2A900` → `#FAF4EB`).
* **Тестирование:** Дуальный раннер (Vitest 92/92 + Node `node:test` 114/114) + валидация сборки `scripts/verify-build.mjs` (26/26 проверок).

---

## 📁 Структура проекта
```text
20_Сайт_Беслана/
├── PROJECT.md               # 🌟 Единый источник фактов о проекте
├── TASKS.md                 # 📋 Бэклог и трекинг задач
├── HANDOFF.md               # 🔄 Состояние текущей работы (≤60 строк)
├── docs/                    # Документация (NMT_PRD.md, DESIGN.md)
├── scripts/                 # Вспомогательные скрипты (verify-build.mjs)
├── public/assets/           # Локальные медиа-файлы (beslan.mp3, beslan.mp4, avatar, gif)
├── src/                     # Исходный код сайта
│   ├── components/          # 15 React-компонентов (VinylPlayer, Waveform, Booking...)
│   ├── hooks/               # useAudioPlayer.ts (Web Audio API)
│   ├── utils/               # Single Source of Truth (bookingCalculations.ts, playerUtils.ts)
│   └── types/               # TypeScript интерфейсы
├── tests/                   # Автотесты (booking, player, e2e, stress)
└── dist/                    # Продакшн-бандл (готовый к деплою)
```

---

## 🎯 Основные ссылки и контакты
* **Профиль артиста:** [@besikraev](https://www.instagram.com/besikraev)
* **Telegram артиста для букинга:** [@besik_raev](https://t.me/besik_raev)
* **Ключевой релиз:** «Останься музыка» ([Instagram Reel](https://www.instagram.com/reel/DcQU8MDAMpV/))
* **Концертные билеты:** [Qtickets «Путешествие в детство»](https://moscow.qtickets.events/242585-puteshestvie-v-detstvo)
* **Вирусный спецпроект:** [`17_Бесроллинг`](file:///c:/Users/evgen/Desktop/Antigravity/NEWprodject/17_Бесроллинг/PROJECT.md)
