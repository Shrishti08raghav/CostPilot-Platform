from app.config import settings
from app.aws.client import get_aws_client
from app.aws.simulator import optimize_simulated_resource
from typing import Dict, Any

def optimize_resource(resource_id: str, resource_type: str) -> Dict[str, Any]:
    client = get_aws_client("ec2")
    if not client:
        return optimize_simulated_resource(resource_id)
        
    try:
        if resource_type == "EC2":
            client.stop_instances(InstanceIds=[resource_id])
            return {
                "status": "success",
                "resource_id": resource_id,
                "resource_type": "EC2",
                "action": "STOPPED",
                "savings_amount": 0.0,
                "message": f"Successfully stopped EC2 instance {resource_id}"
            }
        elif resource_type == "EBS":
            client.delete_volume(VolumeId=[resource_id])
            return {
                "status": "success",
                "resource_id": resource_id,
                "resource_type": "EBS",
                "action": "DELETED",
                "savings_amount": 0.0,
                "message": f"Successfully deleted EBS volume {resource_id}"
            }
        return optimize_simulated_resource(resource_id)
    except Exception as e:
        return optimize_simulated_resource(resource_id)
