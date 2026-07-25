from fastapi import APIRouter, Depends
from typing import List
from app.auth import get_current_user
from app import models, schemas
from app.aws.bedrock import generate_ai_recommendations

router = APIRouter(prefix="/api/recommendations", tags=["AI Recommendations"])

@router.get("", response_model=List[schemas.RecommendationOut])
def get_recommendations(current_user: models.User = Depends(get_current_user)):
    return generate_ai_recommendations()
