from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app import models, schemas

router = APIRouter(redirect_slashes=False)


@router.get("/{user_id}/", response_model=schemas.SettingsResponse)
def get_settings(user_id: int, db: Session = Depends(get_db)):
    settings = db.query(models.UserSettings).filter(
        models.UserSettings.user_id == user_id
    ).first()
    
    if not settings:
        settings = models.UserSettings(user_id=user_id)
        db.add(settings)
        db.commit()
        db.refresh(settings)
    
    return settings


@router.put("/{user_id}/", response_model=schemas.SettingsResponse)
def update_settings(
    user_id: int,
    settings_update: schemas.SettingsUpdate,
    db: Session = Depends(get_db)
):
    settings = db.query(models.UserSettings).filter(
        models.UserSettings.user_id == user_id
    ).first()
    
    if not settings:
        settings = models.UserSettings(user_id=user_id)
        db.add(settings)
    
    update_data = settings_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(settings, field, value)
    
    db.commit()
    db.refresh(settings)
    return settings
