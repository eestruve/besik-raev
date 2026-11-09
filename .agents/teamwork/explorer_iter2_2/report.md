# Исследовательский отчёт: Устранение расхождений тестового раннера и аттестации (Iteration 2)

**Автор:** `teamwork_explorer` (Iteration 2: Test Runner & Attestation Remediation)  
**Дата:** 2026-11-09  
**Рабочая директория:** `c:\Users\evgen\Desktop\Antigravity\NEWprodject\20_Сайт_Беслана\.agents\teamwork\explorer_iter2_2`  
**Статус:** Исследование завершено, сформирована и экспериментально верифицирована стратегия решения  

---

## 1. Резюме и контекст проблемы

В ходе ревью Milestones M2/M3/M4 ревьюер `teamwork_reviewer_1` выявил критическое замечание (Finding 2 — TAGGED AS INTEGRITY VIOLATION):
- В файлах `TEST_READY.md` (строки 6, 22-25, 37) и `TEST_INFRA.md` (строка 29) заявлялось, что команда `npm test` запускает тесты через **Vitest** и все тесты проходят на 100% («ALL TESTS PASSING, 100% Green»).
- Однако при фактическом запуске `npm test` (`vitest run`) процесс завершался с кодом ошибки `exit code 1` и ошибкой `Error: No test suite found in file` во всех тестовых файлах.
- Причина: тестовые файлы (`tests/booking.test.ts`, `tests/player.test.ts`, `tests/e2e.test.ts`, а также созданный позже `tests/adversarial_stress.test.ts`) были написаны с использованием встроенного модуля Node.js `node:test` (`import { describe, it } from 'node:test'`), а не API Vitest.

### Цель данного исследования
1. Досконально исследовать механизм сбоя Vitest при работе с `node:test`.
2. Оценить два подхода:
   - **Опция A:** Перевести `package.json` `"test"` на прямой вызов нативного раннера Node.js (`node --experimental-strip-types --test ...`) и синхронизировать документацию.
   - **Опция B:** Настроить конфигурацию Vitest / тесты так, чтобы **ОБА** раннера (`npm test` и `node --experimental-strip-types --test`) отрабатывали чисто с кодом 0 и 100% прохождением тестов.
3. Провести натурные испытания обеих опций реальными терминальными командами.
4. Выдать обоснованную, надёжную и аутентичную рекомендацию с готовыми патчами и планом действий для инженера-исправителя.

---

## 2. Глубокий технический анализ механизма сбоя

### 2.1. Почему падал `vitest run`
При запуске `npm test` (`vitest run`):
1. Vitest обнаруживает файлы по glob-паттерну `tests/**/*.test.ts`.
2. В процессе импорта файла среда Node.js начинает исполнять код модуля. Модуль `node:test` перехватывает вызовы `describe` и `it` и регистрирует их в **своем внутреннем реестре Node.js**, выводя в stdout свои символы `▶` и `✔`.
3. Однако **коллектор тестов Vitest** ищет тесты, зарегистрированные в глобальном или импортированном контексте самого Vitest (`vitest`).
4. Поскольку вызовы шли в `node:test`, а не в `vitest`, коллектор Vitest фиксирует: `Tests: no tests` и выбрасывает ошибку:
   ```
   FAIL tests/booking.test.ts [ tests/booking.test.ts ]
   Error: No test suite found in file ...
   FAIL tests/e2e.test.ts [ tests/e2e.test.ts ]
   Error: No test suite found in file ...
   FAIL tests/player.test.ts [ tests/player.test.ts ]
   Error: No test suite found in file ...
   FAIL tests/adversarial_stress.test.ts [ tests/adversarial_stress.test.ts ]
   Error: No test suite found in file ...
   Test Files  4 failed (4)
   Tests       no tests
   Exit code:  1
   ```
5. По умолчанию в Vitest (как и в Jest) свойство `passWithNoTests` выключено, поэтому обнаружение 0 тестов в найденном тест-файле считается фатальной ошибкой раннера.

