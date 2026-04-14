# Нагрузочное тестирование (k6)

Нагрузочное тестирование tRPC-эндпоинтов платформы через [Grafana k6](https://k6.io/).

Скрипт делает HTTP-запросы напрямую к tRPC-эндпоинтам (`/api/trpc/<procedure>`), воспроизводя формат superjson-трансформера, который использует клиентское приложение.

## Содержание

- [Структура файлов](#структура-файлов)
- [Установка](#установка)
- [Быстрый старт](#быстрый-старт)
- [Получение cookie](#получение-cookie)
- [Сьюты (наборы сценариев)](#сьюты-наборы-сценариев)
- [Пресеты нагрузки](#пресеты-нагрузки)
- [Переменные окружения](#переменные-окружения)
- [Метрики и пороговые значения](#метрики-и-пороговые-значения)
- [Seed-скрипт](#seed-скрипт)
- [Примеры запуска](#примеры-запуска)
- [Чтение результатов](#чтение-результатов)
- [Типичные сценарии использования](#типичные-сценарии-использования)

---

## Структура файлов

```
tools/loadTest/
├── script.js    — основной k6-скрипт с тестовыми сценариями
├── seed.mjs     — Node.js-скрипт для подготовки данных и запуска k6
├── package.json — npm-пакет с удобными командами
└── README.md    — эта документация
```

**`script.js`** — запускается k6. Содержит все сценарии, конфигурацию нагрузки и кастомные метрики.

**`seed.mjs`** — запускается Node.js перед k6. Автоматически получает `scriptId` и `sessionId` через tRPC API, если они нужны для выбранного suite и не заданы вручную. Затем запускает k6 с нужными переменными окружения.

---

## Установка

Требуется [k6](https://k6.io/docs/get-started/installation/):

```bash
# macOS
brew install k6

# Linux (Debian/Ubuntu)
sudo gpg -k
sudo gpg --no-default-keyring --keyring /usr/share/keyrings/k6-archive-keyring.gpg \
  --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys C5AD17C747E3415A3642D57D77C6C491D6AC1D69
echo "deb [signed-by=/usr/share/keyrings/k6-archive-keyring.gpg] https://dl.k6.io/deb stable main" \
  | sudo tee /etc/apt/sources.list.d/k6.list
sudo apt-get update && sudo apt-get install k6

# NixOS / nix develop
nix develop  # k6 включён в devShell
```

Node.js >= 18 (для `seed.mjs` с нативным `fetch`).

---

## Быстрый старт

1. Убедитесь, что приложение запущено (`pnpm run dev` — сервер на `:3001`).
2. [Получите cookie авторизации](#получение-cookie).
3. Запустите тест:

```bash
# Через seed-скрипт (рекомендуется)
LOADTEST_COOKIE="<ваш cookie>" pnpm --dir tools/loadTest run load

# В nix-окружении
LOADTEST_COOKIE="<ваш cookie>" nix develop -c pnpm --dir tools/loadTest run load
```

По умолчанию запускается suite `core` в режиме `baseline` (8 VU, 20 секунд).

---

## Получение cookie

Нагрузочный тест использует cookie для имитации авторизованного пользователя. Нужна cookie активной сессии.

**Способ 1 — браузер:**
1. Откройте приложение в браузере и войдите в аккаунт.
2. Откройте DevTools → Application → Cookies.
3. Скопируйте значение cookie `better-auth.session_token` (или аналогичного).
4. Передайте в формате `better-auth.session_token=<value>`.

**Способ 2 — curl:**
```bash
curl -s -c /tmp/cookies.txt -X POST http://localhost:3001/api/auth/sign-in/email \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password"}' > /dev/null
# Извлечь значение нужной cookie из /tmp/cookies.txt
```

---

## Сьюты (наборы сценариев)

Сьют задаётся через `LOADTEST_SUITE`. Каждый VU в цикле прогоняет все сценарии выбранного сьюта последовательно.

### `public`

Публичные эндпоинты, не требующие авторизации.

| Сценарий | Метод | Описание |
|---|---|---|
| `healthCheck` | GET | Проверка доступности API |

### `catalog`

Просмотр каталога скриптов. Требует авторизации (`LOADTEST_COOKIE`).

| Сценарий | Метод | Описание |
|---|---|---|
| `script.categories` | GET | Список категорий скриптов |
| `script.getLatest` | GET | Последние 5 скриптов |
| `script.list` | GET | Пагинированный список (страница 1, 12 шт.) |
| `script.getInfo` | GET | Детальная информация по скрипту (нужен `LOADTEST_SCRIPT_ID`) |

### `user`

Профиль и статистика пользователя. Требует авторизации.

| Сценарий | Метод | Описание |
|---|---|---|
| `user.getStats` | GET | Общая статистика пользователя |
| `user.getStreak` | GET | Текущий стрик активности |
| `profile.getMyProfileStats` | GET | Статистика профиля |
| `profile.getMyHistory` | GET | История прохождений |
| `profile.getMyAchivements` | GET | Список достижений |
| `activity.getLatestUserActivity` | GET | Последняя активность |

### `storage`

Работа с файлами. Требует авторизации.

| Сценарий | Метод | Описание |
|---|---|---|
| `file.getUploadLink` | POST (mutation) | Получение presigned URL для загрузки аватара |

### `session`

Работа с интервью-сессиями. Требует авторизации и `LOADTEST_SESSION_ID` (подставляется seed-скриптом автоматически).

| Сценарий | Метод | Описание |
|---|---|---|
| `session.getScriptByInterviewId` | GET | Скрипт конкретной сессии |
| `session.getAllHistory` | GET | История сообщений сессии |

### `core` (по умолчанию)

Объединяет `public` + `catalog` + `user` + `storage`. Покрывает основной пользовательский путь без session-эндпоинтов.

### `all`

Все сценарии: `core` + `session`.

---

## Пресеты нагрузки

Пресет задаётся через `LOADTEST_MODE`.

| Mode | VU | Duration | Назначение |
|---|---|---|---|
| `baseline` | 8 | 20s | Нормальная нагрузка — точка отсчёта для метрик |
| `working` | 30 | 30s | Рабочая нагрузка — типичное число одновременных пользователей |
| `elevated` | 75 | 40s | Повышенная нагрузка — пиковые часы |
| `stress` | 1500 | 45s | Стресс-тест — поиск точки отказа |

Значения VU и Duration можно переопределить вручную через `LOADTEST_USERS` и `LOADTEST_DURATION` независимо от выбранного пресета.

**Что такое VU (Virtual User):** каждый VU — это отдельная горутина k6, которая выполняет сценарии в бесконечном цикле на протяжении всей длительности теста. Между итерациями — случайная пауза 0.5–2.0 секунды (think time).

---

## Переменные окружения

### Переменные `script.js` (передаются в k6 через `--env` или напрямую)

| Переменная | Значение по умолчанию | Обязательная | Описание |
|---|---|---|---|
| `LOADTEST_BASE_URL` | `http://localhost:3001` | Нет | Базовый URL приложения |
| `LOADTEST_COOKIE` | — | Для большинства suite | Cookie авторизованной сессии |
| `LOADTEST_HEADERS_JSON` | — | Нет | JSON-объект с дополнительными заголовками, например `{"X-Api-Key":"abc"}` |
| `LOADTEST_TIMEOUT_MS` | `30000` | Нет | Таймаут одного запроса в миллисекундах |
| `LOADTEST_SUITE` | `core` | Нет | Набор сценариев: `public`, `catalog`, `user`, `storage`, `session`, `core`, `all` |
| `LOADTEST_MODE` | `baseline` | Нет | Пресет нагрузки: `baseline`, `working`, `elevated`, `stress` |
| `LOADTEST_USERS` | — | Нет | Переопределяет количество VU из пресета |
| `LOADTEST_DURATION` | — | Нет | Переопределяет длительность из пресета, например `60s`, `2m` |
| `LOADTEST_SCRIPT_ID` | — | Для `catalog`, `core`, `all` | UUID скрипта для `script.getInfo`. Подставляется seed-скриптом автоматически |
| `LOADTEST_SESSION_ID` | — | Для `session`, `all` | UUID сессии для `session.*`. Подставляется seed-скриптом автоматически |

### Переменные `seed.mjs` (читаются из окружения процесса)

`seed.mjs` читает те же переменные через `process.env`. Дополнительно:

- Если `LOADTEST_SCRIPT_ID` не задан и нужен для suite — seed сам запросит последний доступный скрипт через `script.getLatest`.
- Если `LOADTEST_SESSION_ID` не задан и нужен — seed создаст новую сессию через `session.createNewSession`.

---

## Метрики и пороговые значения

### Встроенные метрики k6

k6 автоматически собирает стандартные HTTP-метрики:

| Метрика | Описание |
|---|---|
| `http_req_duration` | Общее время запроса (включая DNS, подключение, ожидание, передачу) |
| `http_req_failed` | Доля неудачных запросов (сетевые ошибки, таймауты) |
| `http_reqs` | Общее число запросов |
| `iterations` | Число завершённых итераций VU |
| `vus` / `vus_max` | Текущее и максимальное число VU |

### Кастомные метрики

| Метрика | Тип | Описание |
|---|---|---|
| `trpc_latency` | Trend | Время ответа tRPC-эндпоинта в мс. Выводит p50, p90, p95, p99 |
| `trpc_ok` | Counter | Счётчик успешных запросов (HTTP 200) |
| `trpc_fail` | Counter | Счётчик неудачных запросов (не HTTP 200) |
| `trpc_error_rate` | Rate | Доля неудачных запросов |

Все кастомные метрики тегируются именем процедуры (`{ name: "procedure.name" }`), что позволяет смотреть разбивку по эндпоинтам в итоговом отчёте.

### Пороговые значения (thresholds)

Тест считается **провальным** если хотя бы одно условие нарушено:

| Метрика | Порог | Смысл |
|---|---|---|
| `trpc_latency` | `p(95) < 5000` | 95% запросов к tRPC должны отвечать быстрее 5 секунд |
| `trpc_error_rate` | `rate < 0.1` | Менее 10% tRPC-запросов могут завершиться с ошибкой |
| `http_req_failed` | `rate < 0.1` | Менее 10% HTTP-запросов могут завершиться сетевой ошибкой или таймаутом |

---

## Seed-скрипт

`seed.mjs` решает проблему зависимых данных: некоторые эндпоинты (`script.getInfo`, `session.*`) требуют UUID конкретного скрипта или сессии. Ручной поиск этих ID неудобен, поэтому seed-скрипт автоматизирует этот шаг.

### Алгоритм работы

```
1. Прочитать LOADTEST_SUITE и LOADTEST_COOKIE из окружения
2. Если suite требует авторизацию, но COOKIE не задан → вывести предупреждение
3. Если нужен scriptId и LOADTEST_SCRIPT_ID не задан:
     → GET script.getLatest { limit: 1 }
     → записать id первого скрипта в LOADTEST_SCRIPT_ID
4. Если нужен sessionId и LOADTEST_SESSION_ID не задан:
     → POST session.createNewSession { scriptId }
     → записать полученный id в LOADTEST_SESSION_ID
5. Запустить: k6 run <path/to/script.js> [дополнительные аргументы]
   с обогащёнными переменными окружения
```

### Передача дополнительных аргументов k6

Все аргументы, переданные в `seed.mjs` (или `pnpm run load`), пробрасываются напрямую в k6:

```bash
# Передать --out csv=results.csv в k6
LOADTEST_COOKIE="..." pnpm --dir tools/loadTest run load -- --out csv=results.csv

# Запустить только 1 итерацию для отладки
LOADTEST_COOKIE="..." pnpm --dir tools/loadTest run load -- --iterations 1
```

---

## Примеры запуска

### Быстрая проверка доступности (без авторизации)

```bash
LOADTEST_SUITE=public pnpm --dir tools/loadTest run load
```

### Baseline-тест основных эндпоинтов

```bash
LOADTEST_COOKIE="better-auth.session_token=abc123" \
  pnpm --dir tools/loadTest run load
```

### Стресс-тест каталога

```bash
LOADTEST_SUITE=catalog \
LOADTEST_MODE=stress \
LOADTEST_COOKIE="better-auth.session_token=abc123" \
  pnpm --dir tools/loadTest run load
```

### Тест с кастомным числом VU и длительностью

```bash
LOADTEST_MODE=working \
LOADTEST_USERS=50 \
LOADTEST_DURATION=2m \
LOADTEST_COOKIE="better-auth.session_token=abc123" \
  pnpm --dir tools/loadTest run load
```

### Полный тест включая сессии

```bash
LOADTEST_SUITE=all \
LOADTEST_MODE=working \
LOADTEST_COOKIE="better-auth.session_token=abc123" \
  pnpm --dir tools/loadTest run load
```

### Запуск против staging-среды

```bash
LOADTEST_BASE_URL="https://staging.example.com" \
LOADTEST_COOKIE="better-auth.session_token=abc123" \
LOADTEST_MODE=elevated \
  pnpm --dir tools/loadTest run load
```

### Запуск k6 напрямую (без seed-скрипта)

```bash
# Передать script ID вручную, минуя seed
LOADTEST_SCRIPT_ID="550e8400-e29b-41d4-a716-446655440000" \
LOADTEST_COOKIE="better-auth.session_token=abc123" \
  k6 run tools/loadTest/script.js
```

### Сохранить результаты в CSV

```bash
LOADTEST_COOKIE="better-auth.session_token=abc123" \
  pnpm --dir tools/loadTest run load -- --out csv=results.csv
```

---

## Чтение результатов

После завершения k6 выводит сводную таблицу. Ключевые строки:

```
✓ trpc_latency............: avg=142ms  p(90)=310ms p(95)=480ms p(99)=1200ms
✓ trpc_error_rate.........: 0.00%      0 out of 4320
✓ http_req_failed.........: 0.00%      0 out of 4320
  trpc_ok..................: 4320
  trpc_fail................: 0
  http_reqs................: 4320       72/s
  iterations...............: 320        5.33/s
  vus......................: 30         min=30 max=30
```

- `✓` — пороговое значение выполнено.
- `✗` — пороговое значение нарушено, тест считается провальным (exit code 99).
- `avg`, `p(90)`, `p(95)`, `p(99)` — процентили задержки.
- `http_reqs` и `/s` — общий throughput.

### Разбивка по эндпоинтам

Благодаря тегу `name` на каждом запросе, в расширенном выводе (`--out csv` или Grafana k6 Cloud) можно смотреть метрики отдельно для каждой процедуры.

```bash
# Включить более подробный вывод тегов
k6 run --summary-trend-stats="avg,p(90),p(95),p(99)" tools/loadTest/script.js
```

---

## Типичные сценарии использования

### Регрессионная проверка перед деплоем

```bash
LOADTEST_SUITE=core LOADTEST_MODE=working LOADTEST_COOKIE="..." \
  pnpm --dir tools/loadTest run load
# Если exit code != 0 — пороги нарушены, деплой нежелателен
```

### Поиск точки отказа

Последовательно увеличивайте нагрузку, наблюдая за ростом p95 и error rate:

```bash
LOADTEST_MODE=baseline  # 8 VU  — смотрите baseline метрики
LOADTEST_MODE=working   # 30 VU — рабочая нагрузка
LOADTEST_MODE=elevated  # 75 VU — пиковая
LOADTEST_MODE=stress    # 1500 VU — найти предел
```

### Изолированное тестирование одного роутера

```bash
LOADTEST_SUITE=session LOADTEST_MODE=working LOADTEST_COOKIE="..." \
  pnpm --dir tools/loadTest run load
```

### Отладка одного запроса

```bash
# 1 VU, 1 итерация — удобно для проверки корректности запросов
LOADTEST_SUITE=catalog LOADTEST_COOKIE="..." \
  k6 run --vus 1 --iterations 1 tools/loadTest/script.js
```
