from typing import List, Dict, Any
from sqlalchemy.orm import Session
from app.models import Command
from app.repositories.request_repository import RequestRepository
from app.strategies.analysis_strategy import IAnalysisStrategy, StatisticalAnalysisStrategy


class AnalysisController:
    def __init__(self, db: Session, strategy: IAnalysisStrategy = None):
        self.repository_request = RequestRepository(db)
        self.strategy = strategy or StatisticalAnalysisStrategy()
        self.db = db
    
    def conduct_analysis(self, request: Command) -> Dict[str, Any]:
        data = [request.command_text]
        result = self.strategy.analyze_data(data)
        return result
    
    def get_analytics(self) -> List[Dict[str, Any]]:
        requests = self.repository_request.get_all()
        analytics = []
        for req in requests:
            analytics.append({
                "id": req.id,
                "command_text": req.command_text,
                "status": req.status,
                "created_at": req.created_at.isoformat() if req.created_at else None
            })
        return analytics