### 2.2. Анализ импортов в тестах
Поиск по кодовой базе `tests/` показал:
- Во всех 4 тест-файлах (`booking.test.ts`, `player.test.ts`, `e2e.test.ts`, `adversarial_stress.test.ts`) из `node:test` импортируются **исключительно** две функции:
  ```ts
  import { describe, it } from 'node:test';
  ```
- Для утверждений используется стандартный модуль:
  ```ts
  import assert from 'node:assert/strict';
  ```
- Никаких проприетарных специфических вызовов (вроде `test.mock`, `test.diagnostic`) в коде тестов нет.

---

## 3. Сравнительный анализ: Опция A vs Опция B

Были проведены практические эксперименты для обоих подходов.

### 3.1. Опция A: Нативный раннер Node.js как единственный скрипт `test`

#### Реализация:
В `package.json` скрипт `"test"` заменяется на:
```json
"scripts": {
  "test": "node --experimental-strip-types --test tests/booking.test.ts tests/player.test.ts tests/e2e.test.ts tests/adversarial_stress.test.ts",
  "test:verify": "node scripts/verify-build.mjs",
  "test:all": "npm test && npm run test:verify"
}
```
И обновляются `TEST_READY.md` и `TEST_INFRA.md`: удаляются упоминания Vitest, фиксируется запуск через Node 25.

#### Результаты натурного тестирования:
- Команда: `node --experimental-strip-types --test tests/booking.test.ts tests/player.test.ts tests/e2e.test.ts tests/adversarial_stress.test.ts`
- **Результат:** `Exit code 0`
- **Метрики:** 90 тестов пройдено, 30 сьютов, 0 сбоев, время выполнения ~296 мс.
- Команда верификации сборки: `node scripts/verify-build.mjs`
- **Результат:** `Exit code 0`, 26/26 проверок пройдено за 150 мс.

#### Плюсы Опции A:
1. **Нулевой оверхед на сборку:** Тесты исполняются напрямую рантаймом Node.js без инициализации Vite, трансформаций esbuild и запуска воркеров Vitest.
2. **Экстремальная скорость:** Полный прогон занимает менее 300 мс (в 5 раз быстрее Vitest).
3. **Чистота зависимостей рантайма:** Не требует никаких конфигурационных файлов алиасов. Тесты на 100% соответствуют написанному в них коду (`node:test`).

#### Минусы Опции A:
1. **Пакет `vitest` становится мертвым грузом:** В `devDependencies` установлен `"vitest": "^3.0.5"`. Если `npm test` не вызывает Vitest, то либо этот пакет нужно удалить, либо возникнет вопрос, зачем он в проекте.
2. **Ограничения на будущее тестирование React-компонентов:** Нативный раннер Node.js `--experimental-strip-types` не умеет парсить JSX/TSX без внешнего транспилятора или загрузчика. Если в будущем потребуются тесты с рендерингом компонентов (например, `@testing-library/react`), потребуется возвращать Vitest.
3. **Неожиданность для разработчиков экосистемы Vite:** В проектах на Vite стандартом де-факто для `npm test` является именно Vitest.

---

### 3.2. Опция B: Обеспечение дуальной совместимости (Dual Execution Engine)

