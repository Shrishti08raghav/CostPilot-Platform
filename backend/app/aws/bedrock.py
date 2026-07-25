from app.config import settings
from app.aws.client import get_aws_client
from app.aws.simulator import get_simulated_resources
from typing import List, Dict, Any

def generate_ai_recommendations() -> List[Dict[str, Any]]:
    resources = get_simulated_resources()
    recommendations = []
    
    for res in resources:
        if res["savings_estimate"] > 0 and res["status"] not in ["stopped", "terminated", "deleted"]:
            res_id = res["resource_id"]
            name = res["name"]
            res_type = res["resource_type"]
            savings = res["savings_estimate"]
            
            if res_type == "EC2":
                recommendation_text = (
                    f"AI analysis shows {name} has had extremely low CPU utilization (average {res['cpu_utilization']}% "
                    f"over the past 14 days). We recommend stopping this instance immediately to avoid idle costs."
                )
                severity = "HIGH" if savings > 100 else "MEDIUM"
            elif res_type == "EBS":
                recommendation_text = (
                    f"This EBS volume is unattached ('available' state). It is incurring charges of ${savings}/month "
                    f"without any usage. We recommend deleting it after taking a snapshot if data needs to be preserved."
                )
                severity = "LOW"
            elif res_type == "RDS":
                recommendation_text = (
                    f"RDS Instance {name} has had 0 active database connections for 10 consecutive days. "
                    f"We recommend creating a final DB snapshot and deleting the instance, or stopping it temporary."
                )
                severity = "HIGH"
            else:
                recommendation_text = f"Optimize {res_type} resource {name} to save ${savings}/month."
                severity = "LOW"
                
            recommendations.append({
                "resource_id": res_id,
                "resource_type": res_type,
                "name": name,
                "recommendation": recommendation_text,
                "estimated_savings": savings,
                "severity": severity
            })
            
    return recommendations
