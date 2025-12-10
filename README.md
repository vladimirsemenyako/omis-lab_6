# Интеллектуальная система распознавания речи для голосового управления устройствами

Система для управления устройствами через голосовые команды.

## Технологии

- **Backend**: Python 3.10+, FastAPI, PostgreSQL
- **Frontend**: React 18+, TypeScript
- **Инфраструктура**: Docker, Docker Compose

## Быстрый старт

```bash
docker-compose up -d --build
```

После запуска:
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs

## Команды

```bash
# Запуск
docker-compose up -d

# Остановка
docker-compose down

# Логи
docker-compose logs -f

# Пересборка
docker-compose up -d --build
```

## Функции

- Распознавание голосовых команд (Web Speech API)
- Управление устройствами (CRUD)
- Настройка системы
- История команд
