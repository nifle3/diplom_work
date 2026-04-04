# Load Tests (k6)

Нагрузочное тестирование tRPC-ручек проекта через [k6](https://k6.io/).

Скрипт делает HTTP-запросы напрямую к tRPC-эндпоинтам (`/api/trpc/<procedure>`), повторяя формат superjson-трансформера.

## Запуск

Простой запуск (suite `core`, mode `baseline`):

```bash
nix develop -c pnpm --dir tools/loadTest run load
```

С параметрами:

```bash
LOADTEST_SUITE=core LOADTEST_MODE=stress LOADTEST_COOKIE="$COOKIE" \
  nix develop -c pnpm --dir tools/loadTest run load
```

Напрямую через k6 (без seed-скрипта):

```bash
LOADTEST_SCRIPT_ID="..." LOADTEST_COOKIE="$COOKIE" \
  nix develop -c k6 run tools/loadTest/script.js
```

С переопределением VU и длительности:

```bash
LOADTEST_MODE=stress LOADTEST_USERS=2000 LOADTEST_DURATION=60s LOADTEST_COOKIE="$COOKIE" \
  nix develop -c pnpm --dir tools/loadTest run load
```

## Пресеты нагрузки

| Mode       | VU   | Duration |
|------------|------|----------|
| `baseline` | 8    | 20s      |
| `working`  | 30   | 30s      |
| `elevated` | 75   | 40s      |
| `stress`   | 1500 | 45s      |

## Сьюты (suites)

- `public` — healthCheck
- `catalog` — script.categories, script.getLatest, script.list, script.getInfo
- `user` — user.getStats, user.getStreak, profile.*, activity.*
- `storage` — file.getUploadLink
- `session` — session.getScriptByInterviewId, session.getAllHistory
- `core` — все кроме session
- `all` — все сценарии

## Переменные окружения

| Variable                | Default                  | Description                              |
|-------------------------|--------------------------|------------------------------------------|
| `LOADTEST_BASE_URL`     | `http://localhost:3001`  | Базовый URL                              |
| `LOADTEST_COOKIE`       | —                        | Cookie для авторизованных ручек          |
| `LOADTEST_HEADERS_JSON` | —                        | Дополнительные заголовки (JSON-объект)    |
| `LOADTEST_TIMEOUT_MS`   | `30000`                  | Таймаут на запрос                        |
| `LOADTEST_SUITE`        | `core`                   | Набор сценариев                          |
| `LOADTEST_MODE`         | `baseline`               | Пресет нагрузки                          |
| `LOADTEST_USERS`        | —                        | Переопределение кол-ва VU                |
| `LOADTEST_DURATION`     | —                        | Переопределение длительности (e.g. `60s`)|
| `LOADTEST_SCRIPT_ID`    | —                        | ID скрипта для script.getInfo            |
| `LOADTEST_SESSION_ID`   | —                        | ID сессии для session.*                  |

## Seed-скрипт

`seed.mjs` автоматически получает `scriptId` и `sessionId` через tRPC API перед запуском k6 (если нужны для выбранного suite и не заданы явно).

## Метрики

k6 выводит стандартные метрики + кастомные:

- `trpc_latency` — время ответа (p50, p95, p99)
- `trpc_ok` / `trpc_fail` — счётчики успешных/неудачных запросов
- `trpc_error_rate` — процент ошибок

Thresholds: p95 < 5s, error rate < 10%.
