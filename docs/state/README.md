# Диаграммы состояний

PlantUML-диаграммы состояний для сущностей и рабочих состояний, которые реально управляются логикой проекта.

## Список диаграмм

| Файл | Элемент |
|------|---------|
| [01_script_lifecycle.puml](01_script_lifecycle.puml) | Жизненный цикл сценария |
| [02_interview_session_lifecycle.puml](02_interview_session_lifecycle.puml) | Жизненный цикл интервью-сессии |
| [03_report_lifecycle.puml](03_report_lifecycle.puml) | Жизненный цикл жалобы |
| [04_sandbox_session_state.puml](04_sandbox_session_state.puml) | Операционное состояние sandbox-сессии эксперта |

## Что сюда попало

Я отобрал только те элементы, где в коде есть явные переходы состояния:

- `scripts.isDraft` и `scripts.deletedAt`.
- `interview_session_status_log` со статусами `active`, `complete`, `canceled`.
- `report_status_log` со статусами `new`, `in_review`, `resolved`, `rejected`.
- `currentQuestionIndex`, `summarize` и перестройка истории в sandbox-сессии.

Для рендеринга используйте [PlantUML](https://plantuml.com/):

```bash
plantuml docs/state/*.puml
```
