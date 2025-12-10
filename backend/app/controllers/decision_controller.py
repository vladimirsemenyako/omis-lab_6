from typing import Optional, Dict, Any
from sqlalchemy.orm import Session
from app.models import Command, Device
from app.repositories.request_repository import RequestRepository
from app.repositories.decision_repository import DecisionRepository


class DecisionController:
    def __init__(self, db: Session):
        self.repository_request = RequestRepository(db)
        self.repository_decision = DecisionRepository(db)
        self.db = db
    
    def form_decision(self, analysis: Dict[str, Any], user_id: int) -> Command:
        action = analysis.get("action")
        device_type = analysis.get("device_type")
        location = analysis.get("location")
        
        if action in ["stop", "pause"]:
            devices = self.db.query(Device).filter(
                Device.owner_id == user_id,
                Device.is_on == True
            ).all()
            for dev in devices:
                dev.is_on = False
            self.db.commit()
            
            decision = Command(
                user_id=user_id,
                device_id=None,
                command_text=analysis.get("recognized_text", ""),
                recognized_text=analysis.get("recognized_text", ""),
                action="emergency_stop",
                status="executed",
                language="ru-RU"
            )
            return self.repository_decision.create(decision)
        
        device_query = self.db.query(Device).filter(
            Device.owner_id == user_id,
            Device.is_active == True
        )
        
        if device_type:
            device_query = device_query.filter(Device.device_type == device_type)
        if location:
            device_query = device_query.filter(Device.location == location)
        
        device = device_query.first()
        
        decision = Command(
            user_id=user_id,
            device_id=device.id if device else None,
            command_text=analysis.get("recognized_text", ""),
            recognized_text=analysis.get("recognized_text", ""),
            action=action,
            status="executed" if device else "failed",
            language="ru-RU"
        )
        
        if device and action in ["turn_on", "turn_off"]:
            if action == "turn_on":
                device.is_on = True
            elif action == "turn_off":
                device.is_on = False
            self.db.commit()
        
        return self.repository_decision.create(decision)
    
    def get_decision(self) -> Optional[Command]:
        decisions = self.repository_decision.get_decision()
        return decisions[-1] if decisions else None

