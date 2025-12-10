"""
Pydantic схемы для валидации данных API

Используются для сериализации/десериализации данных в запросах и ответах
"""

from pydantic import BaseModel, EmailStr
from typing import Optional, List, Dict, Any
from datetime import datetime


# User Schemas
class UserBase(BaseModel):
    """Базовая схема пользователя"""
    username: str
    email: EmailStr
    full_name: Optional[str] = None


class UserCreate(UserBase):
    """Схема для создания пользователя"""
    pass


class UserResponse(UserBase):
    """Схема ответа с данными пользователя"""
    id: int
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True


# Device Schemas
class DeviceBase(BaseModel):
    """Базовая схема устройства"""
    name: str
    device_type: str
    location: Optional[str] = None


class DeviceCreate(DeviceBase):
    """Схема для создания устройства"""
    pass


class DeviceUpdate(BaseModel):
    """Схема для обновления устройства"""
    name: Optional[str] = None
    location: Optional[str] = None
    is_active: Optional[bool] = None
    is_on: Optional[bool] = None


class DeviceResponse(DeviceBase):
    """Схема ответа с данными устройства"""
    id: int
    is_active: bool
    is_on: bool
    owner_id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# Command Schemas
class CommandBase(BaseModel):
    """Базовая схема команды"""
    command_text: str
    device_id: Optional[int] = None


class CommandCreate(CommandBase):
    """Схема для создания команды"""
    language: Optional[str] = "ru-RU"


class CommandResponse(CommandBase):
    """Схема ответа с данными команды"""
    id: int
    user_id: int
    recognized_text: Optional[str] = None
    action: Optional[str] = None
    status: str
    language: str
    created_at: datetime

    class Config:
        from_attributes = True


# Settings Schemas
class SettingsBase(BaseModel):
    """Базовая схема настроек"""
    voice_responses_enabled: Optional[bool] = True
    auto_confirmation: Optional[bool] = False
    noise_suppression: Optional[bool] = True
    emergency_commands_priority: Optional[bool] = True
    voice_timbre: Optional[str] = "female"
    speech_speed: Optional[int] = 100
    volume: Optional[int] = 80
    voice_pitch: Optional[int] = 200
    custom_keywords: Optional[List[str]] = []
    command_sequences: Optional[List[Dict[str, Any]]] = []
    hot_keys: Optional[List[Dict[str, Any]]] = []


class SettingsUpdate(SettingsBase):
    """Схема для обновления настроек"""
    pass


class SettingsResponse(SettingsBase):
    """Схема ответа с настройками"""
    id: int
    user_id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# Voice Schemas
class VoiceCommandRequest(BaseModel):
    """Схема запроса голосовой команды"""
    audio_data: Optional[str] = None  # Base64 encoded audio
    text: Optional[str] = None  # Текстовый ввод
    language: Optional[str] = "ru-RU"


class VoiceCommandResponse(BaseModel):
    """Схема ответа на голосовую команду"""
    recognized_text: str
    action: str
    device_id: Optional[int] = None
    status: str
    message: str

