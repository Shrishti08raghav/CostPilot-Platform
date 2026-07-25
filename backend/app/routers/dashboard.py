from fastapi import APIRouter, Depends, UploadFile, File, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database import get_db
from app.auth import get_current_user
from app import models, schemas
from app.aws.cloudwatch import get_resources_with_metrics
from app.aws.cost_explorer import get_monthly_costs
from app.aws.simulator import save_uploaded_csv, reset_simulated_resources

router = APIRouter(prefix="/api/dashboard", tags=["Dashboard"])

@router.post("/upload")
async def upload_dataset(
    file: UploadFile = File(...),
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if not file.filename.endswith('.csv'):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only CSV files are supported."
        )
        
    try:
        contents = await file.read()
        content_str = contents.decode("utf-8")
        
        success = save_uploaded_csv(content_str)
        if not success:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Failed to parse the CSV file. Please check the structure."
            )
            
        db.query(models.ActionHistory).delete()
        db.commit()
        
        return {"status": "success", "message": "Dataset uploaded and parsed successfully."}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An error occurred: {str(e)}"
        )

@router.post("/reset")
def reset_dataset(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    reset_simulated_resources()
    db.query(models.ActionHistory).delete()
    db.commit()
    
    return {"status": "success", "message": "Dataset reset successfully. Returning to empty state."}

@router.get("/summary", response_model=schemas.DashboardSummary)
def get_dashboard_summary(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    resources = get_resources_with_metrics()
    
    if not resources:
        return {
            "total_cost": 0.0,
            "active_resources": 0,
            "estimated_savings": 0.0,
            "total_saved": 0.0,
            "cost_trends": []
        }
        
    active_count = sum(
        1 for r in resources 
        if r["status"] not in ["stopped", "terminated", "deleted"]
    )
    
    current_running_cost = sum(
        r["cost_per_month"] for r in resources 
        if r["status"] not in ["stopped", "terminated", "deleted"]
    )
    total_infra_cost = round(current_running_cost + 250.00, 2)
    
    estimated_savings = round(
        sum(r["savings_estimate"] for r in resources if r["status"] not in ["stopped", "terminated", "deleted"]), 2
    )
    
    total_saved_result = db.query(func.sum(models.ActionHistory.savings_amount)).scalar()
    total_saved = round(total_saved_result if total_saved_result is not None else 0.0, 2)
    
    cost_trends = get_monthly_costs()
    
    return {
        "total_cost": total_infra_cost,
        "active_resources": active_count,
        "estimated_savings": estimated_savings,
        "total_saved": total_saved,
        "cost_trends": cost_trends
    }
