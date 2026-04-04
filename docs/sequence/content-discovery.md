# Контент, Каталог И Профиль

Этот файл покрывает все read-only сценарии, где пользователь смотрит сценарии, профиль, историю и быстрые метрики.

## Кейсы

- Просмотр карточки сценария.
- Получение последних сценариев.
- Список сценариев с фильтрами и пагинацией.
- Просмотр профиля эксперта.
- Получение справочников категорий и типов критериев.
- Просмотр собственного профиля и статистики.
- Просмотр собственной истории и достижений.
- Получение последней активности.
- Получение истории по сценарию.

## Участники

- `User` - обычный пользователь или эксперт.
- `Web UI` - экран каталога, профиля или истории.
- `tRPC API` - `scriptRouter`, `profileRouter`, `userRouter`, `activityRouter`.
- `Postgres` - выборки из `scripts`, `users`, `interview_sessions`, `achievements`.
- `File storage` - только для `getLatest`, когда у сценария есть картинка.

## Карточка Сценария

```mermaid
sequenceDiagram
    autonumber
    actor User
    participant UI as Web UI
    participant API as scriptRouter.getInfo
    participant DB as Postgres

    User->>UI: Открывает страницу сценария
    UI->>API: getInfo(scriptId)
    API->>DB: Найти published сценарий без soft delete
    alt сценарий не найден
        API-->>UI: NOT_FOUND
    else сценарий найден
        API-->>UI: Карточка сценария + эксперт + категория
    end
```

## Последние Сценарии

```mermaid
sequenceDiagram
    autonumber
    actor User
    participant UI as Web UI
    participant API as scriptRouter.getLatest
    participant DB as Postgres
    participant FS as File storage

    User->>UI: Открывает главную или ленту
    UI->>API: getLatest(limit)
    API->>DB: Выбрать свежие published сценарии
    loop Для каждого сценария с image
        API->>FS: Получить persistent link
        FS-->>API: Ссылка на картинку
    end
    API-->>UI: Список сценариев
```

## Каталог И Эксперт

```mermaid
sequenceDiagram
    autonumber
    actor User
    participant UI as Web UI
    participant API as scriptRouter.list / getExpertProfile / categories / criteriaTypes
    participant DB as Postgres

    User->>UI: Ищет сценарий или эксперта
    UI->>API: list(page, limit, categoryId, search)
    API->>DB: Посчитать total и выбрать страницу сценариев
    API-->>UI: Страница каталога

    opt Открыт профиль эксперта
        UI->>API: getExpertProfile(expertId, categoryId?)
        API->>DB: Найти эксперта и его published сценарии
        API-->>UI: Эксперт + категории + сценарии
    end

    opt Нужны справочники
        UI->>API: categories() / criteriaTypes()
        API->>DB: Прочитать справочники
        API-->>UI: Списки категорий и типов критериев
    end
```

## Профиль И История

```mermaid
sequenceDiagram
    autonumber
    actor User
    participant UI as Web UI
    participant API as profileRouter / userRouter / activityRouter / scriptRouter
    participant DB as Postgres

    User->>UI: Открывает профиль, историю или статистику
    par Профиль
        UI->>API: getMyProfile()
        API->>DB: Найти пользователя по id
        API-->>UI: Профиль
    and Статистика
        UI->>API: getMyProfileStats() / getStats() / getStreak()
        API->>DB: Посчитать XP, интервью, достижения и streak
        API-->>UI: Статистика и streak
    and История
        UI->>API: getMyHistory() / getLatestUserActivity()
        API->>DB: Выбрать последние или завершённые сессии
        API-->>UI: История и активность
    and Достижения
        UI->>API: getMyAchivements()
        API->>DB: Прочитать awarded achievements
        API-->>UI: Достижения
    end
```

## История По Сценарию

```mermaid
sequenceDiagram
    autonumber
    actor User
    participant UI as Web UI
    participant API as scriptRouter.getUserHistory / getUserHistoryByScript
    participant DB as Postgres

    User->>UI: Открывает историю прохождений
    UI->>API: getUserHistory() / getUserHistoryByScript(scriptId)
    API->>DB: Выбрать сессии пользователя
    API-->>UI: Список с finishedAt и current status
```

