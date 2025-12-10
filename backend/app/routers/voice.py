from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app import schemas
from app.controllers.request_controller import RequestController
from app.controllers.analysis_controller import AnalysisController
from app.controllers.decision_controller import DecisionController
from app.controllers.response_controller import ResponseController
from app.strategies.analysis_strategy import StatisticalAnalysisStrategy

router = APIRouter(redirect_slashes=False)


@router.post("/process/", response_model=schemas.VoiceCommandResponse)
def process_voice_command(
    request: schemas.VoiceCommandRequest,
    user_id: int = 1,
    db: Session = Depends(get_db)
):
    if not request.text and not request.audio_data:
        raise HTTPException(status_code=400, detail="No command text or audio provided")
    
    command_text = request.text or "распознанный текст из аудио"
    
    request_controller = RequestController(db)
    analysis_controller = AnalysisController(db, StatisticalAnalysisStrategy())
    decision_controller = DecisionController(db)
    response_controller = ResponseController(db)
    
    request_obj = request_controller.form_request(command_text, user_id)
    analysis_result = analysis_controller.conduct_analysis(request_obj)
    decision = decision_controller.form_decision(analysis_result, user_id)
    response = response_controller.form_response(decision)
    
    return response
