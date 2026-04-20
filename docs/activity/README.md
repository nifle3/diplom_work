# Диаграммы деятельности

PlantUML диаграммы деятельности для ключевых бизнес-процессов платформы.

## Список диаграмм

| Файл | Процесс |
|------|---------|
| [01_create_session.puml](01_create_session.puml) | Создание новой сессии интервью |
| [02_add_message.puml](02_add_message.puml) | Обработка ответа пользователя в интервью |
| [03_finalize_session.puml](03_finalize_session.puml) | Завершение / отмена сессии интервью |
| [04_create_script.puml](04_create_script.puml) | Создание скрипта (трёхшаговый мастер) |
| [05_sync_achievements.puml](05_sync_achievements.puml) | Синхронизация достижений пользователя |
| [06_report_creation.puml](06_report_creation.puml) | Создание жалобы на скрипт |
| [09_streak_calculation.puml](09_streak_calculation.puml) | Расчёт серии (streak) пользователя |
| [10_llm_evaluate_answer.puml](10_llm_evaluate_answer.puml) | LLM: Оценка ответа (два режима) |
| [11_llm_plan_interview_step.puml](11_llm_plan_interview_step.puml) | LLM: Планирование следующего шага интервью |

## Рендеринг

Для рендеринга используйте [PlantUML](https://plantuml.com/):

```bash
# Установка через brew / apt
brew install plantuml

# Рендер всех диаграмм
plantuml docs/activity/*.puml
```

Или используйте расширение PlantUML для VS Code.
