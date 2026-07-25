import boto3
from app.config import settings
from app.aws import simulator

def get_aws_client(service_name: str):
    if settings.SIMULATION_MODE:
        return None
    try:
        return boto3.client(
            service_name,
            aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
            aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
            region_name=settings.AWS_DEFAULT_REGION
        )
    except Exception:
        # Fall back to simulation if client creation fails
        return None
