from typing import List, Optional
from sqlalchemy.orm import Session
from app.models import Command
from app.repositories.base import IRepository


class ResponseRepository(IRepository[Command]):
    def __init__(self, db: Session):
        self.db = db
    
    def get_by_id(self, id: int) -> Optional[Command]:
        return self.db.query(Command).filter(Command.id == id).first()
    
    def get_all(self) -> List[Command]:
        return self.db.query(Command).all()
    
    def get_response(self) -> List[Command]:
        return self.db.query(Command).filter(Command.status == "executed").all()
    
    def create_response(self, entity: Command) -> Command:
        return self.create(entity)
    
    def create(self, entity: Command) -> Command:
        self.db.add(entity)
        self.db.commit()
        self.db.refresh(entity)
        return entity
    
    def update(self, entity: Command) -> Command:
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

