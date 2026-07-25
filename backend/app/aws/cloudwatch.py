from app.config import settings
from app.aws.client import get_aws_client
from app.aws.simulator import get_simulated_resources
from typing import List, Dict, Any

def get_resources_with_metrics() -> List[Dict[str, Any]]:
    return get_simulated_resources()
