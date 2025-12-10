"""
Роутер для работы с пользователями

Обрабатывает CRUD операции для пользователей системы
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app import models, schemas

router = APIRouter()


@router.post("/", response_model=schemas.UserResponse)
def create_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    """
    Создание нового пользователя
    
    Args:
        user: Данные пользователя
        db: Сессия базы данных
    
    Returns:
        Созданный пользователь
    """
    # Проверка существования пользователя
    db_user = db.query(models.User).filter(
        models.User.username == user.username
    ).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Username already registered")
    
    db_user = db.query(models.User).filter(
        models.User.email == user.email
    ).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Создание пользователя
    db_user = models.User(**user.dict())
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    
    # Создание настроек по умолчанию
    default_settings = models.UserSettings(user_id=db_user.id)
    db.add(default_settings)
    db.commit()
    
    return db_user


@router.get("/{user_id}", response_model=schemas.UserResponse)
def get_user(user_id: int, db: Session = Depends(get_db)):
    """
    Получение пользователя по ID
    
    Args:
        user_id: ID пользователя
        db: Сессия базы данных
    
    Returns:
        Данные пользователя
    """
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


@router.get("/", response_model=list[schemas.UserResponse])
def get_users(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """
    Получение списка пользователей
    
    Args:
        skip: Количество записей для пропуска
        limit: Максимальное количество записей
        db: Сессия базы данных
    
    Returns:
        Список пользователей
    """
    users = db.query(models.User).offset(skip).limit(limit).all()
    return users

