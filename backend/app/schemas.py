from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import List, Optional

# Auth Schemas
class UserCreate(BaseModel):
    email: EmailStr
    password: str

class UserOut(BaseModel):
    id: int
    email: EmailStr
    is_active: bool

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None

# Action History Schemas
class ActionHistoryCreate(BaseModel):
    resource_id: str
    resource_type: str
    action_taken: str
    savings_amount: float
    triggered_by: str

class ActionHistoryOut(BaseModel):
    id: int
    resource_id: str
    resource_type: str
    action_taken: str
    savings_amount: float
    timestamp: datetime
    triggered_by: str

    class Config:
        from_attributes = True

# AWS Resource Schemas
class ResourceOut(BaseModel):
    resource_id: str
    resource_type: str
    status: str
    name: str
    cost_per_month: float
    cpu_utilization: Optional[float] = None
    state_reason: Optional[str] = None
    savings_estimate: float

# AI Recommendations Schemas
class RecommendationOut(BaseModel):
    resource_id: str
    resource_type: str
    name: str
    recommendation: str
    estimated_savings: float
    severity: str  # "HIGH", "MEDIUM", "LOW"

# Dashboard Schemas
class CostTrend(BaseModel):
    date: str
    cost: float

class DashboardSummary(BaseModel):
    total_cost: float
    active_resources: int
    estimated_savings: float
    total_saved: float
    cost_trends: List[CostTrend]
