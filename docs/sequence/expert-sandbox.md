# Sandbox-Сессии Для Эксперта

Sandbox нужен, чтобы эксперт мог прогнать свой сценарий как кандидат и проверить вопросы, суммаризацию и ветвление без влияния на боевую сессию.

## Кейсы

- Создание sandbox-сессии.
- Получение состояния sandbox-сессии.
- Отправка ответа и переход к следующему вопросу.
- Отправка ответа и завершение прогонки.
- Откат к предыдущему ответу.

## Участники

- `Expert` - автор сценария.
- `Sandbox UI` - интерфейс прогонки.
- `tRPC API` - `expertSandboxRouter`.
- `Postgres` - sandbox-сессия и сообщения.
- `LLM` - суммаризация, оценка ответа, планирование следующего шага.

## Создание И Просмотр

```mermaid
sequenceDiagram
    autonumber
    actor Expert
    participant UI as Sandbox UI
    participant API as expertSandboxRouter.createSession / getSession
    participant DB as Postgres

    Expert->>UI: Нажимает "Start sandbox"
    UI->>API: createSession(scriptId)
    API->>DB: Найти сценарий эксперта и первый вопрос
    alt сценарий не найден
        API-->>UI: NOT_FOUND
    else контекст пустой
        API-->>UI: BAD_REQUEST
    else вопросов нет
        API-->>UI: BAD_REQUEST
    else всё валидно
        API->>DB: insert interview_sessions
        API->>DB: insert first AI message
        API-->>UI: sessionId
    end

    UI->>API: getSession(sessionId)
    API->>DB: Прочитать sandbox-сессию, сценарий и сообщения
    alt сессия не найдена
        API-->>UI: NOT_FOUND
    else сессия найдена
        API-->>UI: sandbox state
    end
```

## Ответ И Следующий Вопрос

```mermaid
sequenceDiagram
    autonumber
    actor Expert
    participant UI as Sandbox UI
    participant API as expertSandboxRouter.sendAnswer
    participant DB as Postgres
    participant LLM as LLM

    Expert->>UI: Отправляет ответ
    UI->>API: sendAnswer(sessionId, content)
    API->>DB: Прочитать текущую sandbox-сессию и последний AI-вопрос
    alt сессия не найдена
        API-->>UI: NOT_FOUND
    else нет текущего topic
        API-->>UI: BAD_REQUEST
    else последний message не AI
        API-->>UI: BAD_REQUEST
    else поток валиден
        API->>LLM: summarize(...)
        API->>LLM: evaluateAnswer(mode = answer)
        API->>LLM: planInterviewStep(...)
        alt decision = finish
            API->>LLM: evaluateAnswer(mode = session)
            API-->>UI: finished + finalEvaluation
        else decision = next_topic or keep topic
            API->>DB: update currentQuestionIndex
            API->>DB: insert next AI question
            API-->>UI: next-question + analysisNote
        end
    end
```

## Откат К Ответу

```mermaid
sequenceDiagram
    autonumber
    actor Expert
    participant UI as Sandbox UI
    participant API as expertSandboxRouter.rewindSession
    participant DB as Postgres
    participant LLM as LLM

    Expert->>UI: Выбирает ответ, к которому нужно откатиться
    UI->>API: rewindSession(sessionId, messageId)
    API->>DB: Прочитать сообщения сессии
    alt сессия не найдена
        API-->>UI: NOT_FOUND
    else сообщение не найдено
        API-->>UI: NOT_FOUND
    else выбран AI message
        API-->>UI: BAD_REQUEST
    else выбран собственный ответ
        API->>LLM: summarize() для оставшейся цепочки
        API->>DB: delete messages after selected message
        API->>DB: update currentQuestionIndex and summarize
        API-->>UI: restored messages + currentQuestionIndex
    end
```

