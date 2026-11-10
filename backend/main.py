import os
import time
from collections import defaultdict
from fastapi import FastAPI, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from database import engine, Base
from seed_data import seed_database
from routers import (
    auth_router,
    schemes_router,
    eligibility_router,
    chat_router,
    documents_router,
    applications_router,
    notifications_router,
    admin_router
)

# Initialize database schema
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Jan Setu AI API (जन सेतु)",
    description="Intelligent Citizen-Assistance Platform for Indian Public Schemes",
    version="1.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc"
)

# Configure CORS
allowed_origins = [
    orig.strip()
    for orig in os.getenv("ALLOWED_ORIGINS", "http://localhost:3000,http://127.0.0.1:3000,http://localhost:8000").split(",")
    if orig.strip()
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins if os.getenv("ENVIRONMENT") == "production" else ["*"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

# In-memory sliding window rate limiter
_rate_limit_records = defaultdict(list)

@app.middleware("http")
async def rate_limiting_middleware(request: Request, call_next):
    # Exclude health check and OpenAPI docs
    path = request.url.path
    if path in ["/api/health", "/api/docs", "/api/redoc", "/openapi.json"] or request.method == "OPTIONS":
        return await call_next(request)

    client_ip = request.client.host if request.client else "unknown"
    now = time.time()
    window = 60.0  # 1 minute sliding window

    # Strict threshold for authentication endpoints to prevent brute force
    is_auth_endpoint = "/api/auth/login" in path or "/api/auth/register" in path
    max_requests = 20 if is_auth_endpoint else 120

    _rate_limit_records[client_ip] = [t for t in _rate_limit_records[client_ip] if now - t < window]
    if len(_rate_limit_records[client_ip]) >= max_requests:
        return JSONResponse(
            status_code=429,
            content={"detail": "Request threshold exceeded. Please try again after 60 seconds."}
        )

    _rate_limit_records[client_ip].append(now)
    return await call_next(request)

# Comprehensive Security Headers Middleware
@app.middleware("http")
async def add_security_headers(request: Request, call_next):
    response: Response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    response.headers["Permissions-Policy"] = "geolocation=(), camera=(), microphone=(self)"
    return response

# Mount API Routers
app.include_router(auth_router.router)
app.include_router(schemes_router.router)
app.include_router(eligibility_router.router)
app.include_router(chat_router.router)
app.include_router(documents_router.router)
app.include_router(applications_router.router)
app.include_router(notifications_router.router)
app.include_router(admin_router.router)

@app.on_event("startup")
def startup_event():
    # Automatically seed verified authentic schemes on launch
    try:
        seed_database()
    except Exception as e:
        print(f"Startup seed notice: {e}")

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "service": "Jan Setu AI Backend",
        "state": "Karnataka & National Coverage",
        "version": "1.0.0",
        "rules_engine": "deterministic",
        "security_posture": "strict",
        "rate_limiting": "enabled"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
