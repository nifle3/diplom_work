# Жалобы, Категории, Эксперты И Достижения

Этот файл собирает административные и moderation-сценарии. Здесь же лежат простые CRUD-потоки для категорий, экспертов и достижений.

## Кейсы

- Создание жалобы и защита от дубля.
- Получение своих жалоб.
- Получение жалобы по id.
- Список жалоб для админа и эксперта.
- Изменение статуса жалобы.
- CRUD категорий.
- Повышение и понижение эксперта.
- CRUD достижений и пересчёт наград.

## Участники

- `User` / `Expert` / `Admin` - инициатор.
- `Moderation UI` - экран жалоб, категорий или админ-панель.
- `tRPC API` - `reportRouter`, `categoryRouter`, `expertManagerRouter`, `achievementRouter`.
- `Postgres` - жалобы, статусы, категории, пользователи, достижения.
- `Logger` - запись действий админа и модерации.

## Жалобы

```mermaid
sequenceDiagram
    autonumber
    actor User
    participant UI as Moderation UI
    participant API as reportRouter
    participant DB as Postgres
    participant Log as Logger

    User->>UI: Отправляет жалобу на сценарий
    UI->>API: create(scriptId, reason)
    API->>DB: Проверить существующую активную жалобу
    alt уже есть active report
        API-->>UI: existing report id
    else сценарий не найден
        API-->>UI: NOT_FOUND
    else можно создать
        API->>DB: insert report
        API->>DB: insert initial status log = new
        API->>Log: Created report
        API-->>UI: report id
    end

    UI->>API: myList()
    API->>DB: Прочитать жалобы текущего пользователя
    API-->>UI: Список жалоб

    UI->>API: adminList() / expertList()
    API->>DB: Прочитать релевантные сценарии и жалобы
    API-->>UI: Отфильтрованный список
```

## Просмотр И Изменение Статуса Жалобы

```mermaid
sequenceDiagram
    autonumber
    actor Admin
    participant UI as Moderation UI
    participant API as reportRouter.getById / changeStatus
    participant DB as Postgres
    participant Log as Logger

    Admin->>UI: Открывает жалобу
    UI->>API: getById(reportId)
    API->>DB: Найти жалобу + reporter + scenario + status logs
    alt жалоба не найдена
        API-->>UI: NOT_FOUND
    else нет прав
        API-->>UI: FORBIDDEN
    else доступ разрешён
        API-->>UI: report details
    end

    Admin->>UI: Меняет статус
    UI->>API: changeStatus(reportId, status)
    API->>DB: Проверить жалобу
    alt жалоба не найдена
        API-->>UI: NOT_FOUND
    else жалоба найдена
        API->>DB: insert status log
        API->>Log: Updated report status
        API-->>UI: reportId + status
    end
```

## Категории И Эксперты

```mermaid
sequenceDiagram
    autonumber
    actor Admin
    participant UI as Admin UI
    participant API as categoryRouter / expertManagerRouter
    participant DB as Postgres
    participant Log as Logger

    Admin->>UI: Открывает список категорий
    UI->>API: getAll() / getAll experts
    API->>DB: Прочитать categories / experts
    API-->>UI: Список

    Admin->>UI: Создаёт или правит категорию
    UI->>API: create(name) / updateById(id, name) / deleteById(id)
    API->>DB: insert or update or soft delete category
    API->>Log: Created / Updated / Deleted category
    API-->>UI: OK

    Admin->>UI: Меняет роль пользователя
    UI->>API: setUserExpert(email) / unsetUserExpert(userId)
    API->>DB: update users.roleId
    API-->>UI: OK
```

## Достижения

```mermaid
sequenceDiagram
    autonumber
    actor Admin
    participant UI as Admin UI
    participant API as achievementRouter
    participant DB as Postgres
    participant Log as Logger

    Admin->>UI: Создаёт или обновляет достижение
    UI->>API: create(...) / updateById(...)
    API->>DB: Валидация формулы и insert/update achievements
    API->>DB: syncAllUserAchievements()
    API->>Log: Created / Updated achievement
    API-->>UI: achievement id

    Admin->>UI: Пересчитывает все достижения
    UI->>API: recalculateAll()
    API->>DB: syncAllUserAchievements()
    API->>Log: Recalculated all achievements
    API-->>UI: result
```

