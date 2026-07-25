import json
import os
import csv
import datetime
from typing import Dict, List, Any

STATE_FILE = os.path.join(os.path.dirname(__file__), "simulated_state.json")
CSV_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "dataset.csv")

def parse_csv_content(content: str) -> List[Dict[str, Any]]:
    resources = []
    try:
        lines = content.strip().splitlines()
        if not lines:
            return []
            
        reader = csv.DictReader(lines)
        headers = reader.fieldnames
        if not headers:
            return []
            
        # Smart helper to match CSV headers to our resource properties
        def find_col(possible_names):
            for name in possible_names:
                for h in headers:
                    if name.lower() in h.lower() or h.lower() in name.lower():
                            return h
                return None
                
        id_col = find_col(["resource_id", "resource id", "id", "lineitem/resourceid", "arn"])
        type_col = find_col(["resource_type", "resource type", "type", "service", "product", "instance type", "instancetype"])
        name_col = find_col(["resource_name", "resource name", "name", "title", "label", "instance type", "instancetype"])
        cost_col = find_col(["cost", "cost_per_month", "cost per month", "unblendedcost", "amount", "price", "spend", "priceperunit"])
        cpu_col = find_col(["cpu_utilization", "cpu", "utilization", "usage", "load", "vcpu"])
        status_col = find_col(["status", "state", "status_code", "current generation"])
        
        row_count = 0
        for row in reader:
            row_count += 1
            if row_count > 200:
                break
                
            res_id = row.get(id_col) if id_col else f"res-{len(resources) + 1}"
            if res_id:
                res_id = res_id.strip().replace('"', '')
                
            res_type = "EC2"
            raw_type = row.get(type_col, "EC2") if type_col else "EC2"
            if raw_type:
                raw_type = raw_type.upper()
                if "EBS" in raw_type or "VOLUME" in raw_type:
                    res_type = "EBS"
                elif "RDS" in raw_type or "DATABASE" in raw_type:
                    res_type = "RDS"
                elif "S3" in raw_type or "BUCKET" in raw_type:
                    res_type = "S3"
                elif "ELB" in raw_type or "BALANCER" in raw_type:
                    res_type = "ELB"
            
            res_name = row.get(name_col) if name_col else f"resource-{len(resources) + 1}"
            if res_name:
                res_name = res_name.strip().replace('"', '')
                
            res_cost = 10.0
            if cost_col:
                try:
                    val = float(row.get(cost_col, 0.0))
                    if val < 5.0 and cost_col.lower() == "priceperunit":
                        res_cost = val * 730.0
                    else:
                        res_cost = val
                except (ValueError, TypeError):
                    res_cost = 10.0
                    
            res_cpu = None
            if cpu_col:
                try:
                    val = float(row.get(cpu_col, 0.0))
                    if cpu_col.lower() == "vcpu":
                        res_cpu = 1.5 if val > 2 else 45.0
                    else:
                        res_cpu = val
                except (ValueError, TypeError):
                    res_cpu = None
                    
            res_status = "running"
            if status_col:
                val = row.get(status_col, "running").lower()
                if "yes" in val:
                    res_status = "running"
                elif "no" in val:
                    res_status = "stopped"
                else:
                    res_status = val
            
            savings = 0.0
            reason = "Running fine"
            if res_status in ["running", "available", "active", "in-use"]:
                if res_cpu is not None and res_cpu < 5.0 and res_type == "EC2":
                    savings = res_cost
                    reason = f"Idle instance (CPU load average {res_cpu}%)"
                elif res_type == "EBS" and res_status == "available":
                    savings = res_cost
                    reason = "Unattached storage volume"
                elif res_type == "RDS" and res_cpu is not None and res_cpu < 1.0:
                    savings = res_cost
                    reason = "0 active database connections"
            
            resources.append({
                "resource_id": res_id if res_id != "0" and res_id else f"res-{len(resources) + 1}",
                "resource_type": res_type,
                "name": res_name,
                "status": res_status,
                "cost_per_month": round(res_cost, 2),
                "cpu_utilization": round(res_cpu, 2) if res_cpu is not None else None,
                "state_reason": reason,
                "savings_estimate": round(savings, 2)
            })
            
        return resources
    except Exception as e:
        print(f"Error parsing CSV content: {e}")
        return []

def save_uploaded_csv(content: str) -> bool:
    try:
        with open(CSV_PATH, "w", encoding="utf-8") as f:
            f.write(content)
        resources = parse_csv_content(content)
        save_state(resources)
        return True
    except Exception as e:
        print(f"Error saving uploaded CSV: {e}")
        return False

def load_state() -> List[Dict[str, Any]]:
    if os.path.exists(STATE_FILE):
        try:
            with open(STATE_FILE, "r") as f:
                return json.load(f)
        except Exception:
            pass
    return []

def save_state(state: List[Dict[str, Any]]) -> None:
    with open(STATE_FILE, "w") as f:
        json.dump(state, f, indent=4)

def get_simulated_resources() -> List[Dict[str, Any]]:
    return load_state()

def optimize_simulated_resource(resource_id: str) -> Dict[str, Any]:
    resources = load_state()
    for res in resources:
        if res["resource_id"] == resource_id:
            if res["status"] in ["stopped", "terminated", "deleted"]:
                return {"status": "error", "message": f"Resource {resource_id} is already optimized"}
            
            savings = res["savings_estimate"]
            
            if res["resource_type"] == "EC2":
                res["status"] = "stopped"
                res["cpu_utilization"] = 0.0
                res["savings_estimate"] = 0.0
            elif res["resource_type"] == "EBS":
                res["status"] = "deleted"
                res["savings_estimate"] = 0.0
            elif res["resource_type"] == "RDS":
                res["status"] = "stopped"
                res["cpu_utilization"] = 0.0
                res["savings_estimate"] = 0.0
                
            save_state(resources)
            return {
                "status": "success",
                "resource_id": resource_id,
                "resource_type": res["resource_type"],
                "action": "STOPPED" if res["resource_type"] in ["EC2", "RDS"] else "DELETED",
                "savings_amount": savings,
                "message": f"Successfully optimized {res['resource_type']} resource {res['name']} ({resource_id})"
            }
            
    return {"status": "error", "message": f"Resource {resource_id} not found"}

def reset_simulated_resources() -> None:
    if os.path.exists(STATE_FILE):
        try:
            os.remove(STATE_FILE)
        except Exception:
            pass
    if os.path.exists(CSV_PATH):
        try:
            os.remove(CSV_PATH)
        except Exception:
            pass

def get_simulated_cost_trends() -> List[Dict[str, float]]:
    resources = load_state()
    if not resources:
        return []
        
    today = datetime.date.today()
    trends = []
    
    total_monthly_spend = sum(r["cost_per_month"] for r in resources)
    base_cost = max(total_monthly_spend + 200.0, 450.0)
    
    for i in range(5, -1, -1):
        d = today - datetime.timedelta(days=i*30)
        date_str = d.strftime("%Y-%m")
        trends.append({
            "date": date_str,
            "cost": round(base_cost - (5 - i) * 35.0 - (10.0 if i == 0 else 0.0), 2)
        })
    return trends
