# ⚡ CostPilot - Cloud Cost Optimization & Analytics Platform

<div align="center">

![CostPilot Banner](https://img.shields.io/badge/CostPilot-Cloud%20Cost%20Optimization-6366f1?style=for-the-badge&logo=amazonaws&logoColor=white)

[![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com/)
[![Nginx](https://img.shields.io/badge/Nginx-009639?style=for-the-badge&logo=nginx&logoColor=white)](https://nginx.org/)

**Intelligent AWS Cloud Infrastructure Cost Monitoring, Resource Right-sizing, and Cost-Saving Platform.**

[Features](#-key-features) • [Tech Stack](#-tech-stack) • [Quick Start (Docker)](#-quick-start-with-docker-compose) • [AWS Deployment](#-aws-deployment-guide) • [API Documentation](#-api-endpoints)

</div>

---

## 🌟 Key Features

- **📊 Comprehensive Cost Dashboard**: Real-time tracking of total infrastructure spend, active cloud resources, estimated monthly savings, and historical cost trends.
- **💡 AI-Powered Optimization Recommendations**: Detect idle EC2 instances, unattached EBS volumes, outdated instance types, and over-provisioned resources with automated cost-saving recommendations.
- **⚡ Resource Management**: View, filter, and inspect detailed metrics across EC2, RDS, EBS, S3, and more.
- **🧪 Simulation & Dataset Upload**: Test cost optimization scenarios by uploading custom CSV infrastructure datasets or resetting to initial state.
- **🔒 Secure Authentication**: Full JWT-based user authentication and bcrypt password hashing.
- **🐳 Production Ready**: Single-command deployment using Docker Compose with an embedded Nginx reverse proxy.

---

## 🛠️ Tech Stack

### **Frontend**
- **Framework**: React 18 + Vite
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Charts**: Recharts
- **HTTP Client**: Axios

### **Backend**
- **Framework**: FastAPI (Python 3.11)
- **Database**: PostgreSQL 15
- **ORM**: SQLAlchemy
- **Authentication**: JWT & Passlib (Bcrypt)
- **AWS Integration**: Boto3 / CloudWatch / Cost Explorer / Simulator

### **DevOps & Infrastructure**
- **Web Server / Reverse Proxy**: Nginx (Production multi-stage build)
- **Containerization**: Docker & Docker Compose

---

## 📁 Repository Structure

```
CostPilot-Platform/
├── backend/                  # FastAPI Application
│   ├── app/
│   │   ├── aws/              # AWS Boto3 Integration & Simulator
│   │   ├── routers/          # API Endpoints (Auth, Dashboard, Resources, Recs)
│   │   ├── database.py       # Database Session & Connection
│   │   ├── models.py         # SQLAlchemy Database Models
│   │   └── main.py           # FastAPI Entry Point
│   ├── Dockerfile
│   └── requirements.txt
├── frontend/                 # React SPA (Vite)
│   ├── src/
│   │   ├── components/       # UI Components (Sidebar, Navbar, Cards)
│   │   ├── pages/            # Login, Register, Dashboard, Recommendations
│   │   └── api.js            # Axios API Configuration
│   ├── nginx.conf            # Nginx Reverse Proxy Config
│   ├── Dockerfile            # Multi-stage Docker Build
│   └── package.json
└── docker-compose.yml        # Unified Multi-Container Services Setup
```

---

## 🚀 Quick Start with Docker Compose

Running the entire stack locally or on a server requires only Docker & Docker Compose:

### 1. Clone the Repository
```bash
git clone https://github.com/KRISHNAJAISWAL04/CostPilot-Platform.git
cd CostPilot-Platform
```

### 2. Launch Services
```bash
docker-compose up --build -d
```

### 3. Open in Browser
- **Frontend App**: [http://localhost](http://localhost) (or `http://localhost:5173`)
- **Backend API Docs (Swagger UI)**: [http://localhost:8000/docs](http://localhost:8000/docs)

---

## ☁️ AWS Deployment Guide (EC2)

Follow these steps to deploy CostPilot on an AWS EC2 instance:

### Step 1: Launch EC2 Instance
- OS: **Ubuntu 22.04 LTS** or **Amazon Linux 2023**
- Instance Type: `t3.micro` or `t3.small`
- Security Group Rules:
  - **HTTP (Port 80)**: Source `0.0.0.0/0`
  - **SSH (Port 22)**: Source `Your IP`
  - *(Optional)* **FastAPI (Port 8000)**: Source `0.0.0.0/0`

### Step 2: Install Docker & Docker Compose
```bash
sudo apt update && sudo apt install -y docker.io docker-compose
sudo systemctl enable --now docker
sudo usermod -aG docker $USER
# Log out and log back in for docker permissions to take effect
```

### Step 3: Deploy Application
```bash
git clone https://github.com/KRISHNAJAISWAL04/CostPilot-Platform.git
cd CostPilot-Platform
docker-compose up --build -d
```

### Step 4: Access Platform
Open **`http://<YOUR_EC2_PUBLIC_IP>`** in your web browser.

---

## 📡 API Endpoints Summary

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Register a new user |
| `POST` | `/api/auth/login` | Login and receive JWT bearer token |
| `GET` | `/api/dashboard/summary` | Fetch dashboard cost summary & trends |
| `POST` | `/api/dashboard/upload` | Upload CSV dataset for custom infrastructure simulation |
| `GET` | `/api/resources` | List all cloud resources and metrics |
| `GET` | `/api/recommendations` | Get active cost-saving recommendations |
| `POST` | `/api/recommendations/{id}/apply` | Apply a cost optimization action |

---

## 📝 License

Distributed under the MIT License. See `LICENSE` for details.

---

<div align="center">
  Made with ❤️ by <a href="https://github.com/KRISHNAJAISWAL04">KRISHNAJAISWAL04</a>
</div>
