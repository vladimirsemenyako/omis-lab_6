"""
Роутер для работы с командами

Обрабатывает историю команд и их выполнение
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app import models, schemas

router = APIRouter()


@router.post("/", response_model=schemas.CommandResponse)
def create_command(
    command: schemas.CommandCreate,
    user_id: int = 1,  # Временное решение
    db: Session = Depends(get_db)
):
    """
    Создание новой команды
    
    Args:
        command: Данные команды
        user_id: ID пользователя
        db: Сессия базы данных
    
    Returns:
        Созданная команда
    """
    # Проверка существования пользователя
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Проверка существования устройства, если указано
    if command.device_id:
        device = db.query(models.Device).filter(
            models.Device.id == command.device_id
        ).first()
        if not device:
            raise HTTPException(status_code=404, detail="Device not found")
    
    # Создание команды
    db_command = models.Command(
        **command.dict(),
        user_id=user_id,
        status="pending"
    )
    db.add(db_command)
    db.commit()
    db.refresh(db_command)
    
    return db_command


@router.get("/", response_model=list[schemas.CommandResponse])
def get_commands(
    user_id: int = 1,  # Временное решение
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """
    Получение истории команд пользователя
    
    Args:
        user_id: ID пользователя
        skip: Количество записей для пропуска
        limit: Максимальное количество записей
        db: Сессия базы данных
    
    Returns:
        Список команд
    """
    commands = db.query(models.Command).filter(
        models.Command.user_id == user_id
    ).order_by(models.Command.created_at.desc()).offset(skip).limit(limit).all()
    return commands


@router.get("/{command_id}", response_model=schemas.CommandResponse)
def get_command(command_id: int, db: Session = Depends(get_db)):
    """
    Получение команды по ID
    
    Args:
        command_id: ID команды
        db: Сессия базы данных
    
    Returns:
        Данные команды
    """
    command = db.query(models.Command).filter(
        models.Command.id == command_id
    ).first()
    if not command:
        raise HTTPException(status_code=404, detail="Command not found")
    return command

