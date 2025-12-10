"""
Модели данных для базы данных

Содержит SQLAlchemy модели, соответствующие объектной модели системы
"""

from sqlalchemy import Column, Integer, String, Boolean, DateTime, Float, ForeignKey, Text, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base


class User(Base):
    """
    Модель пользователя системы
    
    Хранит информацию о пользователях системы (специалисты, пользователи умного дома, инвалиды)
    """
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(100), unique=True, index=True, nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    full_name = Column(String(255), nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Связи
    devices = relationship("Device", back_populates="owner", cascade="all, delete-orphan")
    commands = relationship("Command", back_populates="user", cascade="all, delete-orphan")
    settings = relationship("UserSettings", back_populates="user", uselist=False, cascade="all, delete-orphan")


class Device(Base):
    """
    Модель устройства
    
    Представляет физическое устройство, которым можно управлять через голосовые команды
    """
    __tablename__ = "devices"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    device_type = Column(String(100), nullable=False)  # light, thermostat, tv, etc.
    location = Column(String(255), nullable=True)  # Гостиная, Спальня, etc.
    is_active = Column(Boolean, default=True)
    is_on = Column(Boolean, default=False)
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Связи
    owner = relationship("User", back_populates="devices")
    commands = relationship("Command", back_populates="device")


class Command(Base):
    """
    Модель голосовой команды
    
    Хранит историю команд пользователей и их результаты
    """
    __tablename__ = "commands"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    device_id = Column(Integer, ForeignKey("devices.id"), nullable=True)
    command_text = Column(Text, nullable=False)  # Текст распознанной команды
    recognized_text = Column(Text, nullable=True)  # Распознанный текст после обработки
    action = Column(String(255), nullable=True)  # Выполненное действие
    status = Column(String(50), default="pending")  # pending, executed, failed
    language = Column(String(10), default="ru-RU")  # Язык команды
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Связи
    user = relationship("User", back_populates="commands")
    device = relationship("Device", back_populates="commands")


class UserSettings(Base):
    """
    Модель настроек пользователя
    
    Хранит персональные настройки интерфейса и голосового помощника
    """
    __tablename__ = "user_settings"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    
    # Настройки голосовых ответов
    voice_responses_enabled = Column(Boolean, default=True)
    auto_confirmation = Column(Boolean, default=False)
    noise_suppression = Column(Boolean, default=True)
    emergency_commands_priority = Column(Boolean, default=True)
    
    # Настройки стиля системы
    voice_timbre = Column(String(20), default="female")  # male, female, neutral
    speech_speed = Column(Integer, default=100)  # 50-200
    volume = Column(Integer, default=80)  # 0-100
    voice_pitch = Column(Integer, default=200)  # 80-300
    
    # Дополнительные настройки
    custom_keywords = Column(JSON, default=list)  # Пользовательские ключевые слова
    command_sequences = Column(JSON, default=list)  # Последовательности команд
    hot_keys = Column(JSON, default=list)  # Горячие клавиши
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Связи
    user = relationship("User", back_populates="settings")


class AudioData(Base):
    """
    Модель аудио данных
    
    Хранит информацию о записанных аудио сигналах (подсистема сбора данных)
    """
    __tablename__ = "audio_data"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    file_path = Column(String(500), nullable=True)  # Путь к файлу аудио
    duration = Column(Float, nullable=True)  # Длительность в секундах
    sample_rate = Column(Integer, nullable=True)  # Частота дискретизации
    noise_level = Column(Float, nullable=True)  # Уровень шума
    processed = Column(Boolean, default=False)  # Обработано ли аудио
    created_at = Column(DateTime(timezone=True), server_default=func.now())

