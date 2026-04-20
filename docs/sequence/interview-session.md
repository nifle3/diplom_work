# Создание Сессии Интервью И Обработка Ответа

Этот файл оставляет только два базовых потока: создание сессии и обработку ответа с цепочкой LLM-вызовов.

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
        API->>DB: Найти уже активную сессию через interview_session_status_log
        API-->>UI: existing sessionId
    else новая сессия
        API->>DB: transaction()
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
