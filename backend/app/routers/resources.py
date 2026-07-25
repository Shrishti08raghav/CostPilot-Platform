from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.auth import get_current_user
from app import models, schemas
from app.aws.cloudwatch import get_resources_with_metrics
from app.aws.optimizer import optimize_resource

router = APIRouter(prefix="/api/resources", tags=["AWS Resources"])

@router.get("", response_model=List[schemas.ResourceOut])
def list_resources(current_user: models.User = Depends(get_current_user)):
    return get_resources_with_metrics()

@router.get("/history", response_model=List[schemas.ActionHistoryOut])
def get_action_history(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return db.query(models.ActionHistory).order_by(models.ActionHistory.timestamp.desc()).all()

@router.post("/{resource_id}/optimize")
def run_optimization(
    resource_id: str,
    resource_type: str,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    result = optimize_resource(resource_id, resource_type)
    
    if result["status"] == "error":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=result["message"]
        )
        
    new_action = models.ActionHistory(
        resource_id=result["resource_id"],
        resource_type=result["resource_type"],
        action_taken=result["action"],
        savings_amount=result["savings_amount"],
        triggered_by=current_user.email
    )
    db.add(new_action)
    db.commit()
    db.refresh(new_action)
    
    return {
        "message": result["message"],
        "savings_amount": result["savings_amount"]
    }
