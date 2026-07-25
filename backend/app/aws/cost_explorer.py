from app.config import settings
from app.aws.client import get_aws_client
from app.aws.simulator import get_simulated_cost_trends
import datetime

def get_monthly_costs():
    client = get_aws_client("ce")
    if not client:
        return get_simulated_cost_trends()
        
    try:
        today = datetime.date.today()
        start_date = (today - datetime.timedelta(days=180)).strftime("%Y-%m-%d")
        end_date = today.strftime("%Y-%m-%d")
        
        response = client.get_cost_and_usage(
            TimePeriod={"Start": start_date, "End": end_date},
            Granularity="MONTHLY",
            Metrics=["UnblendedCost"]
        )
        
        trends = []
        for result in response.get("ResultsByTime", []):
            date_str = result["TimePeriod"]["Start"][:7] # YYYY-MM
            amount = float(result["Total"]["UnblendedCost"]["Amount"])
            trends.append({"date": date_str, "cost": round(amount, 2)})
        return trends
    except Exception:
        return get_simulated_cost_trends()
