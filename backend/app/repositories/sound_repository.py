from typing import List, Optional
from sqlalchemy.orm import Session
from app.models import AudioData
from app.repositories.base import IRepository


class SoundRepository(IRepository[AudioData]):
    def __init__(self, db: Session):
        self.db = db
    
    def get_by_id(self, id: int) -> Optional[AudioData]:
        return self.db.query(AudioData).filter(AudioData.id == id).first()
    
    def get_all(self) -> List[AudioData]:
        return self.db.query(AudioData).all()
    
    def get_sound(self) -> List[AudioData]:
        return self.db.query(AudioData).all()
    
    def save_sound(self, entity: AudioData) -> AudioData:
        return self.create(entity)
    
    def create(self, entity: AudioData) -> AudioData:
        self.db.add(entity)
        self.db.commit()
        self.db.refresh(entity)
        return entity
    
    def update(self, entity: AudioData) -> AudioData:
        self.db.commit()
        self.db.refresh(entity)
        return entity
    
    def delete(self, id: int) -> bool:
        entity = self.get_by_id(id)
        if entity:
            self.db.delete(entity)
            self.db.commit()
            return True
        return False

