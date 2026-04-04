# Жизненный Цикл Интервью-Сессии

Этот файл описывает основной продуктовый поток: создание интервью, получение первого вопроса, ответы, финализацию, отмену и просмотр результата.

## Кейсы

- Создание новой интервью-сессии.
- Получение сценария по interview id.
- Получение истории сообщений.
- Отправка ответа и получение следующего вопроса.
- Завершение интервью по решению планировщика.
- Ручное завершение интервью.
- Отмена интервью.
- Получение результата завершённой сессии.

## Участники

- `User` - кандидат.
- `Interview UI` - экран интервью.
- `tRPC API` - `sessionRouter`.
- `Postgres` - интервью-сессии, статус-логи, сообщения, XP.
- `LLM` - суммаризация, оценка ответа, планирование следующего шага.
- `Logger` - фиксация завершения, отмены и отправки ответа.

## Создание Сессии

```mermaid
sequenceDiagram
    autonumber
    actor User
    participant UI as Interview UI
    participant API as sessionRouter.createNewSession
    participant DB as Postgres
    participant Log as Logger

    User->>UI: Нажимает "Start interview"
    UI->>API: createNewSession(scriptId)
    API->>DB: Найти published сценарий + первый вопрос
    alt сценарий не найден
        API-->>UI: NOT_FOUND
    else контекст пустой
        API-->>UI: INTERNAL_SERVER_ERROR
    else вопросов нет
        API-->>UI: BAD_REQUEST
    else сессия уже была закреплена
        API->>DB: Прочитать activeInterviewSessionId у пользователя
        API-->>UI: existing sessionId
    else новая сессия
        API->>DB: transaction()
        API->>DB: update users.activeInterviewSessionId = sessionId
        API->>DB: insert interview_sessions
        API->>DB: insert status log active
        API->>DB: insert first AI message
        API->>Log: Created interview session
        API-->>UI: sessionId
    end
```

## Ответ И Следующий Вопрос

```mermaid
sequenceDiagram
    autonumber
    actor User
    participant UI as Interview UI
    participant API as sessionRouter.addNewMessage
    participant DB as Postgres
    participant LLM as LLM
    participant Log as Logger

    User->>UI: Отправляет ответ
    UI->>API: addNewMessage(sessionId, content)
    API->>DB: Прочитать активную сессию, последний AI-вопрос и текущий topic
    alt сессия не найдена
        API-->>UI: NOT_FOUND
    else сессия уже не active
        API-->>UI: NOT_FOUND
    else нет последнего AI-вопроса
        API-->>UI: INTERNAL_SERVER_ERROR
    else нет текущего topic
        API-->>UI: BAD_REQUEST
    else поток валиден
        API->>LLM: summarize(answer, question, prev summary)
        API->>LLM: evaluateAnswer(mode = answer)
        API->>DB: transaction()
        API->>DB: update summarize
        API->>DB: insert user message + analysis note
        API->>LLM: planInterviewStep(...)
        alt decision = finish
            API->>DB: finalizeSession()
            API->>LLM: evaluateAnswer(mode = session)
            API->>DB: insert complete status
            API->>DB: update finalScore and expertFeedback
            API->>DB: add XP if score > 0
            API->>DB: clear activeInterviewSessionId
            API->>DB: sync achievements
            API->>Log: Processed interview answer and finished session
            API-->>UI: finished + result
        else decision = next_topic or keep topic
            API->>DB: update currentQuestionIndex
            API->>DB: insert next AI question
            API->>Log: Processed interview answer and generated next question
            API-->>UI: next-question
        end
    end
```

## Ручное Завершение И Отмена

```mermaid
sequenceDiagram
    autonumber
    actor User
    participant UI as Interview UI
    participant API as sessionRouter.finishSession / cancelSession
    participant DB as Postgres
    participant LLM as LLM
    participant Log as Logger

    User->>UI: Нажимает "Finish" или "Cancel"
    UI->>API: finishSession(sessionId) / cancelSession(sessionId)
    API->>DB: Найти сессию, сообщения, последний статус и сценарий
    alt сессия не найдена
        API-->>UI: NOT_FOUND
    else сессия уже terminal
        API-->>UI: result = complete:false / canceled:false
    else нужна финализация
        API->>LLM: evaluateAnswer(mode = session) или calculate final evaluation
        API->>DB: insert complete/canceled status
        API->>DB: update finalScore / expertFeedback
        API->>DB: clear activeInterviewSessionId
        opt finishSession
            API->>DB: add XP
            API->>DB: sync achievements
        end
        API->>Log: Finished interview session / Canceled interview session
        API-->>UI: result
    end
```

## Результат И История

```mermaid
sequenceDiagram
    autonumber
    actor User
    participant UI as Interview UI
    participant API as sessionRouter.getResultBySessionId / getAllHistory / getScriptByInterviewId
    participant DB as Postgres

    User->>UI: Открывает результаты или историю
    UI->>API: getResultBySessionId(sessionId)
    API->>DB: Прочитать сессию, сообщения, status log и script
    alt сессия не найдена
        API-->>UI: NOT_FOUND
    else сессия найдена
        API-->>UI: result + questions + experienceGained
    end

    UI->>API: getAllHistory(sessionId) / getScriptByInterviewId(sessionId)
    API->>DB: Прочитать историю сообщений или script
    API-->>UI: История или script
```

