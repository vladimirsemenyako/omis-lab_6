from typing import Optional
from sqlalchemy.orm import Session
from app.models import Command, AudioData
from app.repositories.request_repository import RequestRepository
from app.repositories.sound_repository import SoundRepository


class RequestController:
    def __init__(self, db: Session):
        self.repository_sound = SoundRepository(db)
        self.repository_request = RequestRepository(db)
        self.db = db
    
    def form_request(self, command_text: str, user_id: int, audio_data: Optional[AudioData] = None) -> Command:
        request = Command(
            user_id=user_id,
            command_text=command_text,
            recognized_text=command_text,
            status="pending",
            language="ru-RU"
        )
        return self.repository_request.create(request)
    
    def get_request(self) -> Optional[Command]:
        requests = self.repository_request.get_all()
        return requests[-1] if requests else None

