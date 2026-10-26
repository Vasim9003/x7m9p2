# Wind Power Intelligence Dashboard

A full-stack web application designed to visualize and analyze Day-Ahead Wind Power Forecasting against Actual Generation. This dashboard provides interactive data visualization, real-time sync status, and interval-based error variance analysis.

## 🚀 Live Demo
- **Frontend (Vercel):** https://frontend-git-main-alpha-60d2.vercel.app/
- **Backend API (Render):** https://wind-power-api.onrender.com/docs

## 🛠️ Tech Stack

**Frontend:**
- React.js
- Tailwind CSS (for responsive UI)
- Recharts (for interactive data visualization)
- Axios (for HTTP requests)
- Vercel (Deployment)

**Backend:**
- Python 3.x
- FastAPI (High-performance API framework)
- Uvicorn (ASGI server)
- Docker & Docker Compose (Containerization)
- Render (Cloud Deployment)

## 📂 Project Architecture

The repository is structured into two main directories to separate the client and server codebases:

```text
├── backend/
│   ├── main.py              # FastAPI application entry point
│   ├── requirements.txt     # Python dependencies
│   ├── Dockerfile           # Docker configuration for production
│   └── docker-compose.yml   # Multi-container orchestration for local development
└── frontend/
    ├── src/
    │   ├── App.jsx          # Main React component & Dashboard UI
    │   └── main.jsx         # React DOM rendering
    ├── package.json         # Node.js dependencies
    └── tailwind.config.js   # Tailwind styling configurations
````
## ⚙️ Local Development Setup
Prerequisites
Node.js (v16 or higher)

Python 3.10+

Docker & Docker Desktop (Optional but recommended)

1. Backend Setup
You can run the backend either directly using Python or via Docker.
Using Docker (Recommended):
```
cd backend
docker-compose up --build
````
Using Python:
```
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```
The backend API will be available at http://localhost:8000.

### 2. Frontend Setup
Open a new terminal window and run:

```
cd frontend
npm install
npm run dev
```
The React frontend will be available at http://localhost:5173

## 📊 Key Features
- Comparative Trend Analysis: Line charts comparing actual vs. forecasted wind power generation.

- Error Variance Tracking: Bar charts highlighting under-forecasting (positive variance) and over-forecasting (negative variance).

- Dynamic Tooltips: Custom interactive tooltips displaying exact MW metrics and timestamps.

- Production Ready: Fully dockerized backend deployed on Render, integrating seamlessly with a Vercel-hosted frontend.

## 📝 API Endpoints

- GET /api/wind-data - Fetches the historical and forecasted wind power generation data.

- GET /docs - Swagger UI for API testing and documentation.
