from typing import Optional
from sqlalchemy.orm import Session
from app.models import Command
from app.repositories.request_repository import RequestRepository
from app.repositories.response_repository import ResponseRepository
from app import schemas


class ResponseController:
    def __init__(self, db: Session):
        self.repository_request = RequestRepository(db)
        self.repository_response = ResponseRepository(db)
        self.db = db
    
    def form_response(self, decision: Command) -> schemas.VoiceCommandResponse:
        device = decision.device if decision.device_id else None
        
        if decision.action == "emergency_stop":
            message = "Выполняю экстренную остановку всех устройств!"
        elif decision.status == "executed" and device:
            if decision.action == "turn_on":
                message = f"Включаю {device.name}"
            elif decision.action == "turn_off":
                message = f"Выключаю {device.name}"
            else:
                message = f"Выполняю команду для {device.name}"
        else:
            message = "Устройство не найдено"
        
        response = schemas.VoiceCommandResponse(
            recognized_text=decision.recognized_text or decision.command_text,
            action=decision.action or "unknown",
            device_id=decision.device_id,
            status=decision.status,
            message=message
        )
        
        return response
    
    def get_response(self) -> Optional[schemas.VoiceCommandResponse]:
        responses = self.repository_response.get_response()
        if responses:
            last_response = responses[-1]
            return self.form_response(last_response)
        return None

