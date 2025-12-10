"""
Модуль для работы с базой данных PostgreSQL

Использует SQLAlchemy для ORM и управления подключениями
"""

from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os

# Попытка загрузить dotenv, если установлен
try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass

# Параметры подключения к базе данных
DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql://postgres:postgres@localhost:5432/voice_assistant_db"
)

# Создание движка SQLAlchemy
engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True,  # Проверка соединения перед использованием
    echo=False  # Логирование SQL запросов (False в production)
)

# Создание фабрики сессий
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Базовый класс для моделей
Base = declarative_base()


def get_db():
    """
    Dependency для получения сессии базы данных
    
    Используется в FastAPI для автоматического управления сессиями
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

