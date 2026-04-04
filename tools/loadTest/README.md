# Load Tests

Нагрузочный раннер для `tRPC`-ручек проекта.

Он использует тот же стек, что и приложение: `@trpc/client` + `superjson`, поэтому запросы идут максимально близко к реальному `web`-клиенту.
Основная логика лежит в `tools/loadTest/src/*.ts`, а `loadtest.mjs` только поднимает TypeScript-entrpoint через `node --experimental-strip-types`.

## Запуск

```bash
nix develop -c pnpm --dir tools/loadTest run load -- --suite core --mode baseline --cookie "$LOADTEST_COOKIE"
```

Или так:

```bash
nix develop -c node tools/loadTest/loadtest.mjs --scenario healthCheck --mode stress
```

## Пресеты нагрузки

- `baseline`: 8 виртуальных пользователей
- `working`: 30 виртуальных пользователей
- `elevated`: 75 виртуальных пользователей
- `stress`: 1500 виртуальных пользователей

Проверка типов:

```bash
nix develop -c pnpm --dir tools/loadTest run check-types
```

Если нужен верхний предел из вашего диапазона, можно переопределить пользователей:

```bash
nix develop -c pnpm --dir tools/loadTest run load -- --suite core --mode stress --users 2000 --cookie "$LOADTEST_COOKIE"
```

## Сценарии

- `public`
- `catalog`
- `user`
- `storage`
- `session`
- `core`
- `all`

Если нужен один конкретный endpoint, используйте `--scenario`.

## Переменные окружения

- `LOADTEST_BASE_URL` - базовый URL, по умолчанию `http://localhost:3001`
- `LOADTEST_COOKIE` - cookie header для защищённых ручек
- `LOADTEST_HEADERS_JSON` - дополнительные заголовки в JSON
- `LOADTEST_TIMEOUT_MS` - таймаут на один запрос
- `LOADTEST_SCRIPT_ID` - id сценария для `script.getInfo`
- `LOADTEST_SESSION_ID` - id интервью для `session.*`

## Что измеряется

- количество успешных и упавших запросов
- `rps`
- `p50`, `p95`, `p99`
- список ошибок

Если хочешь, следующим сообщением я могу ещё добавить отдельный `report.md`-экспорт результатов в папку `tools/loadTest/reports`, чтобы его было удобно вставлять в диплом.