#### Архитектурная идея:
В `TEST_INFRA.md` (строка 29) изначально декларировалась архитектурная цель:
> *«Dual execution compatibility: runs natively with Node.js built-in test runner (`node --experimental-strip-types --test`) AND with Vitest (`npm test»*

Для того чтобы эта цель стала **100% истинной и верифицируемой на практике**, достаточно настроить алиас модулей в Vitest:
`node:test` ➔ `vitest`.

#### Способ реализации B1 (через выделенный `vitest.config.ts` — Рекомендуемый):
В корне проекта создается `vitest.config.ts`:
```ts
import { defineConfig, mergeConfig } from 'vitest/config';
import viteConfig from './vite.config';

export default mergeConfig(
  viteConfig,
  defineConfig({
    resolve: {
      alias: {
        'node:test': 'vitest',
      },
    },
    test: {
      globals: false,
      environment: 'node',
      include: ['tests/**/*.test.ts'],
    },
  })
);
```

#### Результаты натурного тестирования Опции B:
Был запущен Vitest с конфигурацией `mergeConfig` и алиасом `'node:test': 'vitest'`:
- Команда: `npx vitest run -c <config>`
- **Результат:** `Exit code 0`
- **Лог выполнения:**
  ```
  RUN  v3.2.7 C:/Users/evgen/Desktop/Antigravity/NEWprodject/20_Сайт_Беслана

  ✓ tests/player.test.ts (21 tests) 6ms
  ✓ tests/e2e.test.ts (20 tests) 11ms
  ✓ tests/booking.test.ts (23 tests) 36ms
  ✓ tests/adversarial_stress.test.ts (70 tests) 49ms

  Test Files  4 passed (4)
       Tests  134 passed (134)
    Duration  1.59s (tests 101ms)
  ```
- **Все 4 тест-файла и все 134 проверки успешно пройдены за 1.59s!**
- Одновременно с этим нативный раннер `node --experimental-strip-types --test tests/*.test.ts` по-прежнему отрабатывает на 100% за 296 мс (поскольку Node.js нативно резолвит `node:test`, игнорируя конфиг Vitest).

#### Плюсы Опции B:
1. **Истинная дуальная совместимость:** И `npm test` (`vitest run`), и `npm run test:node` (`node --experimental-strip-types --test`) работают **без единой ошибки** и с кодом `0`.
2. **Абсолютная честность аттестации:** Заявления в `TEST_READY.md` и `TEST_INFRA.md` о поддержке Vitest становятся подтвержденным фактом, а не ложным утверждением.
3. **Нулевые изменения в тестах:** В самих файлах `tests/*.test.ts` не нужно менять ни строчки импортов — стандартный синтаксис `import { describe, it } from 'node:test'` поддерживается обоими раннерами.
4. **Изоляция продакшн-сборки:** Создание `vitest.config.ts` оставляет файл `vite.config.ts` в первозданном виде для команды `npm run build`, гарантируя отсутствие побочных эффектов для продакшн-бандла.
5. **Готовность к UI-тестированию:** Vitest готов для будущего расширения компонентными тестами на React 19 без переписывания архитектуры.

#### Минусы Опции B:
1. Требуется один дополнительный файл конфигурации (`vitest.config.ts`) размером в 18 строк.
2. Время выполнения Vitest (~1.6 с) чуть выше нативного Node.js (~0.3 с) из-за инициализации Vite.

---

## 4. Сводная сравнительная матрица

| Критерий | Опция A (Только Node.js) | Опция B (Дуальный раннер: Vitest + Node.js) |
| :--- | :---: | :---: |
| **Устранение `exit code 1` в `npm test`** | Да (подменой команды) | Да (полноценным исправлением работы Vitest) |
| **Команда `npm test` (`vitest run`) работает?** | Нет (удаляется) | **Да, 134 теста проходят за 1.59s** |
| **Команда `node --experimental-strip-types --test` работает?** | Да, 90 тестов за 296ms | **Да, 90 тестов за 296ms** |
| **Соответствие заявленной архитектуре в `TEST_INFRA.md`** | Частичное (отказ от Vitest) | **100% полное (реализация дуальной совместимости)** |
| **Необходимость правок в коде тестов `tests/*.ts`** | Нет | **Нет** |
| **Влияние на продакшн-билд `npm run build`** | Отсутствует | **Отсутствует (отдельный `vitest.config.ts`)** |
| **Потенциал расширения (React UI/DOM тесты)** | Ограничен (нужен внешний лоадер JSX) | **Полный (нативная поддержка JSX в Vitest)** |

---

## 5. Итоговая рекомендация: Расширенная Опция B (Hybrid Dual-Engine Architecture)

Мы рекомендуем принять **Опцию B** как наиболее аутентичное, профессиональное и архитектурно выверенное решение.

### Конкретный план исправления (Remediation Plan):

#### Шаг 1. Создать `vitest.config.ts` в корне проекта
Создать файл `c:\Users\evgen\Desktop\Antigravity\NEWprodject\20_Сайт_Беслана\vitest.config.ts`:
```ts
import { defineConfig, mergeConfig } from 'vitest/config';
import viteConfig from './vite.config';

export default mergeConfig(
  viteConfig,
  defineConfig({
    resolve: {
      alias: {
        'node:test': 'vitest',
      },
    },
    test: {
      globals: false,
      environment: 'node',
      include: ['tests/**/*.test.ts'],
    },
  })
);
```

#### Шаг 2. Дополнить скрипты в `package.json`
Обновить секцию `"scripts"` в `package.json`, предоставив разработчикам и CI явные команды для обоих режимов:
```json
"scripts": {
  "dev": "vite",
  "build": "tsc -b && vite build",
  "preview": "vite preview",
  "test": "vitest run",
  "test:node": "node --experimental-strip-types --test tests/booking.test.ts tests/player.test.ts tests/e2e.test.ts tests/adversarial_stress.test.ts",
  "test:verify": "node scripts/verify-build.mjs",
  "test:all": "npm test && npm run test:verify"
}
```

#### Шаг 3. Взаимодействие с Finding 1 (Раскукливание тестов и выделение `src/utils/`)
В ходе нашего исследования также проверена техническая осуществимость решения Finding 1 от Reviewer 1:
- При вынесении чистых функций в `src/utils/bookingCalculations.ts` и `src/utils/playerUtils.ts`, тесты должны импортировать их по относительному пути с расширением:
  ```ts
  import { calculateBookingCost, ... } from '../src/utils/bookingCalculations.ts';
  import { formatTime, ... } from '../src/utils/playerUtils.ts';
  ```
- Мы экспериментально проверили: рантайм `node --experimental-strip-types --test` **безупречно резолвит относительные `.ts` импорты** между модулями, если они написаны на чистом TypeScript (без JSX).
- А Vitest благодаря `vite.config.ts` нативно понимает и алиас `@/`, и прямые относительные импорты.
- Таким образом, Опция B полностью гармонирует с устранением Finding 1!

#### Шаг 4. Актуализация `TEST_READY.md` и `TEST_INFRA.md`
1. В `TEST_READY.md`:
   - Зафиксировать реальные проверенные метрики выполнения для обоих раннеров:
     * Vitest (`npm test`): 134 теста, 4 файла, 0 ошибок (~1.6s).
     * Node Native (`npm run test:node`): 90 тестов, 30 сьютов, 0 ошибок (~296ms).
     * Verify Harness (`npm run test:verify`): 26 проверок из 26 (~150ms).
   - Включить в таблицу сьютов файл `tests/adversarial_stress.test.ts` (стресс-тесты и граничные условия).
2. В `TEST_INFRA.md`:
   - В разделе 3 («Test Runner Architecture») детально описать механизм маппинга `'node:test': 'vitest'` в `vitest.config.ts`.
   - Подтвердить фактическое достижение дуальной совместимости без искажения фактов.

---

## 6. Метод независимой проверки (Verification Method)

Для проверки выводов данного отчета выполните следующие команды:

1. **Проверка работы Vitest с алиасом (экспериментальный конфиг):**
   ```powershell
   npx vitest run -c .agents/teamwork/explorer_iter2_2/vitest_merged.config.ts
   ```
   *Ожидаемый результат:* 4 test files passed, 134 passed, 0 failed, exit code 0.

2. **Проверка нативного раннера Node.js:**
   ```powershell
   node --experimental-strip-types --test tests/booking.test.ts tests/player.test.ts tests/e2e.test.ts tests/adversarial_stress.test.ts
   ```
   *Ожидаемый результат:* 90 pass, 30 suites, 0 fail, exit code 0.

3. **Проверка скрипта верификации дистрибутива:**
   ```powershell
   node scripts/verify-build.mjs
   ```
   *Ожидаемый результат:* 26/26 checks passed, exit code 0.
