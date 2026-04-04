# Создание И Редактирование Сценария

Этот файл описывает все сценарии, где эксперт создаёт, редактирует, публикует или удаляет сценарий.

## Кейсы

- Создание нового черновика.
- Получение полной карточки своего сценария.
- Обновление первой шага формы.
- Обновление второго шага с критериями.
- Обновление третьего шага с вопросами и специфичными критериями.
- Публикация черновика.
- Удаление сценария.

## Участники

- `Expert` - автор сценария.
- `Editor UI` - экран редактирования сценария.
- `tRPC API` - `expertRouter` и `mutateScriptRouter`.
- `Postgres` - сценарии, критерии, вопросы.
- `Logger` - факт создания, публикации, удаления и обновления.

## Черновик И Полная Карточка

```mermaid
sequenceDiagram
    autonumber
    actor Expert
    participant UI as Editor UI
    participant API as expertRouter
    participant DB as Postgres
    participant Log as Logger

    Expert->>UI: Нажимает "Create draft"
    UI->>API: createNewDraft()
    API->>DB: insert scripts(isDraft = true)
    API->>Log: Created new draft script
    API-->>UI: scriptId

    opt Открыть свой сценарий целиком
        UI->>API: getFullScript(scriptId)
        API->>DB: Найти сценарий + category + criteria + questions
        alt сценарий не найден
            API-->>UI: NOT_FOUND
        else сценарий чужой
            API-->>UI: FORBIDDEN
        else сценарий свой
            API-->>UI: Полная карточка сценария
        end
    end
```

## Первый И Второй Шаг

```mermaid
sequenceDiagram
    autonumber
    actor Expert
    participant UI as Editor UI
    participant API as mutateScriptRouter
    participant DB as Postgres
    participant Log as Logger

    Expert->>UI: Заполняет базовые поля
    UI->>API: mutateFirstStep(scriptId, title, description, image, categoryId)
    API->>DB: update scripts set title, image, description, categoryId
    API->>Log: Updated first step script fields

    Expert->>UI: Заполняет контекст и критерии
    UI->>API: mutateSecondStep(scriptId, context, criteria, deletedCriteria)
    API->>DB: Найти сценарий и проверить владельца
    alt сценарий не найден
        API-->>UI: NOT_FOUND
    else сценарий чужой
        API-->>UI: FORBIDDEN
    else сценарий свой
        API->>DB: transaction()
        API->>DB: update scripts.context
        loop Для обновлённых критериев
            API->>DB: update script_criteria
        end
        loop Для новых критериев
            API->>DB: insert script_criteria
        end
        loop Для удаляемых критериев
            API->>DB: mark deletedAt
        end
        API->>Log: Updated second step script fields
        API-->>UI: OK
    end
```

## Третий Шаг, Публикация И Удаление

```mermaid
sequenceDiagram
    autonumber
    actor Expert
    participant UI as Editor UI
    participant API as mutateScriptRouter
    participant DB as Postgres
    participant Log as Logger

    Expert->>UI: Редактирует вопросы и критерии
    UI->>API: mutateThirdStep(scriptId, questions, deletedQuestions)
    API->>DB: Найти сценарий и проверить владельца
    alt сценарий не найден
        API-->>UI: NOT_FOUND
    else сценарий чужой
        API-->>UI: FORBIDDEN
    else сценарий свой
        API->>DB: transaction()
        loop Для каждого вопроса
            API->>DB: update existing question or insert new one
            API->>DB: sync specific criteria
        end
        opt Есть удалённые вопросы
            API->>DB: mark deletedAt for questions
        end
        API->>DB: set scripts.isDraft = false
        API->>Log: Updated third step script fields
        API-->>UI: OK
    end

    opt Опубликовать готовый черновик
        UI->>API: postDraft(scriptId)
        API->>DB: Проверить заполненность и ownership
        alt сценарий не найден
            API-->>UI: NOT_FOUND
        else сценарий чужой
            API-->>UI: FORBIDDEN
        else сценарий не заполнен
            API-->>UI: BAD_REQUEST
        else все поля готовы
            API->>DB: set isDraft = false, draftOverAt = now
            API->>Log: Published script draft
            API-->>UI: OK
        end
    end

    opt Удалить сценарий
        UI->>API: deleteScript(scriptId)
        API->>DB: Проверить ownership
        alt сценарий не найден
            API-->>UI: NOT_FOUND
        else сценарий чужой
            API-->>UI: FORBIDDEN
        else сценарий свой
            API->>DB: set deletedAt = now
            API->>Log: Deleted script
            API-->>UI: OK
        end
    end
```

