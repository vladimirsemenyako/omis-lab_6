.PHONY: help build up down restart logs clean

help: ## Показать эту справку
	@echo "Доступные команды:"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-15s\033[0m %s\n", $$1, $$2}'

build: ## Собрать Docker образы
	docker-compose build

up: ## Запустить все сервисы
	docker-compose up -d

down: ## Остановить все сервисы
	docker-compose down

restart: ## Перезапустить все сервисы
	docker-compose restart

logs: ## Показать логи всех сервисов
	docker-compose logs -f

logs-backend: ## Показать логи backend
	docker-compose logs -f backend

logs-frontend: ## Показать логи frontend
	docker-compose logs -f frontend

logs-db: ## Показать логи базы данных
	docker-compose logs -f db

ps: ## Показать статус контейнеров
	docker-compose ps

shell-backend: ## Открыть shell в backend контейнере
	docker-compose exec backend bash

shell-db: ## Открыть psql в базе данных
	docker-compose exec db psql -U postgres -d voice_assistant_db

migrate: ## Применить миграции базы данных
	docker-compose exec backend alembic upgrade head

migrate-create: ## Создать новую миграцию (использовать: make migrate-create MESSAGE="описание")
	docker-compose exec backend alembic revision --autogenerate -m "$(MESSAGE)"

clean: ## Удалить контейнеры, volumes и образы
	docker-compose down -v --rmi all

clean-volumes: ## Удалить только volumes (удалит данные БД!)
	docker-compose down -v

prod-build: ## Собрать production образы
	docker-compose -f docker-compose.prod.yml build

prod-up: ## Запустить production сервисы
	docker-compose -f docker-compose.prod.yml up -d

prod-down: ## Остановить production сервисы
	docker-compose -f docker-compose.prod.yml down

