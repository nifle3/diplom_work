# Диаграммы классов

PlantUML-диаграммы классов для ключевых сущностей, сервисов и подсистем проекта.

Схемы построены по реальному коду и отражают:

- таблицы и связи из `packages/db/src/schema`;
- доменные значения и ошибки из `packages/domain`;
- композицию сервисов в `packages/api`;
- внутреннюю структуру `auth`, `file` и `llm` подсистем.

## Список диаграмм

| Файл | Слой |
|------|------|
| [01_persistence_model.puml](01_persistence_model.puml) | Основная модель данных и связи |
| [02_domain_model.puml](02_domain_model.puml) | Доменные значения и ошибки |
| [03_service_dependencies.puml](03_service_dependencies.puml) | Сервисные зависимости и DI-контекст |
| [04_auth_integration.puml](04_auth_integration.puml) | Интеграция auth с БД и поддерживающими сервисами |
| [05_file_subsystem.puml](05_file_subsystem.puml) | Внутренняя модель файловой подсистемы |
| [06_llm_subsystem.puml](06_llm_subsystem.puml) | Внутренняя модель LLM-подсистемы |

## Рендеринг

Для рендеринга используйте [PlantUML](https://plantuml.com/):

```bash
plantuml docs/classDIagram/*.puml
```

Если у вас уже стоит расширение PlantUML для VS Code, можно рендерить и через него.
