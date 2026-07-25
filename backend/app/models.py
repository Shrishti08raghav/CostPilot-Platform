from sqlalchemy import Column, Integer, String, Float, DateTime, Boolean
import datetime
from app.database import Base

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    is_active = Column(Boolean, default=True)

class ActionHistory(Base):
    __tablename__ = "action_history"
    
    id = Column(Integer, primary_key=True, index=True)
    resource_id = Column(String, index=True, nullable=False)
    resource_type = Column(String, nullable=False)  # e.g., "EC2", "EBS", "RDS"
    action_taken = Column(String, nullable=False)   # e.g., "STOPPED", "TERMINATED", "RELEASED"
    savings_amount = Column(Float, nullable=False)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)
    triggered_by = Column(String, nullable=False)   # User's email or "SYSTEM"
